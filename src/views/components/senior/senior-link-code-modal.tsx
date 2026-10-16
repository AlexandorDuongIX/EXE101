import { CheckCircle2, Link2, RefreshCw, X } from 'lucide-react-native';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import type { LinkCode } from '@/models/linking';
import { Button, Text } from '@/views/components/ui';
import { AppColors, PrimaryColors, Rounded, Spacing } from '@/views/styles/theme';

type Props = {
  name?: string;
  code?: LinkCode;
  linked: boolean;
  error?: string;
  onClose: () => void;
  onRegenerate: () => void;
};

export function SeniorLinkCodeModal({ name, code, linked, error, onClose, onRegenerate }: Props) {
  return (
    <Modal visible={!!name} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.header}>
            <View style={styles.icon}>{linked ? <CheckCircle2 size={26} color={AppColors.action} /> : <Link2 size={26} color={AppColors.action} />}</View>
            <TouchableOpacity style={styles.close} onPress={onClose} accessibilityRole="button" accessibilityLabel="Đóng mã liên kết"><X size={22} color={AppColors.textSecondary} /></TouchableOpacity>
          </View>
          <View style={styles.copy}>
            <Text variant="headlineSm" semiBold accessibilityRole="header">{linked ? 'Đã liên kết tài khoản' : 'Mã liên kết senior'}</Text>
            <Text color={AppColors.textSecondary}>{name}</Text>
          </View>
          {linked ? (
            <Text color={AppColors.textSecondary}>Senior đã có thể xem lịch thuốc và lịch khám của hồ sơ này.</Text>
          ) : (
            <>
              <Text variant="bodySm" color={AppColors.textSecondary}>Gửi mã này cho người thân để nhập sau khi đăng nhập tài khoản senior.</Text>
              {!!code && (
                <View style={styles.codeBox}>
                  <Text bold selectable align="center" color={AppColors.primary} accessibilityLabel="Mã liên kết 6 số" style={styles.code}>{code.code}</Text>
                  <Text variant="bodySm" color={AppColors.textSecondary} align="center">Dùng một lần · Hết hạn lúc {new Date(code.expiresAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              )}
              {!!error && <Text variant="bodySm" color={AppColors.error} accessibilityLiveRegion="polite">{error}</Text>}
              <Button title="Tạo mã mới" variant="secondarySoft" titleColor={AppColors.action} leftIcon={<RefreshCw size={18} color={AppColors.action} />} style={styles.newCode} onPress={onRegenerate} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four, backgroundColor: 'rgba(17,28,45,0.4)' },
  dialog: { width: '100%', maxWidth: 420, padding: Spacing.four, borderRadius: Rounded.md, backgroundColor: AppColors.surface, gap: Spacing.spaceMd },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  icon: { width: 52, height: 52, borderRadius: Rounded.default, backgroundColor: PrimaryColors.surface, alignItems: 'center', justifyContent: 'center' },
  close: { width: 44, height: 44, borderRadius: Rounded.full, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.surfaceMuted },
  copy: { gap: Spacing.one },
  codeBox: { width: '100%', paddingVertical: Spacing.four, gap: Spacing.spaceSm, borderRadius: Rounded.default, backgroundColor: PrimaryColors.surface },
  code: { fontSize: 32, lineHeight: 44, letterSpacing: 7 },
  newCode: { backgroundColor: PrimaryColors.surface },
});
