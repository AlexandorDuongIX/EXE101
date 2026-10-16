import { Redirect } from 'expo-router';
import Tabs from 'expo-router/js-tabs';
import { Easing, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSeniorHomeController } from '@/controllers/seniors/use-senior-home-controller';
import { useSeniorNavigationController } from '@/controllers/seniors/use-senior-navigation-controller';
import { HomeHeader } from '@/views/components/home-header';
import { AutoHidingPillNavBar, BottomNavigationVisibilityProvider } from '@/views/components/navigation/bottom-navigation-visibility';
import { AppColors } from '@/views/styles/theme';

export default function SeniorTabsLayout() {
  const { redirectHref, activeTab, handleTabPress } = useSeniorNavigationController();
  const { dashboard } = useSeniorHomeController();
  const { width } = useWindowDimensions();

  if (redirectHref) {
    return <Redirect href={redirectHref} />;
  }

  return (
    <BottomNavigationVisibilityProvider>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <HomeHeader roleLabel="Cao tuổi" initials={dashboard.user.initials} />
        <Tabs
          initialRouteName="senior-home"
          backBehavior="fullHistory"
          tabBar={({ navigation }) => (
            <AutoHidingPillNavBar
              activeTab={activeTab}
              onTabPress={(tabKey) => handleTabPress(tabKey, (name) => navigation.navigate(name))}
            />
          )}
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: AppColors.background },
            animation: 'shift',
            transitionSpec: {
              animation: 'timing',
              config: { duration: 220, easing: Easing.out(Easing.cubic) },
            },
            sceneStyleInterpolator: ({ current }) => ({
              sceneStyle: {
                transform: [{
                  translateX: current.progress.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [-width, 0, width],
                  }),
                }],
              },
            }),
          }}
        >
          <Tabs.Screen name="senior-home" options={{ title: 'Trang chủ' }} />
          <Tabs.Screen name="senior-medications" options={{ title: 'Thuốc' }} />
        </Tabs>
      </SafeAreaView>
    </BottomNavigationVisibilityProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.background },
});
