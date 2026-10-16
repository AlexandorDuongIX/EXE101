import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard } from 'react-native';

import { useAuth } from '@/controllers/auth/auth-context';

import { useSeniorLink } from './link-context';

export function useLinkSeniorController() {
  const { user, logout } = useAuth();
  const { linkedSenior, linkSenior } = useSeniorLink();
  const [code, updateCode] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);
  const redirectHref: '/login' | '/family-home' | '/senior-home' | null = !user
    ? '/login' : user.role === 'family' ? '/family-home'
      : user.role !== 'senior' ? '/login' : linkedSenior ? '/senior-home' : null;

  const setCode = (value: string) => {
    updateCode(value.replace(/\D/g, '').slice(0, 6));
    setError(undefined);
  };

  const submit = () => {
    if (inFlight.current || code.length !== 6 || user?.role !== 'senior') return;
    inFlight.current = true;
    setLoading(true);
    Keyboard.dismiss();
    try {
      linkSenior(code);
      router.replace('/senior-home');
    } catch (cause) {
      inFlight.current = false;
      setLoading(false);
      setError(cause instanceof Error ? cause.message : 'Chưa thể liên kết. Vui lòng thử lại.');
    }
  };

  const changeAccount = () => {
    logout();
    router.replace('/login');
  };

  return { redirectHref, code, setCode, submit, error, loading, changeAccount };
}
