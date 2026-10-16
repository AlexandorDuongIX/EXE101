import { Redirect } from 'expo-router';
import Tabs from 'expo-router/js-tabs';
import { Easing, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFamilyNavigationController } from '@/controllers/family/use-family-navigation-controller';
import { HomeHeader } from '@/views/components/home-header';
import { AutoHidingPillNavBar, BottomNavigationVisibilityProvider } from '@/views/components/navigation/bottom-navigation-visibility';
import { AppColors } from '@/views/styles/theme';

export default function FamilyTabsLayout() {
  const { redirectHref, activeTab, handleTabPress } = useFamilyNavigationController();
  const { width } = useWindowDimensions();

  if (redirectHref) {
    return <Redirect href={redirectHref} />;
  }

  return (
    <BottomNavigationVisibilityProvider>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <HomeHeader roleLabel="Gia đình" />
        <Tabs
          initialRouteName="family-home"
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
          <Tabs.Screen name="family-home" options={{ title: 'Trang chủ' }} />
          <Tabs.Screen name="family-medications" options={{ title: 'Thuốc' }} />
          <Tabs.Screen name="add-more-senior" options={{ title: 'Gia đình' }} />
        </Tabs>
      </SafeAreaView>
    </BottomNavigationVisibilityProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.background },
});
