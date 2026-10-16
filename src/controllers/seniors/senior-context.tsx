import React, { createContext, useCallback, useContext, useState } from 'react';

import { useAuth } from '../auth/auth-context';

import { createDemoSeniorRepository } from '@/models/seniors/senior-repository';
import type { CreateSeniorInput, Senior } from '@/models/seniors/types';

type SeniorContextValue = {
  profiles: readonly Senior[];
  getProfiles: () => readonly Senior[];
  getProfileForLinking: (id: string) => Senior | undefined;
  createSenior: (input: CreateSeniorInput) => Promise<Senior>;
};

const SeniorContext = createContext<SeniorContextValue | null>(null);

export function SeniorProvider({ children }: React.PropsWithChildren) {
  const { getCurrentUser } = useAuth();
  const [repository] = useState(() => createDemoSeniorRepository(getCurrentUser));
  const [, setRevision] = useState(0);
  const getProfiles = useCallback(() => repository.list(), [repository]);
  const getProfileForLinking = useCallback((id: string) => repository.getByIdForLinking(id), [repository]);

  const createSenior = useCallback(
    async (input: CreateSeniorInput) => {
      const created = await repository.create(input);
      setRevision((current) => current + 1);
      return created;
    },
    [repository]
  );

  // Auth context changes re-render the provider; completed writes do so above.
  const value = { profiles: repository.list(), getProfiles, getProfileForLinking, createSenior };

  return <SeniorContext.Provider value={value}>{children}</SeniorContext.Provider>;
}

export function useSeniors(): SeniorContextValue {
  const context = useContext(SeniorContext);
  if (!context) throw new Error('useSeniors cần nằm trong SeniorProvider.');
  return context;
}
