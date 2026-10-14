import { ImagePlus, Trash2, UserRound } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useSeniorAvatarController } from '@/controllers/seniors/use-senior-avatar-controller';
import { Avatar } from '@/views/components/ui/avatar';
import { Button } from '@/views/components/ui/button';
import { Text } from '@/views/components/ui/text';
import { Rounded, Spacing } from '@/views/styles/theme';
import { AppColors } from '@/views/styles/colors';

export interface SeniorAvatarPickerProps {
  uri?: string;
  onChange: (uri?: string) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}

export function SeniorAvatarPicker({
  uri,
  onChange,
  disabled = false,
  onBusyChange,
}: SeniorAvatarPickerProps) {
  const palette = AppColors;
  const { busy, error, chooseImage, removeImage } = useSeniorAvatarController({
    onChange,
    disabled,
    onBusyChange,
  });

  return (
    <View style={styles.container}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={uri ? 'Ảnh đại diện người thân đã chọn' : 'Ảnh đại diện người thân mặc định'}
      >
        {uri ? (
          <Avatar
            source={uri}
            size={96}
            ringColor={palette.border}
            fallbackBg={palette.surfaceMuted}
            fallbackIconColor={palette.textSecondary}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
            ]}
          >
            <UserRound size={48} color={palette.textSecondary} />
          </View>
        )}
      </View>

      <Text variant="labelMd" color={palette.text}>Ảnh đại diện</Text>
      <Text variant="bodySm" color={palette.textSecondary} align="center">
        Không bắt buộc · Ảnh tối đa 10 MB
      </Text>

      <View style={styles.actions}>
        <Button
          title={uri ? 'Thay ảnh' : 'Chọn ảnh'}
          titleColor={palette.onPrimary}
          leftIcon={<ImagePlus size={20} color={palette.onPrimary} />}
          style={[styles.button, { backgroundColor: palette.action }]}
          loading={busy}
          disabled={disabled || busy}
          onPress={chooseImage}
          accessibilityRole="button"
          accessibilityLabel={uri ? 'Thay ảnh đại diện người thân' : 'Chọn ảnh đại diện người thân'}
          accessibilityHint="Mở thư viện ảnh để chọn một ảnh đại diện."
          accessibilityState={{ disabled: disabled || busy, busy }}
        />
        {uri && (
          <Button
            title="Xóa ảnh"
            variant="secondary"
            titleColor={palette.textSecondary}
            leftIcon={<Trash2 size={18} color={palette.textSecondary} />}
            style={[
              styles.button,
              { borderColor: palette.border, backgroundColor: palette.surface },
            ]}
            disabled={disabled || busy}
            onPress={removeImage}
            accessibilityRole="button"
            accessibilityLabel="Xóa ảnh đại diện người thân đã chọn"
            accessibilityState={{ disabled: disabled || busy }}
          />
        )}
      </View>

      {error && (
        <Text
          variant="bodySm"
          color={palette.error}
          align="center"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  placeholder: {
    width: 100,
    height: 100,
    borderRadius: Rounded.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  button: {
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.spaceSm,
  },
});
