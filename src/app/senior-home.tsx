/**
 * Senior Home Screen — Main dashboard when an elderly user logs in.
 *
 * Sections (matching the HTML design):
 * 1. Greeting + voice read button
 * 2. SOS Emergency Card
 * 3. Medication Reminder
 * 4. Family Love Note
 * 5. Daily Mood Check-in
 * 6. Health Indicators
 * 7. Speed Dial Contacts
 *
 * Bottom Navigation: Floating pill-shaped nav, hides on scroll,
 * reappears ~1.5 s after scroll stops.
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Hand } from 'lucide-react-native';

import { Text, AppIcon, Avatar, SeniorIcon } from '@/components/ui';
import { Colors, Rounded, Shadows, Spacing } from '@/constants/theme';
import { useScrollVisibility } from '@/hooks/use-scroll-visibility';

import {
  SosEmergencyCard,
  MedicationReminderCard,
  FamilyNoteCard,
  MoodSelector,
  HealthIndicatorGrid,
  SpeedDialContact,
  PillNavBar,
} from '@/components/senior';

// ─── Helpers ──────────────────────────────────────────────
const getVietnameseDate = (): string => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const now = new Date();
  return `${days[now.getDay()]}, ngày ${now.getDate()} Tháng ${now.getMonth() + 1}`;
};

// ─── Mock Data ────────────────────────────────────────────
const MOCK = {
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

// ─── Component ────────────────────────────────────────────
export default function SeniorHomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('trang-chu');
  const dateStr = useMemo(getVietnameseDate, []);

  // PillNavBar scroll-driven visibility
  const {
    animatedStyle,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollEnd,
  } = useScrollVisibility({ showDelay: 700 });

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ═══ Fixed Header ═══ */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <AppIcon size={28} />
          </View>
          <View>
            <View style={styles.brandRow}>
              <Text variant="labelLg" bold color={Colors.primary} style={{ fontSize: 19 }}>
                KithCare
              </Text>
              <View style={styles.seniorBadge}>
                <Text variant="bodySm" bold color={Colors.primaryContainer} style={{ fontSize: 11 }}>
                  Cao tuổi
                </Text>
              </View>
            </View>
            <Text variant="bodySm" color={Colors.onSurfaceVariant} style={{ fontSize: 12 }}>
              Chăm sóc & Kết nối
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Mini SOS */}
          <TouchableOpacity
            onPress={handleSOS}
            style={styles.headerSOS}
            activeOpacity={0.85}
            accessibilityLabel="SOS Khẩn cấp"
          >
            <SeniorIcon name="sos" size={18} color="#FFFFFF" />
            <Text variant="bodySm" bold color="#FFFFFF" style={{ fontSize: 12 }}>
              SOS
            </Text>
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
            <SeniorIcon name="bell" size={20} color={Colors.onSurface} />
            <View style={styles.bellDot} />
          </TouchableOpacity>

          {/* User Avatar */}
          <Avatar
            initials={MOCK.user.initials}
            size={36}
            ringColor="rgba(15, 118, 110, 0.2)"
            ringWidth={2}
          />
        </View>
      </View>

      {/* ═══ Scrollable Content ═══ */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
      >
        {/* — Greeting — */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingLeft}>
            <View style={styles.waveBox}>
              <Hand size={24} color="#D97706" />
            </View>
            <View>
              <Text variant="headlineSm" bold color={Colors.onSurface}>
                Chào {MOCK.user.name}!
              </Text>
              <Text variant="bodySm" semiBold color={Colors.onSurfaceVariant} style={styles.dateText}>
                {dateStr}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleVoiceRead}
            style={styles.voiceReadBtn}
            activeOpacity={0.85}
          >
            <SeniorIcon name="volume-up" size={19} color={Colors.primaryContainer} />
            <Text variant="bodySm" semiBold color={Colors.primaryContainer} style={{ fontSize: 12 }}>
              Đọc to
            </Text>
          </TouchableOpacity>
        </View>

        {/* — SOS Emergency — */}
        <SosEmergencyCard onPress={handleSOS} />

        {/* — Medication Reminder — */}
        <MedicationReminderCard
          scheduleName="Uống Thuốc Trưa"
          time="12:00"
          statusLabel="Đến giờ uống"
          medications={MOCK.medications}
          onConfirm={handleMedConfirm}
        />

        {/* — Family Love Note — */}
        <FamilyNoteCard
          senderName={MOCK.familyNote.senderName}
          senderInitials={MOCK.familyNote.senderInitials}
          message={MOCK.familyNote.message}
          timeAgo={MOCK.familyNote.timeAgo}
        />

        {/* — Daily Mood Check-in — */}
        <MoodSelector />

        {/* — Health Indicators — */}
        <HealthIndicatorGrid
          metrics={MOCK.healthMetrics}
          measuredAt="Đo lúc 07:15"
        />

        {/* — Speed Dial Contacts — */}
        <View style={styles.speedDialSection}>
          <View style={styles.speedDialHeader}>
            <Text variant="labelMd" bold color={Colors.onSurface}>
              Gọi nhanh cho Người thân
            </Text>
            <Text variant="bodySm" semiBold color={Colors.primaryContainer} style={{ fontSize: 12 }}>
              1 chạm là gọi ngay
            </Text>
          </View>
          <View style={styles.speedDialList}>
            {MOCK.contacts.map((contact, i) => (
              <SpeedDialContact
                key={i}
                name={contact.name}
                subtitle={contact.subtitle}
                initials={contact.initials}
                phoneNumber={contact.phoneNumber}
                variant={contact.variant}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ═══ Floating Pill Nav Bar ═══ */}
      <PillNavBar
        activeTab={activeTab}
        onTabPress={setActiveTab}
        animatedStyle={animatedStyle}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  // Header
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(249,250,255,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seniorBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Rounded.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSOS: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: Rounded.full,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F43F5E',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
    paddingTop: 12,
  },

  // Greeting
  greetingCard: {
    backgroundColor: '#F0FDFA',
    padding: 16,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  waveBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    marginTop: 2,
  },
  voiceReadBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: Rounded.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Speed Dial
  speedDialSection: {
    gap: 10,
  },
  speedDialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  speedDialList: {
    gap: 10,
  },
});
