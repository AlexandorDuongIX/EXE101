import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSeniorSchedulesController } from '@/controllers/schedules/use-senior-schedules-controller';
import { useBottomNavigationScroll } from '@/views/components/navigation/bottom-navigation-visibility';
import { ScheduleContent } from '@/views/components/schedules';
import { Spacing } from '@/views/styles/theme';

export default function SeniorSchedulesScreen() {
  const { schedules, selectedKind, setSelectedKind } = useSeniorSchedulesController();
  const insets = useSafeAreaInsets();
  const navigationScroll = useBottomNavigationScroll();

  return (
    <ScrollView
      {...navigationScroll}
      testID="senior-schedules-scroll"
      style={styles.screen}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <ScheduleContent schedules={schedules} selectedKind={selectedKind} onKindChange={setSelectedKind} canManage={false} seniorMode />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.gutter, paddingTop: Spacing.four },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center' },
});
