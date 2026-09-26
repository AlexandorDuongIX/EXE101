import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { Avatar } from '@/components/ui/avatar';
import { SeniorIcon } from '@/components/ui/senior-icons';
import { Colors, Rounded, Shadows } from '@/constants/theme';

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
          <Avatar source={senderAvatar} initials={senderInitials} size={40} ringColor="#FFFFFF" ringWidth={2} />
          <View style={styles.senderInfo}>
            <View style={styles.nameRow}>
              <Text variant="labelSm" bold color={Colors.onSurface}>
                Lời dặn từ {senderName}
              </Text>
              <Text style={styles.heartEmoji}>❤️</Text>
            </View>
            <Text variant="bodySm" color={Colors.onSurfaceVariant} style={{ fontSize: 12 }}>
              {timeAgo}
            </Text>
          </View>
        </View>
        <SeniorIcon name="heart" size={20} color="#F59E0B" />
      </View>

      {/* Message Bubble */}
      <View style={styles.messageBubble}>
        <Text variant="bodySm" color={Colors.onSurface} style={styles.messageText}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFBEB',
    borderRadius: Rounded.md,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
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
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: Rounded.default,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  messageText: {
    lineHeight: 22,
    fontWeight: '500',
  },
});
