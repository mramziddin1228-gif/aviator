import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { authTheme } from '../../theme/authTheme';

type AuthShellProps = {
  scene: 'login' | 'register';
  children: ReactNode;
};

const authorizationAnimation = require('../../assets/lottie/authorization.json');
const registrationAnimation = require('../../assets/lottie/registration.json');
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);
const loginHeroDuration = 980;
const registerHeroExitDuration = 820;
const registerHeroEnterDuration = 1120;
const registerHeroDelay = 60;
const registerHeroStartProgress = 1;
const registerHeroRestProgress = 0;

export function AuthShell({ scene, children }: AuthShellProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const authProgress = useRef(new Animated.Value(scene === 'register' ? 1 : 0)).current;
  const regProgress = useRef(
    new Animated.Value(scene === 'register' ? registerHeroStartProgress : 0),
  ).current;
  const authOpacity = useRef(new Animated.Value(1)).current;
  const regOpacity = useRef(new Animated.Value(0)).current;
  const heroHeight = Math.max(236, Math.min(height * 0.33, 292));
  const animationSide = Math.max(
    208,
    Math.min(heroHeight - authTheme.spacing.sm, width * 0.9, 324),
  );
  const foregroundOffset = heroHeight - authTheme.spacing.lg;
  const sheetMinHeight = Math.max(0, height - foregroundOffset);

  useLayoutEffect(() => {
    authProgress.stopAnimation();
    regProgress.stopAnimation();
    authOpacity.stopAnimation();
    regOpacity.stopAnimation();

    let currentAnimation: Animated.CompositeAnimation | null = null;

    if (scene === 'register') {
      authProgress.setValue(1);
      authOpacity.setValue(1);
      regProgress.setValue(registerHeroStartProgress);
      regOpacity.setValue(0.08);

      currentAnimation = Animated.parallel([
        Animated.timing(authProgress, {
          toValue: 0,
          duration: registerHeroExitDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.delay(registerHeroDelay),
          Animated.timing(regOpacity, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(registerHeroDelay),
          Animated.timing(regProgress, {
            toValue: registerHeroRestProgress,
            duration: registerHeroEnterDuration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.delay(registerHeroDelay + 140),
          Animated.timing(authOpacity, {
            toValue: 0,
            duration: 420,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]);
    } else {
      authProgress.setValue(0);
      authOpacity.setValue(1);
      regProgress.setValue(0);
      regOpacity.setValue(0);

      currentAnimation = Animated.timing(authProgress, {
        toValue: 1,
        duration: loginHeroDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      });
    }

    currentAnimation.start(({ finished }) => {
      if (!finished) {
        return;
      }

      if (scene === 'register') {
        authProgress.setValue(0);
        authOpacity.setValue(0);
        regProgress.setValue(registerHeroRestProgress);
        regOpacity.setValue(1);
        return;
      }

      authProgress.setValue(1);
      authOpacity.setValue(1);
      regProgress.setValue(0);
      regOpacity.setValue(0);
    });

    return () => {
      currentAnimation?.stop();
      authProgress.stopAnimation();
      regProgress.stopAnimation();
      authOpacity.stopAnimation();
      regOpacity.stopAnimation();
    };
  }, [authOpacity, authProgress, regOpacity, regProgress, scene]);

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
          <View pointerEvents="none" style={[styles.heroLayer, { height: heroHeight }]}>
            <View
              pointerEvents="none"
              style={[styles.heroAnimationHost, { bottom: authTheme.spacing.xl }]}
            >
              <Animated.View
                style={[
                  styles.heroAnimationLayer,
                  styles.heroAnimationLayerLogin,
                  {
                    height: animationSide,
                    opacity: authOpacity,
                    width: animationSide,
                  },
                ]}
              >
                <AnimatedLottieView
                  progress={authProgress}
                  resizeMode="cover"
                  source={authorizationAnimation}
                  style={styles.heroAnimation}
                />
              </Animated.View>

              <Animated.View
                style={[
                  styles.heroAnimationLayer,
                  styles.heroAnimationLayerRegister,
                  {
                    height: animationSide,
                    opacity: regOpacity,
                    width: animationSide,
                  },
                ]}
              >
                <AnimatedLottieView
                  progress={regProgress}
                  resizeMode="cover"
                  source={registrationAnimation}
                  style={styles.heroAnimation}
                />
              </Animated.View>
            </View>
          </View>

          <View style={[styles.foreground, { marginTop: foregroundOffset }]}>
            <ScrollView
              automaticallyAdjustContentInsets={false}
              bounces={false}
              contentInsetAdjustmentBehavior="never"
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.sheet,
                  {
                    minHeight: sheetMinHeight,
                    paddingBottom: authTheme.spacing.lg + insets.bottom,
                  },
                ]}
              >
                {children}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  heroLayer: {
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 0,
  },
  heroAnimationHost: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
  },
  heroAnimationLayer: {
    position: 'absolute',
    top: 0,
  },
  heroAnimationLayerLogin: {
    right: 0,
  },
  heroAnimationLayerRegister: {
    left: 0,
  },
  heroAnimation: {
    flex: 1,
  },
  foreground: {
    flex: 1,
    zIndex: 1,
  },
  sheet: {
    backgroundColor: authTheme.colors.background,
    borderTopLeftRadius: authTheme.radii.xl,
    borderTopRightRadius: authTheme.radii.xl,
    paddingHorizontal: authTheme.spacing.lg,
    paddingTop: authTheme.spacing.md,
    width: '100%',
  },
});
