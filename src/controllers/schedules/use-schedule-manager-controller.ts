import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard } from 'react-native';

import { useAuth } from '@/controllers/auth/auth-context';
import { useSeniors } from '@/controllers/seniors/senior-context';
import {
  createEmptyScheduleForm, scheduleFormToInput, scheduleToFormValues, type ScheduleFormValues,
} from '@/models/schedules/form-model';
import { validateScheduleInput } from '@/models/schedules/schedule-model';
import type { CareSchedule, ScheduleKind } from '@/models/schedules/types';

import { useSchedules } from './schedule-context';
import { useScheduleSelection } from './use-schedule-selection';

type Editor = { kind: ScheduleKind; seniorId: string; id?: string; ownerId: string };

export function useScheduleManagerController() {
  const { user } = useAuth();
  const { profiles } = useSeniors();
  const { schedules, createSchedule, updateSchedule, deleteSchedule } = useSchedules();
  const { selectedId, setSelectedId, selectedKind, setSelectedKind } = useScheduleSelection();
  const selectedSenior = profiles.find((profile) => profile.id === selectedId) ?? profiles[0];
  const [editor, setEditor] = useState<Editor | null>(null);
  const [values, setValues] = useState<ScheduleFormValues>(createEmptyScheduleForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ScheduleFormValues, string>>>({});
  const [submitError, setSubmitError] = useState<string>();
  const [pendingDelete, setPendingDelete] = useState<CareSchedule | null>(null);
  const [deleteError, setDeleteError] = useState<string>();
  const saveLock = useRef(false);
  const deleteLock = useRef(false);

  const openAdd = () => {
    if (!selectedSenior || user?.role !== 'family') return;
    setValues(createEmptyScheduleForm());
    setFieldErrors({});
    setSubmitError(undefined);
    saveLock.current = false;
    setEditor({ kind: selectedKind, seniorId: selectedSenior.id, ownerId: user.id });
  };

  const openEdit = (schedule: CareSchedule) => {
    if (user?.role !== 'family' || schedule.ownerId !== user.id) return;
    setValues(scheduleToFormValues(schedule));
    setFieldErrors({});
    setSubmitError(undefined);
    saveLock.current = false;
    setEditor({ kind: schedule.kind, seniorId: schedule.seniorId, id: schedule.id, ownerId: user.id });
  };

  const changeField = (field: keyof ScheduleFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(undefined);
  };

  const closeEditor = () => {
    Keyboard.dismiss();
    setEditor(null);
  };

  const save = () => {
    if (!editor || saveLock.current) return;
    if (user?.role !== 'family' || user.id !== editor.ownerId) {
      setSubmitError('Phiên đăng nhập đã thay đổi. Vui lòng mở lại lịch.');
      return;
    }
    const input = scheduleFormToInput(editor.kind, editor.seniorId, values);
    const errors = validateScheduleInput(input);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    saveLock.current = true;
    try {
      if (editor.id) updateSchedule(editor.id, input);
      else createSchedule(input);
      closeEditor();
    } catch (error) {
      saveLock.current = false;
      setSubmitError(error instanceof Error ? error.message : 'Chưa thể lưu lịch. Vui lòng thử lại.');
    }
  };

  const requestDelete = (schedule: CareSchedule) => {
    if (user?.role !== 'family' || schedule.ownerId !== user.id) return;
    deleteLock.current = false;
    setDeleteError(undefined);
    setPendingDelete(schedule);
  };

  const confirmDelete = () => {
    if (!pendingDelete || deleteLock.current) return;
    deleteLock.current = true;
    try {
      deleteSchedule(pendingDelete.id);
      setPendingDelete(null);
    } catch (error) {
      deleteLock.current = false;
      setDeleteError(error instanceof Error ? error.message : 'Chưa thể xóa lịch. Vui lòng thử lại.');
    }
  };

  return {
    profiles, selectedSenior, setSelectedId, selectedKind, setSelectedKind,
    schedules: schedules.filter((schedule) => schedule.seniorId === selectedSenior?.id),
    editor: editor?.ownerId === user?.id ? editor : null,
    values, fieldErrors, submitError, changeField, openAdd, openEdit, closeEditor, save,
    pendingDelete, deleteError, requestDelete, confirmDelete, cancelDelete: () => setPendingDelete(null),
    openRelatives: () => router.navigate('/add-more-senior'),
  };
}
