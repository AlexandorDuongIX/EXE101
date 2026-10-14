import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { Pill } from 'lucide-react-native';
import { Text } from '@/views/components/ui/text';
import { SeniorIcon } from '@/views/components/ui/senior-icons';
import { AppColors, StatusColors, Colors, Rounded, Shadows } from '@/views/styles/theme';
import { useMedicationReminderController } from '@/controllers/seniors/use-medication-reminder-controller';
import type { MedicationItem } from '@/models/seniors/medication';

export type { MedicationItem } from '@/models/seniors/medication';

export interface MedicationReminderCardProps {
  /** E.g. "Uống Thuốc Trưa" */
  scheduleName: string;
  /** E.g. "12:00" */
  time: string;
  /** Status label, e.g. "Đến giờ uống" */
  statusLabel?: string;
  /** Medications to take in this schedule */
  medications: MedicationItem[];
  /** Called when user confirms taking medication */
  onConfirm?: () => void;
  /** Called when user taps voice confirm */
  onVoiceConfirm?: () => void;
}

export const MedicationReminderCard: React.FC<MedicationReminderCardProps> = ({
  scheduleName,
  time,
  statusLabel = 'Đến giờ uống',
  medications,
  onConfirm,
  onVoiceConfirm,
}) => {
  const { confirmed, voiceListening, handleConfirm, handleVoice } = useMedicationReminderController(onConfirm, onVoiceConfirm);

  return (
    <View style={[styles.container, Shadows.layer1]}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.alarmIcon}>
            <SeniorIcon name="alarm" size={22} color={StatusColors.warning.icon} filled />
          </View>
          <View>
            <Text variant="bodySm" bold color={StatusColors.warning.label} style={styles.scheduleLabel}>
              CỮ THUỐC TIẾP THEO
            </Text>
            <Text variant="labelMd" bold color={AppColors.text}>
              {scheduleName} • {time}
            </Text>
          </View>
        </View>
        <View style={styles.statusPill}>
          <Text variant="bodySm" bold color={StatusColors.warning.text} style={{ fontSize: 12 }}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Medication Items */}
      {medications.map((med, index) => (
        <View key={index} style={styles.pillCard}>
          <View style={styles.pillImageContainer}>
            {med.imageUri ? (
              <Image
                source={{ uri: med.imageUri }}
                style={styles.pillImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Pill size={32} color={AppColors.action} />
            )}
          </View>
          <View style={styles.pillInfo}>
            <Text variant="labelMd" bold color={AppColors.text} numberOfLines={1}>
              {med.name}
            </Text>
            <Text variant="bodySm" semiBold color={AppColors.action} style={styles.pillDesc}>
              {med.description}
            </Text>
            {med.instruction && (
              <Text variant="bodySm" color={AppColors.textSecondary} style={styles.pillInstruction}>
                {med.instruction}
              </Text>
            )}
          </View>
        </View>
      ))}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {/* Primary Confirm Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleConfirm}
          disabled={confirmed}
          style={[
            styles.confirmButton,
            confirmed ? styles.confirmedButton : styles.unconfirmedButton,
          ]}
          accessibilityLabel="Xác nhận đã uống thuốc"
        >
          <SeniorIcon
            name="check-circle"
            size={26}
            color={AppColors.onPrimary}
            filled={confirmed}
          />
          <Text variant="labelMd" bold color={AppColors.onPrimary} style={styles.confirmText}>
            {confirmed ? 'TUYỆT VỜI! ĐÃ GHI NHẬN ✓' : 'BÁC ĐÃ UỐNG RỒI ✓'}
          </Text>
        </TouchableOpacity>

        {/* Voice Assist Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleVoice}
          disabled={confirmed}
          style={styles.voiceButton}
          accessibilityLabel="Bấm nói xác nhận"
        >
          <View style={styles.voiceIconCircle}>
            <SeniorIcon
              name={voiceListening ? 'check-circle' : 'mic'}
              size={18}
              color={voiceListening ? StatusColors.success.text : StatusColors.warning.text}
            />
          </View>
          <Text
            variant="bodySm"
            bold
            color={voiceListening ? StatusColors.success.text : StatusColors.warning.text}
          >
            {voiceListening
              ? 'Đang lắng nghe Bác nói...'
              : 'Chạm để nói: "Tôi đã uống rồi"'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.surface,
    borderRadius: Rounded.md,
    padding: 20,
    borderWidth: 1,
    borderColor: AppColors.surfaceSelected,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.surfaceSelected,
    paddingBottom: 12,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alarmIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: StatusColors.warning.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusPill: {
    backgroundColor: StatusColors.warning.selected,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Rounded.full,
  },
  pillCard: {
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: Rounded.default,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: AppColors.surfaceSelected,
    marginBottom: 16,
  },
  pillImageContainer: {
    width: 64,
    height: 64,
    borderRadius: Rounded.default,
    overflow: 'hidden',
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    padding: 4,
  },
  pillImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  pillInfo: {
    flex: 1,
  },
  pillDesc: {
    marginTop: 2,
  },
  pillInstruction: {
    marginTop: 2,
    fontSize: 12,
  },
  actions: {
    gap: 10,
  },
  confirmButton: {
    height: 56,
    borderRadius: Rounded.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  unconfirmedButton: {
    backgroundColor: AppColors.action,
  },
  confirmedButton: {
    backgroundColor: StatusColors.success.action,
  },
  confirmText: {
    fontSize: 16,
    letterSpacing: 0.3,
  },
  voiceButton: {
    height: 48,
    borderRadius: Rounded.full,
    backgroundColor: StatusColors.warning.surface,
    borderWidth: 1,
    borderColor: StatusColors.warning.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  voiceIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: StatusColors.warning.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
