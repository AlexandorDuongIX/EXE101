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
import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Hand } from 'lucide-react-native';

import { Text, AppIcon, Avatar, SeniorIcon } from '@/views/components/ui';
import { AppColors, OverlayColors, PrimaryColors, StatusColors, Rounded } from '@/views/styles/theme';
import { useScrollVisibility } from '@/views/hooks/use-scroll-visibility';
import { useSeniorHomeController } from '@/controllers/seniors/use-senior-home-controller';

import {
  SosEmergencyCard,
  MedicationReminderCard,
  FamilyNoteCard,
  MoodSelector,
  HealthIndicatorGrid,
  SpeedDialContact,
  PillNavBar,
} from '@/views/components/senior';

// ─── Component ────────────────────────────────────────────
export default function SeniorHomeScreen() {
  const { dashboard, activeTab, setActiveTab, dateStr, handleSOS, handleVoiceRead, handleMedConfirm } = useSeniorHomeController();

  // PillNavBar scroll-driven visibility
  const {
    animatedStyle,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollEnd,
  } = useScrollVisibility({ showDelay: 700 });

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
              <Text variant="labelLg" bold color={AppColors.primary} style={{ fontSize: 19 }}>
                KithCare
              </Text>
              <View style={styles.seniorBadge}>
                <Text variant="bodySm" bold color={AppColors.action} style={{ fontSize: 11 }}>
                  Cao tuổi
                </Text>
              </View>
            </View>
            <Text variant="bodySm" color={AppColors.textSecondary} style={{ fontSize: 12 }}>
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
            <SeniorIcon name="sos" size={18} color={AppColors.onPrimary} />
            <Text variant="bodySm" bold color={AppColors.onPrimary} style={{ fontSize: 12 }}>
              SOS
            </Text>
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
            <SeniorIcon name="bell" size={20} color={AppColors.text} />
            <View style={styles.bellDot} />
          </TouchableOpacity>

          {/* User Avatar */}
          <Avatar
            initials={dashboard.user.initials}
            size={36}
            ringColor={PrimaryColors.ring}
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
              <Hand size={24} color={StatusColors.warning.icon} />
            </View>
            <View>
              <Text variant="headlineSm" bold color={AppColors.text}>
                Chào {dashboard.user.name}!
              </Text>
              <Text variant="bodySm" semiBold color={AppColors.textSecondary} style={styles.dateText}>
                {dateStr}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleVoiceRead}
            style={styles.voiceReadBtn}
            activeOpacity={0.85}
          >
            <SeniorIcon name="volume-up" size={19} color={AppColors.action} />
            <Text variant="bodySm" semiBold color={AppColors.action} style={{ fontSize: 12 }}>
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
          medications={dashboard.medications}
          onConfirm={handleMedConfirm}
        />

        {/* — Family Love Note — */}
        <FamilyNoteCard
          senderName={dashboard.familyNote.senderName}
          senderInitials={dashboard.familyNote.senderInitials}
          message={dashboard.familyNote.message}
          timeAgo={dashboard.familyNote.timeAgo}
        />

        {/* — Daily Mood Check-in — */}
        <MoodSelector />

        {/* — Health Indicators — */}
        <HealthIndicatorGrid
          metrics={dashboard.healthMetrics}
          measuredAt="Đo lúc 07:15"
        />

        {/* — Speed Dial Contacts — */}
        <View style={styles.speedDialSection}>
          <View style={styles.speedDialHeader}>
            <Text variant="labelMd" bold color={AppColors.text}>
              Gọi nhanh cho Người thân
            </Text>
            <Text variant="bodySm" semiBold color={AppColors.action} style={{ fontSize: 12 }}>
              1 chạm là gọi ngay
            </Text>
          </View>
          <View style={styles.speedDialList}>
            {dashboard.contacts.map((contact, i) => (
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
    backgroundColor: AppColors.background,
  },

  // Header
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: OverlayColors.header,
    borderBottomWidth: 1,
    borderBottomColor: OverlayColors.separator,
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
    backgroundColor: PrimaryColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PrimaryColors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seniorBadge: {
    backgroundColor: StatusColors.success.selected,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Rounded.full,
    borderWidth: 1,
    borderColor: StatusColors.success.border,
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
    backgroundColor: StatusColors.emergency.action,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppColors.surfaceSelected,
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
    backgroundColor: StatusColors.tired.accent,
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
    backgroundColor: PrimaryColors.surface,
    padding: 16,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: PrimaryColors.border,
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
    backgroundColor: StatusColors.warning.selected,
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
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.surfaceSelected,
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
