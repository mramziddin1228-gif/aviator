import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView as RNScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  clamp,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { authTheme } from '../../theme/authTheme';

type NativeBottomSheetProps = {
  bodyStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
  footer?: ReactNode;
  initialSnapIndex?: number;
  onClose: () => void;
  snapPoints?: number[];
  title: string;
  visible: boolean;
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const springConfig = {
  damping: 26,
  mass: 0.88,
  stiffness: 280,
};
const sheetScrollBoundaryEpsilon = 2;
const AnimatedScrollView = Animated.createAnimatedComponent(RNScrollView);

type BottomSheetGestureContextValue = {
  scrollContentHeight: SharedValue<number>;
  scrollOffsetY: SharedValue<number>;
  scrollTouchActive: SharedValue<number>;
  scrollViewportHeight: SharedValue<number>;
  sheetGesture: ReturnType<typeof Gesture.Pan>;
};

const BottomSheetGestureContext = createContext<BottomSheetGestureContextValue | null>(null);

function getNearestOffset(offsets: number[], value: number) {
  'worklet';

  let nearestOffset = offsets[0] ?? 0;
  let smallestDistance = Math.abs(value - nearestOffset);

  for (let index = 1; index < offsets.length; index += 1) {
    const currentOffset = offsets[index] ?? 0;
    const distance = Math.abs(value - currentOffset);

    if (distance < smallestDistance) {
      nearestOffset = currentOffset;
      smallestDistance = distance;
    }
  }

  return nearestOffset;
}

function useBottomSheetGestureContext() {
  const context = useContext(BottomSheetGestureContext);

  if (!context) {
    throw new Error('BottomSheetScrollView must be used inside NativeBottomSheet');
  }

  return context;
}

export function NativeBottomSheet({
  bodyStyle,
  children,
  footer,
  initialSnapIndex = 0,
  onClose,
  snapPoints = [0.72],
  title,
  visible,
}: NativeBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const closePendingRef = useRef(false);
  const availableHeight = Math.max(320, windowHeight - insets.top - authTheme.spacing.xl);
  const normalizedSnapPoints = snapPoints.length > 0 ? snapPoints : [0.72];
  const snapHeights = normalizedSnapPoints
    .map((point) => Math.round(Math.min(Math.max(point, 0.32), 0.92) * availableHeight))
    .sort((left, right) => left - right);
  const maxSheetHeight = snapHeights[snapHeights.length - 1] ?? Math.round(availableHeight * 0.72);
  const openOffsets = snapHeights
    .map((height) => maxSheetHeight - height)
    .sort((left, right) => left - right);
  const highestOpenOffset = openOffsets[0] ?? 0;
  const lowestOpenOffset = openOffsets[openOffsets.length - 1] ?? 0;
  const targetIndex = Math.min(Math.max(initialSnapIndex, 0), openOffsets.length - 1);
  const defaultOffset = openOffsets[targetIndex] ?? highestOpenOffset;
  const closedOffset = maxSheetHeight + insets.bottom + authTheme.spacing.xl;
  const dragStartY = useSharedValue(closedOffset);
  const translateY = useSharedValue(closedOffset);
  const dragActivationTranslationY = useSharedValue(0);
  const sheetOwnsGesture = useSharedValue(0);
  const scrollOffsetY = useSharedValue(0);
  const scrollViewportHeight = useSharedValue(0);
  const scrollContentHeight = useSharedValue(0);
  const scrollTouchActive = useSharedValue(0);

  const finishClose = (notifyParent: boolean) => {
    closePendingRef.current = false;
    setMounted(false);

    if (notifyParent) {
      onClose();
    }
  };

  const animateToOffset = (offset: number, velocity = 0) => {
    translateY.value = withSpring(offset, {
      ...springConfig,
      velocity,
    });
  };

  const animateClose = (notifyParent: boolean, velocity = 0) => {
    if (closePendingRef.current) {
      return;
    }

    closePendingRef.current = true;
    translateY.value = withSpring(
      closedOffset,
      {
        ...springConfig,
        velocity,
      },
      (finished) => {
        if (!finished) {
          return;
        }

        runOnJS(finishClose)(notifyParent);
      },
    );
  };

  useEffect(() => {
    if (visible) {
      closePendingRef.current = false;
      setMounted(true);
      return;
    }

    if (mounted) {
      animateClose(false);
    }
  }, [mounted, visible, closedOffset]);

  useEffect(() => {
    if (!mounted || !visible) {
      return;
    }

    translateY.value = closedOffset;
    const frameId = requestAnimationFrame(() => {
      animateToOffset(defaultOffset);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [mounted, visible, closedOffset, defaultOffset]);

  const sheetProgress = useAnimatedStyle(() => {
    const progress = interpolate(
      translateY.value,
      [closedOffset, highestOpenOffset],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: progress,
    };
  });

  const blurStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateY.value,
      [closedOffset, highestOpenOffset],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: interpolate(progress, [0, 1], [0, 1]),
      transform: [
        {
          scale: interpolate(progress, [0, 1], [1.03, 1]),
        },
      ],
    };
  });

  const backdropTintStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateY.value,
      [closedOffset, highestOpenOffset],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: interpolate(progress, [0, 1], [0, 0.68]),
    };
  });

  const sheetStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateY.value,
      [closedOffset, highestOpenOffset],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      borderTopLeftRadius: interpolate(progress, [0, 1], [34, 26]),
      borderTopRightRadius: interpolate(progress, [0, 1], [34, 26]),
      transform: [
        {
          translateY: translateY.value,
        },
        {
          scale: interpolate(progress, [0, 1], [0.985, 1]),
        },
      ],
    };
  });

  const handleStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateY.value,
      [closedOffset, highestOpenOffset],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: interpolate(progress, [0, 1], [0.72, 1]),
      transform: [
        {
          scaleX: interpolate(progress, [0, 1], [0.9, 1]),
        },
      ],
    };
  });

  const sheetGesture = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .failOffsetX([-18, 18])
    .onStart(() => {
      dragStartY.value = translateY.value;
      dragActivationTranslationY.value = 0;
      sheetOwnsGesture.value = 0;
    })
    .onUpdate((event) => {
      if (!sheetOwnsGesture.value) {
        const maxScrollOffset = Math.max(scrollContentHeight.value - scrollViewportHeight.value, 0);
        const atTop = scrollOffsetY.value <= sheetScrollBoundaryEpsilon;
        const atBottom =
          maxScrollOffset <= sheetScrollBoundaryEpsilon ||
          scrollOffsetY.value >= maxScrollOffset - sheetScrollBoundaryEpsilon;
        const shouldTakeOver =
          !scrollTouchActive.value ||
          (event.translationY > 0 ? atTop : event.translationY < 0 ? atBottom : false);

        if (!shouldTakeOver) {
          return;
        }

        dragStartY.value = translateY.value;
        dragActivationTranslationY.value = event.translationY;
        sheetOwnsGesture.value = 1;
      }

      const nextOffset =
        dragStartY.value + (event.translationY - dragActivationTranslationY.value);
      translateY.value = clamp(nextOffset, highestOpenOffset, closedOffset);
    })
    .onEnd((event) => {
      if (!sheetOwnsGesture.value) {
        return;
      }

      const projectedOffset = translateY.value + event.velocityY * 0.18;
      const shouldClose =
        projectedOffset > lowestOpenOffset + maxSheetHeight * 0.28 ||
        (event.velocityY > 1300 && translateY.value > lowestOpenOffset - 4);

      if (shouldClose) {
        runOnJS(animateClose)(true, event.velocityY);
        return;
      }

      const targetOffset = getNearestOffset(openOffsets, projectedOffset);
      translateY.value = withSpring(targetOffset, {
        ...springConfig,
        velocity: event.velocityY,
      });
    })
    .onFinalize(() => {
      dragActivationTranslationY.value = 0;
      sheetOwnsGesture.value = 0;
      scrollTouchActive.value = 0;
    });

  const gestureContextValue = useMemo(
    () => ({
      scrollContentHeight,
      scrollOffsetY,
      scrollTouchActive,
      scrollViewportHeight,
      sheetGesture,
    }),
    [scrollContentHeight, scrollOffsetY, scrollTouchActive, scrollViewportHeight, sheetGesture],
  );

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      onRequestClose={() => animateClose(true)}
      presentationStyle="overFullScreen"
      transparent
      visible
      {...(Platform.OS === 'android' ? { statusBarTranslucent: true } : {})}
    >
      <View style={styles.modalRoot}>
        <Animated.View pointerEvents="none" style={[styles.absoluteFill, blurStyle]}>
          <AnimatedBlurView
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
            intensity={72}
            style={styles.absoluteFill}
            tint="dark"
          />
        </Animated.View>

        <Animated.View pointerEvents="none" style={[styles.absoluteFill, styles.backdropTint, backdropTintStyle]} />

        <Pressable onPress={() => animateClose(true)} style={styles.absoluteFill} />

        <BottomSheetGestureContext.Provider value={gestureContextValue}>
          <View pointerEvents="box-none" style={styles.sheetHost}>
            <GestureDetector gesture={sheetGesture}>
              <Animated.View
                accessibilityViewIsModal
                style={[
                  styles.sheet,
                  {
                    height: maxSheetHeight + insets.bottom,
                  },
                  sheetStyle,
                ]}
              >
                <SafeAreaView edges={['bottom']} style={styles.sheetSafeArea}>
                  <View style={styles.header}>
                    <Animated.View style={[styles.handle, handleStyle]} />
                    <Animated.Text numberOfLines={1} style={[styles.title, sheetProgress]}>
                      {title}
                    </Animated.Text>
                  </View>

                  <View style={[styles.body, bodyStyle]}>{children}</View>

                  {footer ? <View style={styles.footer}>{footer}</View> : null}
                </SafeAreaView>
              </Animated.View>
            </GestureDetector>
          </View>
        </BottomSheetGestureContext.Provider>
      </View>
    </Modal>
  );
}

export const BottomSheetScrollView = forwardRef<RNScrollView, ScrollViewProps>(
  function BottomSheetScrollView(
    {
      bounces = false,
      onContentSizeChange,
      onLayout,
      onMomentumScrollEnd,
      onScrollBeginDrag,
      onScrollEndDrag,
      onTouchCancel,
      onTouchEnd,
      onTouchStart,
      scrollEventThrottle = 16,
      ...props
    },
    ref,
  ) {
    const gestureContext = useBottomSheetGestureContext();
    const contentHeightRef = useRef(0);
    const offsetYRef = useRef(0);
    const viewportHeightRef = useRef(0);

    const syncMetrics = (offsetY = offsetYRef.current) => {
      gestureContext.scrollOffsetY.value = offsetY;
      gestureContext.scrollViewportHeight.value = viewportHeightRef.current;
      gestureContext.scrollContentHeight.value = contentHeightRef.current;
    };

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        gestureContext.scrollOffsetY.value = event.contentOffset.y;
        gestureContext.scrollViewportHeight.value = event.layoutMeasurement.height;
        gestureContext.scrollContentHeight.value = event.contentSize.height;
      },
    });

    const nativeGesture = useMemo(
      () =>
        Gesture.Native()
          .simultaneousWithExternalGesture(gestureContext.sheetGesture)
          .onTouchesDown(() => {
            gestureContext.scrollTouchActive.value = 1;
          })
          .onTouchesUp(() => {
            gestureContext.scrollTouchActive.value = 0;
          })
          .onTouchesCancelled(() => {
            gestureContext.scrollTouchActive.value = 0;
          })
          .onFinalize(() => {
            gestureContext.scrollTouchActive.value = 0;
          }),
      [gestureContext],
    );

    return (
      <GestureDetector gesture={nativeGesture}>
        <AnimatedScrollView
          {...props}
          bounces={bounces}
          onContentSizeChange={(width, height) => {
            contentHeightRef.current = height;
            onContentSizeChange?.(width, height);
          }}
          onLayout={(event) => {
            viewportHeightRef.current = event.nativeEvent.layout.height;
            onLayout?.(event);
          }}
          onMomentumScrollEnd={(event) => {
            offsetYRef.current = event.nativeEvent.contentOffset.y;
            syncMetrics(offsetYRef.current);
            onMomentumScrollEnd?.(event);
          }}
          onScroll={scrollHandler}
          onScrollBeginDrag={(event) => {
            offsetYRef.current = event.nativeEvent.contentOffset.y;
            syncMetrics(offsetYRef.current);
            onScrollBeginDrag?.(event);
          }}
          onScrollEndDrag={(event) => {
            offsetYRef.current = event.nativeEvent.contentOffset.y;
            syncMetrics(offsetYRef.current);
            onScrollEndDrag?.(event);
          }}
          onTouchCancel={(event) => {
            gestureContext.scrollTouchActive.value = 0;
            onTouchCancel?.(event);
          }}
          onTouchEnd={(event) => {
            gestureContext.scrollTouchActive.value = 0;
            onTouchEnd?.(event);
          }}
          onTouchStart={(event) => {
            syncMetrics();
            onTouchStart?.(event);
          }}
          ref={ref}
          scrollEventThrottle={scrollEventThrottle}
        />
      </GestureDetector>
    );
  },
);

const styles = StyleSheet.create({
  modalRoot: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropTint: {
    backgroundColor: authTheme.colors.overlay60,
  },
  sheetHost: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: authTheme.colors.backgroundContent,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -14,
    },
    shadowOpacity: 0.34,
    shadowRadius: 24,
  },
  sheetSafeArea: {
    flex: 1,
  },
  header: {
    paddingBottom: authTheme.spacing.md,
    paddingHorizontal: authTheme.spacing.md,
    paddingTop: authTheme.spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: authTheme.colors.secondary40,
    borderRadius: authTheme.radii.full,
    height: 5,
    marginBottom: authTheme.spacing.md,
    width: 48,
  },
  title: {
    color: authTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  footer: {
    borderTopColor: authTheme.colors.separator30,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: authTheme.spacing.md,
    paddingTop: authTheme.spacing.md,
  },
});
