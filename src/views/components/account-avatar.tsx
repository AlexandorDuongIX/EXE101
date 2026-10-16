import { LogOut, X } from 'lucide-react-native';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useAccountController } from '@/controllers/auth/use-account-controller';
import { Avatar, Button, Text } from '@/views/components/ui';
import { AppColors, PrimaryColors, Rounded, Spacing } from '@/views/styles/theme';

export function AccountAvatar({ initials }: { initials?: string }) {
  const { user, open, show, close, signOut } = useAccountController();
  return (
    <>
      <TouchableOpacity onPress={show} accessibilityRole="button" accessibilityLabel="Tài khoản" activeOpacity={0.8} style={styles.trigger}>
        <Avatar initials={initials} size={36} ringColor={PrimaryColors.ring} ringWidth={2} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.overlay}>
          <View style={styles.dialog} accessibilityViewIsModal>
            <View style={styles.heading}>
              <Text variant="headlineSm" semiBold accessibilityRole="header">Tài khoản</Text>
              <TouchableOpacity onPress={close} accessibilityRole="button" accessibilityLabel="Đóng tài khoản" style={styles.close}><X size={22} color={AppColors.textSecondary} /></TouchableOpacity>
            </View>
            <Text semiBold>{user?.role === 'family' ? 'Con cái / Người thân' : 'Người cao tuổi'}</Text>
            <Text color={AppColors.textSecondary}>{user?.phone}</Text>
            <Button title="Đăng xuất" variant="secondary" titleColor={AppColors.error} leftIcon={<LogOut size={20} color={AppColors.error} />} style={styles.signOut} onPress={signOut} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four, backgroundColor: 'rgba(17,28,45,0.4)' },
  dialog: { width: '100%', maxWidth: 400, borderRadius: Rounded.md, backgroundColor: AppColors.surface, padding: Spacing.four, gap: Spacing.spaceSm },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  signOut: { marginTop: Spacing.spaceSm, borderColor: AppColors.border },
});
