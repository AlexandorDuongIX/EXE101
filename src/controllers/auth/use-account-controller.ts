import { router } from 'expo-router';
import { useState } from 'react';

import { useAuth } from './auth-context';

export function useAccountController() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const signOut = () => {
    setOpen(false);
    logout();
    router.replace('/login');
  };
  return { user, open: open && !!user, show: () => setOpen(true), close: () => setOpen(false), signOut };
}
