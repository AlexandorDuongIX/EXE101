import { usePathname } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/controllers/auth/auth-context';
import { useSeniorLink } from '@/controllers/linking/link-context';

type SeniorTabRoute = 'senior-home' | 'senior-medications';

export function useSeniorNavigationController() {
  const { user } = useAuth();
  const { linkedSenior } = useSeniorLink();
  const pathname = usePathname();
  const [selection, setSelection] = useState<{ pathname: string; key: string } | null>(null);
  const activeTab = selection?.pathname === pathname
    ? selection.key
    : pathname === '/senior-medications' ? 'thuoc' : 'trang-chu';
  const redirectHref: '/family-home' | '/login' | '/link-senior' | null = !user || user.role !== 'senior'
    ? user?.role === 'family' ? '/family-home' : '/login'
    : !linkedSenior ? '/link-senior' : null;

  const handleTabPress = (tabKey: string, navigate: (routeName: SeniorTabRoute) => void) => {
    if (tabKey === 'trang-chu' || tabKey === 'thuoc') {
      setSelection(null);
      navigate(tabKey === 'thuoc' ? 'senior-medications' : 'senior-home');
      return;
    }

    setSelection({ pathname, key: tabKey });
  };

  return { redirectHref, activeTab, handleTabPress };
}
