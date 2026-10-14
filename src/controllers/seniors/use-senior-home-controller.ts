import { useMemo, useState } from 'react';
import { Alert, Linking } from 'react-native';

import { getVietnameseDate, SENIOR_HOME_DEMO } from '@/models/seniors/senior-home-model';

export function useSeniorHomeController() {
  const [activeTab, setActiveTab] = useState('trang-chu');
  const dateStr = useMemo(() => getVietnameseDate(), []);

  // ── Handlers ──
  const handleSOS = () => {
    Alert.alert(
      'GỌI KHẨN CẤP',
      'Gọi ngay cho Con Hoàng hoặc Cứu thương 115?',
      [
        { text: 'Con Hoàng', onPress: () => Linking.openURL('tel:0901234567') },
        { text: 'Cứu thương 115', style: 'destructive', onPress: () => Linking.openURL('tel:115') },
        { text: 'Hủy', style: 'cancel' },
      ],
    );
  };

  const handleVoiceRead = () => {
    Alert.alert('Đọc to', 'Đang đọc to nội dung trang cho Bác…');
  };

  const handleMedConfirm = () => {
    Alert.alert('Ghi nhận', 'Đã ghi nhận Bác đã uống thuốc huyết áp Amlodipine. Bác nhớ nghỉ ngơi trưa nhé!');
  };

  return {
    dashboard: SENIOR_HOME_DEMO,
    activeTab,
    setActiveTab,
    dateStr,
    handleSOS,
    handleVoiceRead,
    handleMedConfirm,
  };
}
