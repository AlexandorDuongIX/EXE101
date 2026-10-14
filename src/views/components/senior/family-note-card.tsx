import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/views/components/ui/text';
import { Avatar } from '@/views/components/ui/avatar';
import { SeniorIcon } from '@/views/components/ui/senior-icons';
import { AppColors, StatusColors, OverlayColors, Rounded, Shadows } from '@/views/styles/theme';

export interface FamilyNoteCardProps {
  /** Sender display name, e.g. "Con Hoàng" */
  senderName: string;
  /** Avatar URI of the sender */
  senderAvatar?: string;
  /** Initials for the avatar */
  senderInitials?: string;
  /** The message body */
  message: string;
  /** Time label, e.g. "10 phút trước" */
  timeAgo: string;
}

export const FamilyNoteCard: React.FC<FamilyNoteCardProps> = ({
  senderName,
  senderAvatar,
  senderInitials,
  message,
  timeAgo,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.senderRow}>
          <Avatar source={senderAvatar} initials={senderInitials} size={40} ringColor={AppColors.surface} ringWidth={2} />
          <View style={styles.senderInfo}>
            <View style={styles.nameRow}>
              <Text variant="labelSm" bold color={AppColors.text}>
                Lời dặn từ {senderName}
              </Text>
              <Text style={styles.heartEmoji}>❤️</Text>
            </View>
            <Text variant="bodySm" color={AppColors.textSecondary} style={{ fontSize: 12 }}>
              {timeAgo}
            </Text>
          </View>
        </View>
        <SeniorIcon name="heart" size={20} color={StatusColors.warning.accent} />
      </View>

      {/* Message Bubble */}
      <View style={styles.messageBubble}>
        <Text variant="bodySm" color={AppColors.text} style={styles.messageText}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: StatusColors.warning.surface,
    borderRadius: Rounded.md,
    padding: 16,
    borderWidth: 1,
    borderColor: StatusColors.warning.border,
    gap: 12,
    ...Shadows.layer1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  senderInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartEmoji: {
    fontSize: 14,
  },
  messageBubble: {
    backgroundColor: OverlayColors.card,
    borderRadius: Rounded.default,
    padding: 14,
    borderWidth: 1,
    borderColor: StatusColors.warning.selected,
  },
  messageText: {
    lineHeight: 22,
    fontWeight: '500',
  },
});
