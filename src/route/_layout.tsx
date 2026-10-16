import '@/views/styles/global.css';

import { DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/views/components/animated-icon';
import { AuthProvider } from '@/controllers/auth/auth-context';
import { SeniorProvider } from '@/controllers/seniors/senior-context';
import { ScheduleProvider } from '@/controllers/schedules/schedule-context';
import { LinkProvider } from '@/controllers/linking/link-context';
import { HealthProvider } from '@/controllers/health/health-context';
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
        <LinkProvider>
          <ScheduleProvider>
            <HealthProvider>
              <ThemeProvider value={navigationTheme}>
                <StatusBar style="dark" />
                <AnimatedSplashOverlay />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(senior)/(tabs)" />
                  <Stack.Screen name="(senior)/link-senior" />
                  <Stack.Screen name="(examples)/explore" />
                  <Stack.Screen name="(family)/create-senior" />
                  <Stack.Screen name="(family)/(tabs)" />
                  <Stack.Screen name="(auth)/login" />
                </Stack>
              </ThemeProvider>
            </HealthProvider>
          </ScheduleProvider>
        </LinkProvider>
      </SeniorProvider>
    </AuthProvider>
  );
}
