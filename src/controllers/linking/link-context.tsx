import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';

import { useAuth } from '@/controllers/auth/auth-context';
import { useSeniors } from '@/controllers/seniors/senior-context';
import { createLinkRepository, type LinkCode } from '@/models/linking';
import type { Senior } from '@/models/seniors/types';

type LinkContextValue = {
  linkedSenior: Senior | undefined;
  getLinkedSeniorId: () => string | undefined;
  getProfileLinkStatus: (seniorId: string) => boolean;
  issueCode: (seniorId: string, forceNew?: boolean) => LinkCode;
  linkSenior: (code: string) => Senior;
};

const LinkContext = createContext<LinkContextValue | null>(null);

export function LinkProvider({ children }: PropsWithChildren) {
  const { getCurrentUser } = useAuth();
  const { getProfileForLinking } = useSeniors();
  const [repository] = useState(() => createLinkRepository(getCurrentUser, getProfileForLinking));
  const [, setRevision] = useState(0);
  const getLinkedSeniorId = useCallback(() => repository.getLinkedSeniorId(), [repository]);
  const getProfileLinkStatus = useCallback((id: string) => repository.getProfileLinkStatus(id), [repository]);

  const issueCode = useCallback((id: string, forceNew = false) => {
    const code = repository.issueCode(id, forceNew);
    setRevision((revision) => revision + 1);
    return code;
  }, [repository]);

  const linkSenior = useCallback((code: string) => {
    const senior = repository.linkSenior(code);
    setRevision((revision) => revision + 1);
    return senior;
  }, [repository]);

  return (
    <LinkContext.Provider value={{ linkedSenior: repository.getLinkedSenior(), getLinkedSeniorId, getProfileLinkStatus, issueCode, linkSenior }}>
      {children}
    </LinkContext.Provider>
  );
}

export function useSeniorLink(): LinkContextValue {
  const context = useContext(LinkContext);
  if (!context) throw new Error('useSeniorLink cần nằm trong LinkProvider.');
  return context;
}
