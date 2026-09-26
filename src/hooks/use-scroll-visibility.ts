/**
 * Hook to control visibility of a floating element (e.g., PillNavBar)
 * based on scroll behavior:
 * - Hides immediately when user begins scrolling
 * - Shows with spring animation after a delay when scrolling stops
 */
import { useRef, useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  type AnimatedStyle,
} from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';

interface UseScrollVisibilityOptions {
  /** Delay in ms before showing the element after scroll ends (default: 700) */
  showDelay?: number;
  /** How far to translate the element offscreen in px (default: 120) */
  hideDistance?: number;
}

export function useScrollVisibility(options: UseScrollVisibilityOptions = {}) {
  const { showDelay = 700, hideDistance = 120 } = options;

  const translateY = useSharedValue<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    translateY.value = withSpring(0, {
      damping: 18,
      stiffness: 140,
      mass: 0.8,
    });
  }, [translateY]);

  const hide = useCallback(() => {
    translateY.value = withTiming(hideDistance, { duration: 250 });
  }, [translateY, hideDistance]);

  const scheduleShow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(show, showDelay);
  }, [show, showDelay]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** Attach to ScrollView's onScrollBeginDrag */
  const onScrollBeginDrag = useCallback(() => {
    clearTimer();
    hide();
  }, [clearTimer, hide]);

  /** Attach to ScrollView's onScrollEndDrag */
  const onScrollEndDrag = useCallback(() => {
    scheduleShow();
  }, [scheduleShow]);

  /** Attach to ScrollView's onMomentumScrollEnd */
  const onMomentumScrollEnd = useCallback(() => {
    scheduleShow();
  }, [scheduleShow]);

  /** Animated style to apply to the floating element */
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return {
    animatedStyle,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollEnd,
    /** Imperatively show the element */
    show,
    /** Imperatively hide the element */
    hide,
  };
}
