import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { SeniorIcon, SeniorIconName } from '@/components/ui/senior-icons';
import { Colors, Rounded, Shadows } from '@/constants/theme';

export interface PillNavTab {
  /** Unique key */
  key: string;
  /** Display label */
  label: string;
  /** Icon name from SeniorIcon set */
  icon: SeniorIconName;
}

export interface PillNavBarProps {
  /** Tab definitions */
  tabs?: PillNavTab[];
  /** Currently active tab key */
  activeTab: string;
  /** Called when a tab is pressed */
  onTabPress: (tabKey: string) => void;
  /** Animated style from useScrollVisibility hook (controls show/hide) */
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

const DEFAULT_TABS: PillNavTab[] = [
  { key: 'trang-chu', label: 'Trang chủ', icon: 'home' },
  { key: 'thuoc', label: 'Thuốc', icon: 'medication' },
  { key: 'suc-khoe', label: 'Sức khỏe', icon: 'health' },
  { key: 'lich', label: 'Lịch', icon: 'calendar' },
  { key: 'gia-dinh', label: 'Gia đình', icon: 'group' },
];

export const PillNavBar: React.FC<PillNavBarProps> = ({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabPress,
  animatedStyle,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      style={[
        styles.outer,
        { paddingBottom: Math.max(insets.bottom, 12) },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.pill}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.75}
              onPress={() => onTabPress(tab.key)}
              style={styles.tabItem}
              accessibilityLabel={tab.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              {isActive ? (
                <View style={styles.activeIndicator}>
                  <SeniorIcon
                    name={tab.icon}
                    size={20}
                    color={Colors.primaryContainer}
                  />
                </View>
              ) : (
                <SeniorIcon
                  name={tab.icon}
                  size={22}
                  color={Colors.onSurfaceVariant}
                />
              )}
              <Text
                variant="bodySm"
                bold={isActive}
                semiBold={!isActive}
                color={isActive ? Colors.primaryContainer : Colors.onSurfaceVariant}
                style={styles.tabLabel}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: Rounded.full,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 420,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    minWidth: 54,
    gap: 2,
  },
  activeIndicator: {
    width: 40,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: -0.1,
  },
});
