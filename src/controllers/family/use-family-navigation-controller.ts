import { usePathname } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/controllers/auth/auth-context';

export function useFamilyNavigationController() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [selection, setSelection] = useState<{ pathname: string; key: string } | null>(null);
  const activeTab = selection?.pathname === pathname
    ? selection.key
    : pathname === '/add-more-senior' ? 'gia-dinh'
      : pathname === '/family-medications' ? 'thuoc' : 'trang-chu';
  const redirectHref: '/senior-home' | '/login' | null = !user || user.role !== 'family'
    ? user?.role === 'senior' ? '/senior-home' : '/login'
    : null;

  const handleTabPress = (
    tabKey: string,
    navigate: (routeName: 'family-home' | 'family-medications' | 'add-more-senior') => void,
  ) => {
    if (tabKey === 'thuoc') {
      setSelection(null);
      navigate('family-medications');
      return;
    }
    if (tabKey === 'gia-dinh') {
      setSelection(null);
      navigate('add-more-senior');
      return;
    }

    if (tabKey === 'trang-chu') {
      setSelection(null);
      navigate('family-home');
      return;
    }

    setSelection({ pathname, key: tabKey });
  };

  return { redirectHref, activeTab, handleTabPress };
}
