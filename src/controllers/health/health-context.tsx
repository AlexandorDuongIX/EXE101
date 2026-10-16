import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';

import { useAuth } from '@/controllers/auth/auth-context';
import { useSeniorLink } from '@/controllers/linking/link-context';
import { useSeniors } from '@/controllers/seniors/senior-context';
import { createHealthRepository } from '@/models/health/health-repository';
import type { HealthReading, HealthReadingInput, SymptomEntry, SymptomEntryInput } from '@/models/health/types';

type HealthContextValue = {
  readings: readonly HealthReading[];
  symptoms: readonly SymptomEntry[];
  createReading: (input: HealthReadingInput) => HealthReading;
  createSymptoms: (input: SymptomEntryInput) => SymptomEntry;
};

const HealthContext = createContext<HealthContextValue | null>(null);

export function HealthProvider({ children }: PropsWithChildren) {
  const { getCurrentUser } = useAuth();
  const { getProfiles } = useSeniors();
  const { getLinkedSeniorId } = useSeniorLink();
  const [repository] = useState(() => createHealthRepository(getCurrentUser, getProfiles, getLinkedSeniorId));
  const [, setRevision] = useState(0);
  const createReading = useCallback((input: HealthReadingInput) => {
    const reading = repository.createReading(input);
    setRevision((value) => value + 1);
    return reading;
  }, [repository]);
  const createSymptoms = useCallback((input: SymptomEntryInput) => {
    const entry = repository.createSymptoms(input);
    setRevision((value) => value + 1);
    return entry;
  }, [repository]);
  return <HealthContext.Provider value={{ readings: repository.listReadings(), symptoms: repository.listSymptoms(), createReading, createSymptoms }}>{children}</HealthContext.Provider>;
}

export function useHealth() {
  const value = useContext(HealthContext);
  if (!value) throw new Error('useHealth cần nằm trong HealthProvider.');
  return value;
}
