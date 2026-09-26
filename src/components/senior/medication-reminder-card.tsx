import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { Pill } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { SeniorIcon } from '@/components/ui/senior-icons';
import { Colors, Rounded, Shadows, Spacing } from '@/constants/theme';

export interface MedicationItem {
  name: string;
  /** E.g. "1 viên tròn màu trắng" */
  description: string;
  /** E.g. "Sau bữa trưa 15 phút với nước ấm" */
  instruction?: string;
  /** Image URI of the medication */
  imageUri?: string;
}

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
  const [confirmed, setConfirmed] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm?.();
  };

  const handleVoice = () => {
    setVoiceListening(true);
    // Simulate voice recognition
    setTimeout(() => {
      setVoiceListening(false);
      handleConfirm();
    }, 1500);
    onVoiceConfirm?.();
  };

  return (
    <View style={[styles.container, Shadows.layer1]}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.alarmIcon}>
            <SeniorIcon name="alarm" size={22} color="#D97706" filled />
          </View>
          <View>
            <Text variant="bodySm" bold color="#B45309" style={styles.scheduleLabel}>
              CỮ THUỐC TIẾP THEO
            </Text>
            <Text variant="labelMd" bold color={Colors.onSurface}>
              {scheduleName} • {time}
            </Text>
          </View>
        </View>
        <View style={styles.statusPill}>
          <Text variant="bodySm" bold color="#92400E" style={{ fontSize: 12 }}>
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
              <Pill size={32} color={Colors.primaryContainer} />
            )}
          </View>
          <View style={styles.pillInfo}>
            <Text variant="labelMd" bold color={Colors.onSurface} numberOfLines={1}>
              {med.name}
            </Text>
            <Text variant="bodySm" semiBold color={Colors.primaryContainer} style={styles.pillDesc}>
              {med.description}
            </Text>
            {med.instruction && (
              <Text variant="bodySm" color={Colors.onSurfaceVariant} style={styles.pillInstruction}>
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
            color="#FFFFFF"
            filled={confirmed}
          />
          <Text variant="labelMd" bold color="#FFFFFF" style={styles.confirmText}>
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
              color={voiceListening ? '#065F46' : '#92400E'}
            />
          </View>
          <Text
            variant="bodySm"
            bold
            color={voiceListening ? '#065F46' : '#92400E'}
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
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.md,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
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
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Rounded.full,
  },
  pillCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Rounded.default,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
    marginBottom: 16,
  },
  pillImageContainer: {
    width: 64,
    height: 64,
    borderRadius: Rounded.default,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: Colors.primaryContainer,
  },
  confirmedButton: {
    backgroundColor: '#059669',
  },
  confirmText: {
    fontSize: 16,
    letterSpacing: 0.3,
  },
  voiceButton: {
    height: 48,
    borderRadius: Rounded.full,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  voiceIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
