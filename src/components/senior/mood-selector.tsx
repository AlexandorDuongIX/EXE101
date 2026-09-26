import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Smile, Meh, Frown } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Colors, Rounded, Shadows } from '@/constants/theme';

export type MoodValue = 'good' | 'okay' | 'tired';

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
  { icon: <Smile size={32} color="#065F46" />, label: 'Khỏe', sublabel: 'Thoải mái', value: 'good' },
  { icon: <Meh size={32} color="#92400E" />, label: 'Bình thường', sublabel: 'Như mọi khi', value: 'okay' },
  { icon: <Frown size={32} color="#9F1239" />, label: 'Hơi mệt', sublabel: 'Cần nghỉ ngơi', value: 'tired' },
];

const MOOD_COLORS: Record<MoodValue, { bg: string; activeBg: string; border: string; text: string }> = {
  good:  { bg: '#ECFDF5', activeBg: '#D1FAE5', border: '#10B981', text: '#065F46' },
  okay:  { bg: '#FFFBEB', activeBg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
  tired: { bg: '#FFF1F2', activeBg: '#FFE4E6', border: '#F43F5E', text: '#9F1239' },
};

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  options = DEFAULT_OPTIONS,
  onSelect,
  feedbackMessage = '✓ Đã báo tin cho Con Hoàng & Lan Anh yên tâm!',
}) => {
  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (mood: MoodValue) => {
    setSelected(mood);
    setShowFeedback(true);
    onSelect?.(mood);

    setTimeout(() => setShowFeedback(false), 3500);
  };

  return (
    <View style={[styles.container, Shadows.layer1]}>
      {/* Title */}
      <View>
        <Text variant="labelMd" bold color={Colors.onSurface}>
          Hôm nay Bác cảm thấy thế nào?
        </Text>
        <Text variant="bodySm" color={Colors.onSurfaceVariant} style={styles.subtitle}>
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
              <Text variant="bodySm" color={Colors.onSurfaceVariant} style={styles.moodSublabel}>
                {option.sublabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feedback Toast */}
      {showFeedback && (
        <View style={styles.feedback}>
          <Text variant="bodySm" bold color="#065F46" align="center">
            {feedbackMessage}
          </Text>
        </View>
      )}
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
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
});
