import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type HomeSideModalProps = {
  children: ReactNode;
  onRequestClose: () => boolean | void;
  visible: boolean;
};

const EDGE_GESTURE_WIDTH = 22;
const CLOSE_DISTANCE_RATIO = 0.32;
const CLOSE_VELOCITY = 900;
const OPEN_SPRING = {
  damping: 26,
  mass: 0.92,
  stiffness: 280,
} as const;
const CLOSE_TIMING = {
  duration: 220,
  easing: Easing.out(Easing.cubic),
} as const;

export function HomeSideModal({
  children,
  onRequestClose,
  visible,
}: HomeSideModalProps) {
  const { width } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const dragStartX = useSharedValue(width);
  const translateX = useSharedValue(width);
  const closePendingRef = useRef(false);

  const finishUnmount = () => {
    setMounted(false);
  };

  const animateOut = () => {
    translateX.value = withTiming(width, CLOSE_TIMING, (finished) => {
      if (finished) {
        runOnJS(finishUnmount)();
      }
    });
  };

  useEffect(() => {
    if (visible && !mounted) {
      closePendingRef.current = false;
      setMounted(true);
      return;
    }

    if (!mounted) {
      return;
    }

    if (visible) {
      closePendingRef.current = false;
      translateX.value = width;
      translateX.value = withSpring(0, OPEN_SPRING);
      return;
    }

    if (!closePendingRef.current) {
      animateOut();
    }
  }, [mounted, visible]);

  const requestClose = () => {
    if (closePendingRef.current) {
      return;
    }

    const closeAccepted = onRequestClose();

    if (closeAccepted === false) {
      translateX.value = withSpring(0, OPEN_SPRING);
      return;
    }

    closePendingRef.current = true;
    animateOut();
  };

  const edgeSwipeGesture = Gesture.Pan()
    .onBegin(() => {
      dragStartX.value = translateX.value;
    })
    .failOffsetY([-12, 12])
    .activeOffsetX(12)
    .onUpdate((event) => {
      const nextOffset = Math.max(0, dragStartX.value + event.translationX);
      translateX.value = nextOffset;
    })
    .onEnd((event) => {
      const projectedOffset = translateX.value + event.velocityX * 0.18;
      const shouldDismiss =
        projectedOffset > width * CLOSE_DISTANCE_RATIO || event.velocityX > CLOSE_VELOCITY;

      if (shouldDismiss) {
        runOnJS(requestClose)();
        return;
      }

      translateX.value = withSpring(0, OPEN_SPRING);
    })
    .onFinalize(() => {
      dragStartX.value = translateX.value;
    });

  const animatedScreenStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      onRequestClose={requestClose}
      statusBarTranslucent
      transparent
      visible={mounted}
    >
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.screenWrap, animatedScreenStyle]}>
          <GestureDetector gesture={edgeSwipeGesture}>
            <View style={styles.edgeGestureZone} />
          </GestureDetector>
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    overflow: 'hidden',
  },
  screenWrap: {
    ...StyleSheet.absoluteFillObject,
    elevation: 22,
    shadowColor: '#000000',
    shadowOffset: {
      height: 0,
      width: -10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  edgeGestureZone: {
    ...StyleSheet.absoluteFillObject,
    bottom: 0,
    left: 0,
    top: 0,
    width: EDGE_GESTURE_WIDTH,
    zIndex: 20,
  },
  content: {
    flex: 1,
  },
});
