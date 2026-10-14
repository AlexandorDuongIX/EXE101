import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Smile, Meh, Frown } from 'lucide-react-native';
import { Text } from '@/views/components/ui/text';
import { AppColors, StatusColors, Rounded, Shadows } from '@/views/styles/theme';
import { useMoodController } from '@/controllers/seniors/use-mood-controller';
import type { MoodValue } from '@/models/seniors/mood';

export type { MoodValue } from '@/models/seniors/mood';

export interface MoodOption {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  value: MoodValue;
}

export interface MoodSelectorProps {
  /** Override default mood options */
  options?: MoodOption[];
  /** Called with the selected mood value */
  onSelect?: (mood: MoodValue) => void;
  /** Feedback message shown after selection */
  feedbackMessage?: string;
}

const DEFAULT_OPTIONS: MoodOption[] = [
  { icon: <Smile size={32} color={StatusColors.success.text} />, label: 'Khỏe', sublabel: 'Thoải mái', value: 'good' },
  { icon: <Meh size={32} color={StatusColors.warning.text} />, label: 'Bình thường', sublabel: 'Như mọi khi', value: 'okay' },
  { icon: <Frown size={32} color={StatusColors.tired.text} />, label: 'Hơi mệt', sublabel: 'Cần nghỉ ngơi', value: 'tired' },
];

const MOOD_COLORS: Record<MoodValue, { bg: string; activeBg: string; border: string; text: string }> = {
  good:  { bg: StatusColors.success.surface, activeBg: StatusColors.success.selected, border: StatusColors.success.accent, text: StatusColors.success.text },
  okay:  { bg: StatusColors.warning.surface, activeBg: StatusColors.warning.selected, border: StatusColors.warning.accent, text: StatusColors.warning.text },
  tired: { bg: StatusColors.tired.surface, activeBg: StatusColors.tired.selected, border: StatusColors.tired.accent, text: StatusColors.tired.text },
};

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  options = DEFAULT_OPTIONS,
  onSelect,
  feedbackMessage = '✓ Đã báo tin cho Con Hoàng & Lan Anh yên tâm!',
}) => {
  const { selected, showFeedback, handleSelect } = useMoodController(onSelect);

  return (
    <View style={[styles.container, Shadows.layer1]}>
      {/* Title */}
      <View>
        <Text variant="labelMd" bold color={AppColors.text}>
          Hôm nay Bác cảm thấy thế nào?
        </Text>
        <Text variant="bodySm" color={AppColors.textSecondary} style={styles.subtitle}>
          Chạm để thông báo tức thì cho các con
        </Text>
      </View>

      {/* Mood Grid */}
      <View style={styles.grid}>
        {options.map((option) => {
          const isActive = selected === option.value;
          const colors = MOOD_COLORS[option.value];
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.8}
              onPress={() => handleSelect(option.value)}
              style={[
                styles.moodBtn,
                {
                  backgroundColor: isActive ? colors.activeBg : colors.bg,
                  borderColor: isActive ? colors.border : 'transparent',
                },
              ]}
              accessibilityLabel={`Cảm thấy ${option.label}`}
            >
              <View style={styles.iconContainer}>{option.icon}</View>
              <Text variant="labelSm" bold color={colors.text} style={styles.moodLabel}>
                {option.label}
              </Text>
              <Text variant="bodySm" color={AppColors.textSecondary} style={styles.moodSublabel}>
                {option.sublabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feedback Toast */}
      {showFeedback && (
        <View style={styles.feedback}>
          <Text variant="bodySm" bold color={StatusColors.success.text} align="center">
            {feedbackMessage}
          </Text>
        </View>
      )}
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
    gap: 12,
  },
  subtitle: {
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Rounded.default,
    borderWidth: 2,
    gap: 4,
  },
  iconContainer: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodLabel: {
    marginTop: 4,
  },
  moodSublabel: {
    fontSize: 11,
  },
  feedback: {
    backgroundColor: StatusColors.success.selected,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: StatusColors.success.borderStrong,
  },
});
