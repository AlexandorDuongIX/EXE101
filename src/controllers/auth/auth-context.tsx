import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { authenticateDemoLogin } from '@/models/auth/demo-auth-service';
import type { AuthUser, DemoLoginInput } from '@/models/auth/types';

type AuthContextValue = {
  user: AuthUser | null;
  login: (input: DemoLoginInput) => Promise<AuthUser>;
  logout: () => void;
  // Services read the live session, including changes before React re-renders.
  getCurrentUser: () => AuthUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const sessionRef = useRef<AuthUser | null>(null);
  const sessionVersion = useRef(0);

  const login = useCallback(async (input: DemoLoginInput) => {
    const version = ++sessionVersion.current;
    const authenticatedUser = await authenticateDemoLogin(input);
    if (version !== sessionVersion.current) {
      throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng thử lại.');
    }
    sessionRef.current = authenticatedUser;
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const logout = useCallback(() => {
    sessionVersion.current += 1;
    sessionRef.current = null;
    setUser(null);
  }, []);

  const getCurrentUser = useCallback(() => sessionRef.current, []);
  const value = useMemo(
    () => ({ user, login, logout, getCurrentUser }),
    [user, login, logout, getCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth cần nằm trong AuthProvider.');
  return context;
}
