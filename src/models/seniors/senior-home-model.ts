// ─── Helpers ──────────────────────────────────────────────
export const getVietnameseDate = (): string => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const now = new Date();
  return `${days[now.getDay()]}, ngày ${now.getDate()} Tháng ${now.getMonth() + 1}`;
};

// ─── Mock Data ────────────────────────────────────────────
export const SENIOR_HOME_DEMO = {
  user: {
    name: 'Bác Lan',
    initials: 'BL',
  },
  medications: [
    {
      name: 'Amlodipine (Huyết áp)',
      description: '1 viên tròn màu trắng',
      instruction: 'Sau bữa trưa 15 phút với nước ấm',
    },
  ],
  familyNote: {
    senderName: 'Con Hoàng',
    senderInitials: 'H',
    message: '"Mẹ nhớ uống ly nước ấm đầy và ngủ trưa một lát mẹ nhé! Chiều con mua bánh mẹ thích về thăm mẹ ạ! ❤️"',
    timeAgo: '10 phút trước',
  },
  healthMetrics: [
    { title: 'Huyết áp', value: '125/82', unit: 'mmHg', status: 'success' as const, statusLabel: 'Rất Đẹp' },
    { title: 'Đường huyết', value: '6.1', unit: 'mmol/L', status: 'success' as const, statusLabel: 'Bình thường' },
  ],
  contacts: [
    {
      name: 'Con Trai (Hoàng)',
      subtitle: 'Số thường gọi nhất',
      initials: 'H',
      phoneNumber: '0901234567',
      variant: 'family' as const,
    },
    {
      name: 'Con Gái (Lan Anh)',
      subtitle: 'Bấm gọi thoại ngay',
      initials: 'LA',
      phoneNumber: '0912345678',
      variant: 'family' as const,
    },
    {
      name: 'Bác Sĩ Tuấn',
      subtitle: 'Bác sĩ gia đình phụ trách',
      initials: 'BS',
      phoneNumber: '0987654321',
      variant: 'doctor' as const,
    },
  ],
};
