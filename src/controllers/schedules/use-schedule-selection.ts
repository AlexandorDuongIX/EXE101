import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import type { ScheduleKind } from '@/models/schedules/types';

export function useScheduleSelection() {
  const params = useLocalSearchParams<{ kind?: string; seniorId?: string; request?: string }>();
  const routeKey = JSON.stringify([params.kind, params.seniorId, params.request]);
  const routeSelection = { routeKey, kind: params.kind === 'appointment' ? 'appointment' as const : 'medication' as const, seniorId: params.seniorId };
  const [selection, setSelection] = useState(routeSelection);
  const current = selection.routeKey === routeKey ? selection : routeSelection;
  return {
    selectedKind: current.kind,
    selectedId: current.seniorId,
    setSelectedKind: (kind: ScheduleKind) => setSelection({ ...current, kind }),
    setSelectedId: (seniorId: string) => setSelection({ ...current, seniorId }),
  };
}
