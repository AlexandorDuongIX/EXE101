import { useFocusEffect, usePathname } from 'expo-router';
import { createContext, type ComponentProps, type PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollViewProps } from 'react-native';

import { PillNavBar } from '@/views/components/senior/pill-nav-bar';
import { useScrollVisibility } from '@/views/hooks/use-scroll-visibility';

type NavigationVisibility = ReturnType<typeof useScrollVisibility> & {
  onLayout: (event: LayoutChangeEvent) => void;
};

const NavigationVisibilityContext = createContext<NavigationVisibility | null>(null);

export function BottomNavigationVisibilityProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [height, setHeight] = useState(120);
  const visibility = useScrollVisibility({ hideDistance: height + 16 });
  const { show } = visibility;
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setHeight(event.nativeEvent.layout.height);
  }, []);

  // Cached tabs share the bar; a new route starts with navigation available.
  useEffect(() => { show(); }, [pathname, show]);

  return (
    <NavigationVisibilityContext.Provider value={{ ...visibility, onLayout }}>
      {children}
    </NavigationVisibilityContext.Provider>
  );
}

export function AutoHidingPillNavBar(props: ComponentProps<typeof PillNavBar>) {
  const visibility = useContext(NavigationVisibilityContext);
  return (
    <PillNavBar
      {...props}
      animatedStyle={visibility?.animatedStyle}
      hidden={visibility?.isHidden}
      onLayout={visibility?.onLayout}
    />
  );
}

/** Attach to the screen's vertical ScrollView, leaving nested pickers independent. */
export function useBottomNavigationScroll(): Pick<ScrollViewProps,
  'onScroll' | 'onScrollBeginDrag' | 'onScrollEndDrag' | 'onMomentumScrollBegin' | 'onMomentumScrollEnd' | 'scrollEventThrottle'
> {
  const visibility = useContext(NavigationVisibilityContext);
  const focused = useRef(false);
  const previousY = useRef(0);

  useFocusEffect(useCallback(() => {
    focused.current = true;
    return () => { focused.current = false; };
  }, []));

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const moved = y !== previousY.current;
    previousY.current = y;
    if (focused.current && moved) visibility?.onScroll();
  }, [visibility]);

  return {
    onScroll,
    onScrollBeginDrag: () => { if (focused.current) visibility?.onScrollBeginDrag(); },
    onScrollEndDrag: () => { if (focused.current) visibility?.onScrollEndDrag(); },
    onMomentumScrollBegin: () => { if (focused.current) visibility?.onMomentumScrollBegin(); },
    onMomentumScrollEnd: () => { if (focused.current) visibility?.onMomentumScrollEnd(); },
    // Deliver the last moving frame on web too, rather than its delayed scroll-end callback.
    scrollEventThrottle: 1,
  };
}
