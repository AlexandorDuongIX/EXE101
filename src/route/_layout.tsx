import '@/views/styles/global.css';

import { DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/views/components/animated-icon';
import { AuthProvider } from '@/controllers/auth/auth-context';
import { SeniorProvider } from '@/controllers/seniors/senior-context';
import { AppColors } from '@/views/styles/colors';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: AppColors.action,
    background: AppColors.background,
    card: AppColors.surface,
    text: AppColors.text,
    border: AppColors.border,
    notification: AppColors.emergency,
  },
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <SeniorProvider>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style="dark" />
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(senior)/senior-home" />
            <Stack.Screen name="(examples)/explore" />
            <Stack.Screen name="(family)/create-senior" />
            <Stack.Screen name="(family)/family-home" />
            <Stack.Screen name="(auth)/login" />
          </Stack>
        </ThemeProvider>
      </SeniorProvider>
    </AuthProvider>
  );
}
