import { useCallback, useEffect, useRef, useState } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface UseScrollVisibilityOptions {
  showDelay?: number;
  hideDistance?: number;
}

/** Hide while content moves, then reveal after a full idle interval. */
export function useScrollVisibility({ showDelay = 300, hideDistance = 120 }: UseScrollVisibilityOptions = {}) {
  const translateY = useSharedValue(0);
  const [isHidden, setIsHidden] = useState(false);
  const hiddenRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearTimer();
    hiddenRef.current = false;
    setIsHidden(false);
    translateY.set(withTiming(0, { duration: 220 }));
  }, [clearTimer, translateY]);

  const hide = useCallback(() => {
    clearTimer();
    if (!hiddenRef.current) {
      hiddenRef.current = true;
      setIsHidden(true);
      translateY.set(withTiming(hideDistance, { duration: 180 }));
    }
  }, [clearTimer, hideDistance, translateY]);

  const scheduleShow = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(show, showDelay);
  }, [clearTimer, show, showDelay]);

  const onScroll = useCallback(() => {
    hide();
    scheduleShow();
  }, [hide, scheduleShow]);

  useEffect(() => clearTimer, [clearTimer]);

  // Keep the whole bar off-screen if its safe area or text size changes.
  useEffect(() => {
    if (hiddenRef.current) {
      translateY.set(withTiming(hideDistance, { duration: 180 }));
    }
  }, [hideDistance, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }],
  }));

  return {
    animatedStyle,
    isHidden,
    onScroll,
    onScrollBeginDrag: hide,
    onScrollEndDrag: scheduleShow,
    onMomentumScrollBegin: hide,
    onMomentumScrollEnd: scheduleShow,
    show,
  };
}
