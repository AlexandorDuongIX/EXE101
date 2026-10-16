import { Redirect } from 'expo-router';
import { Link2 } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLinkSeniorController } from '@/controllers/linking/use-link-senior-controller';
import { AppIcon, Button, Card, Input, Text } from '@/views/components/ui';
import { AppColors, PrimaryColors, Rounded } from '@/views/styles/theme';

export default function LinkSeniorScreen() {
  const { redirectHref, code, setCode, submit, error, loading, changeAccount } = useLinkSeniorController();

  if (redirectHref) return <Redirect href={redirectHref} />;

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.brand}>
          <AppIcon size={36} />
          <Text variant="headlineSm" bold color={AppColors.primary}>KithCare</Text>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.linkIcon} accessible={false}>
              <Link2 size={40} strokeWidth={1.7} color={AppColors.action} />
            </View>
            <View style={styles.introduction}>
              <Text variant="headlineMd" bold align="center" accessibilityRole="header">
                Liên kết với gia đình
              </Text>
              <Text variant="bodyLg" color={AppColors.textSecondary} align="center">
                Nhờ người thân gửi mã liên kết 6 chữ số, rồi nhập mã vào bên dưới.
              </Text>
            </View>
            <Card elevated={false} style={styles.formCard}>
              <Input
                label="Mã liên kết 6 chữ số"
                accessibilityLabel="Mã liên kết 6 chữ số"
                accessibilityHint="Nhập mã do người thân tạo trong hồ sơ của bạn."
                keyboardType="number-pad"
                inputMode="numeric"
                autoComplete="off"
                textContentType="none"
                autoCorrect={false}
                autoCapitalize="none"
                maxLength={6}
                value={code}
                onChangeText={setCode}
                onSubmitEditing={code.length === 6 && !loading ? submit : undefined}
                editable={!loading}
                error={error}
                style={styles.codeInput}
                containerStyle={styles.inputSurface}
              />
              <Button
                title="Liên kết"
                accessibilityLabel="Liên kết với gia đình"
                onPress={submit}
                disabled={code.length !== 6 || loading}
                loading={loading}
                style={styles.submitButton}
              />
            </Card>
            <Text variant="bodyMd" color={AppColors.textSecondary} align="center" style={styles.help}>
              Người thân có thể tạo mã trong mục Gia đình, tại hồ sơ của bạn.
            </Text>
            <Button title="Đổi tài khoản" variant="secondarySoft" onPress={changeAccount} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.background },
  keyboardView: { flex: 1 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 16 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  content: { width: '100%', maxWidth: 480, alignSelf: 'center', alignItems: 'center', gap: 24 },
  linkIcon: { width: 92, height: 92, borderRadius: Rounded.lg, backgroundColor: PrimaryColors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: PrimaryColors.border },
  introduction: { gap: 12, width: '100%' },
  formCard: { width: '100%', marginVertical: 0, padding: 20, gap: 12 },
  inputSurface: { minHeight: 68, borderColor: PrimaryColors.border, backgroundColor: PrimaryColors.surface },
  codeInput: { fontSize: 28, lineHeight: 38, letterSpacing: 8, textAlign: 'center', paddingVertical: 10 },
  submitButton: { marginTop: 4 },
  help: { maxWidth: 340 },
});
