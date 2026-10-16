import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/controllers/auth/auth-context';
import { useSeniorLink } from '@/controllers/linking/link-context';
import { useSchedules } from '@/controllers/schedules/schedule-context';
import { useSeniors } from '@/controllers/seniors/senior-context';
import { buildHomeCarePlan } from '@/models/health/care-plan';
import { createHealthEntryForm, healthFormToReading, healthFormToSymptoms, validateHealthEntryForm, type HealthEntryFormValues, type HealthEntryMode } from '@/models/health/health-form-model';
import { filterReadingsByWindow, getHealthChartPoints, getHealthMetricUnit, latestReadingsByKind, toLocalDateKey } from '@/models/health/health-model';
import type { HealthHistoryWindow, HealthMetricKind, HealthReading, SymptomEntry } from '@/models/health/types';
import type { ScheduleKind } from '@/models/schedules/types';

import { useHealth } from './health-context';

export type HealthTimelineItem = { type: 'reading'; record: HealthReading } | { type: 'symptoms'; record: SymptomEntry };

function newestFirst(a: { recordedAt: string; createdAt: string }, b: { recordedAt: string; createdAt: string }) {
  return Date.parse(b.recordedAt) - Date.parse(a.recordedAt) || Date.parse(b.createdAt) - Date.parse(a.createdAt);
}

export function useHealthHomeController() {
  const { user } = useAuth();
  const { profiles } = useSeniors();
  const { linkedSenior } = useSeniorLink();
  const { readings: accessibleReadings, symptoms: accessibleSymptoms, createReading, createSymptoms } = useHealth();
  const { schedules } = useSchedules();
  const role = user?.role === 'family' ? 'family' as const : 'senior' as const;
  const [selectedId, setSelectedId] = useState<string>();
  const selectedSenior = role === 'family' ? profiles.find((profile) => profile.id === selectedId) ?? profiles[0] : linkedSenior;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetricKind>('blood-pressure');
  const [range, setRange] = useState<HealthHistoryWindow>(7);
  const [entry, setEntry] = useState<{ mode: HealthEntryMode; seniorId: string; ownerId: string } | null>(null);
  const [entryValues, setEntryValues] = useState(createHealthEntryForm);
  const [entryErrors, setEntryErrors] = useState<Partial<Record<keyof HealthEntryFormValues, string>>>({});
  const [entrySubmitError, setEntrySubmitError] = useState<string>();
  const submitLock = useRef(false);

  const readings = accessibleReadings.filter((item) => item.seniorId === selectedSenior?.id);
  const symptoms = accessibleSymptoms.filter((item) => item.seniorId === selectedSenior?.id);
  const latestReadings = latestReadingsByKind(readings);
  const glucose = latestReadings['blood-glucose'];
  const glucoseUnit = glucose?.kind === 'blood-glucose' ? glucose.unit : 'mmol/L';
  const chartUnit = getHealthMetricUnit(selectedMetric, glucoseUnit);
  const chartPoints = getHealthChartPoints(readings, selectedMetric, range, { now, glucoseUnit });
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - range + 1);
  windowStart.setHours(0, 0, 0, 0);
  const timeline: HealthTimelineItem[] = [
    ...filterReadingsByWindow(readings, range, now).map((record) => ({ type: 'reading' as const, record })),
    ...symptoms.filter((item) => Date.parse(item.recordedAt) >= windowStart.getTime() && Date.parse(item.recordedAt) <= now.getTime()).map((record) => ({ type: 'symptoms' as const, record })),
  ].reverse().sort((a, b) => newestFirst(a.record, b.record));
  const today = toLocalDateKey(now);
  const todaySymptoms = symptoms.filter((item) => toLocalDateKey(item.recordedAt) === today).reverse().sort(newestFirst)[0];
  const readingsTodayCount = readings.filter((item) => toLocalDateKey(item.recordedAt) === today).length;
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const allRecords = [...readings, ...symptoms].reverse().sort(newestFirst);
  const recordedDays = new Set(allRecords.filter((item) => Date.parse(item.recordedAt) >= weekStart.getTime()).map((item) => toLocalDateKey(item.recordedAt))).size;

  const closeEntry = () => setEntry(null);
  const openEntry = (mode: HealthEntryMode) => {
    if (user?.role !== 'family' || !selectedSenior) return;
    setNow(new Date());
    setEntryValues(createHealthEntryForm());
    setEntryErrors({});
    setEntrySubmitError(undefined);
    submitLock.current = false;
    setEntry({ mode, seniorId: selectedSenior.id, ownerId: user.id });
  };
  const changeEntryField = (field: keyof HealthEntryFormValues, value: string) => {
    setEntryValues((current) => {
      if (field === 'kind' && value !== current.kind) return { ...current, kind: value as HealthMetricKind, systolic: '', diastolic: '', value: '' };
      if (field === 'unit' && value !== current.unit) return { ...current, unit: value as HealthEntryFormValues['unit'], value: '' };
      return { ...current, [field]: value };
    });
    setEntryErrors((current) => {
      if (field === 'kind' || field === 'unit') return {};
      if (field === 'date' || field === 'time') return { ...current, date: undefined, time: undefined };
      if (field === 'symptoms' || field === 'customSymptom') return { ...current, symptoms: undefined, customSymptom: undefined };
      return { ...current, [field]: undefined };
    });
    setEntrySubmitError(undefined);
  };
  const saveEntry = () => {
    if (!entry || submitLock.current) return;
    if (user?.role !== 'family' || user.id !== entry.ownerId || selectedSenior?.id !== entry.seniorId) {
      setEntrySubmitError('Hồ sơ hoặc phiên đăng nhập đã thay đổi. Vui lòng mở lại biểu mẫu.');
      return;
    }
    const errors = validateHealthEntryForm(entry.mode, entry.seniorId, entryValues);
    setEntryErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    submitLock.current = true;
    try {
      if (entry.mode === 'reading') createReading(healthFormToReading(entry.seniorId, entryValues));
      else createSymptoms(healthFormToSymptoms(entry.seniorId, entryValues));
      if (entry.mode === 'reading') setSelectedMetric(entryValues.kind);
      setNow(new Date());
      closeEntry();
    } catch (error) {
      submitLock.current = false;
      setEntrySubmitError(error instanceof Error ? error.message : 'Chưa thể lưu. Vui lòng thử lại.');
    }
  };
  const openSchedules = (kind: ScheduleKind) => router.navigate({
    pathname: role === 'family' ? '/family-medications' : '/senior-medications',
    params: { kind, seniorId: selectedSenior?.id, request: String(Date.now()) },
  });
  return {
    role, profiles, selectedSenior, selectSenior: (id: string) => { closeEntry(); setSelectedId(id); },
    dateLabel: now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }),
    latestReadings, readings, symptoms, todaySymptoms, readingsTodayCount, recordedDays,
    lastUpdatedAt: allRecords[0]?.recordedAt, selectedMetric, setSelectedMetric, range, setRange, chartPoints, chartUnit,
    timeline, carePlan: buildHomeCarePlan(schedules, selectedSenior?.id, now),
    openReading: () => openEntry('reading'), openSymptoms: () => openEntry('symptoms'), openFamily: () => router.navigate('/add-more-senior'), openSchedules,
    entryMode: entry?.ownerId === user?.id ? entry?.mode ?? null : null,
    entryValues, entryErrors, entrySubmitError, changeEntryField, saveEntry, closeEntry,
  };
}

export type HealthHomeController = ReturnType<typeof useHealthHomeController>;
