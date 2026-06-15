import { Redirect, Slot } from 'expo-router';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';

import { FullscreenLoader } from '../../components/shared/FullscreenLoader';
import { useAuthSession } from '../../src/providers/AuthSessionProvider';
import { authTheme } from '../../theme/authTheme';

const backgroundSource = require('../../assets/background-auth.png');

export default function AuthLayout() {
  const { height } = useWindowDimensions();
  const { isReady, session } = useAuthSession();
  const heroHeight = Math.max(
    280,
    height - authTheme.sizes.authContentMinHeight + authTheme.spacing.xl,
  );

  if (!isReady) {
    return (
      <FullscreenLoader
        backgroundColor={authTheme.colors.background}
        label="Проверяем вход"
      />
    );
  }

  if (session) {
    return <Redirect href="/main" />;
  }

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={[styles.heroLayer, { height: heroHeight }]}>
        <Image
          defaultSource={backgroundSource}
          fadeDuration={0}
          resizeMode="cover"
          source={backgroundSource}
          style={styles.heroImage}
        />
        <View style={styles.heroTint} />
      </View>

      <View style={styles.contentLayer}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: authTheme.colors.background,
  },
  heroLayer: {
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.42,
  },
  heroTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: authTheme.colors.backgroundLight60,
  },
  contentLayer: {
    flex: 1,
  },
});
