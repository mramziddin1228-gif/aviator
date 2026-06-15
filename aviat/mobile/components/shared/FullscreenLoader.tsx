import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';

import { authTheme } from '../../theme/authTheme';
import { LoaderGlyph } from './LoaderGlyph';

type FullscreenLoaderProps = {
  backgroundColor?: string;
  label?: string;
};

export function FullscreenLoader({
  backgroundColor = authTheme.colors.background,
  label = 'Загрузка',
}: FullscreenLoaderProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        duration: 920,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
      rotation.setValue(0);
    };
  }, [rotation]);

  const spinnerStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  } as const;

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <View style={styles.window}>
        <Animated.View style={spinnerStyle}>
          <LoaderGlyph color={authTheme.colors.primaryForeground} size={40} />
        </Animated.View>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: authTheme.spacing.xl,
  },
  window: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.backgroundContent,
    borderColor: authTheme.colors.separator30,
    borderRadius: 28,
    borderWidth: 1,
    gap: authTheme.spacing.md,
    minWidth: 168,
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  label: {
    color: authTheme.colors.white80,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
});
