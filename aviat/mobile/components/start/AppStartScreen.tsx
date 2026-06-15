import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appStartMock } from '../../constants/appStartMock';
import {
  APP_START_STEP_COUNT,
  AppStartUiModel,
  appStartTheme,
} from '../../theme/appStartTheme';
import { AppStartLoader } from './AppStartLoader';
import { AppStartLogo } from './AppStartLogo';
import { AppStartPartner } from './AppStartPartner';
import { AppStartVersion } from './AppStartVersion';
import { NativeSplash } from './NativeSplash';
import { SmartBackground } from './SmartBackground';

type AppStartScreenProps = {
  autoAdvance?: boolean;
  model?: AppStartUiModel;
  showNativeSplashOnMount?: boolean;
  splashDurationMs?: number;
};

function BottomPartner({
  partnerSource,
  screenWidth,
  visible,
}: {
  partnerSource: AppStartUiModel['content']['partnerSource'];
  screenWidth: number;
  visible: boolean;
}) {
  if (!visible || !partnerSource) {
    return null;
  }

  return (
    <View>
      <AppStartPartner screenWidth={screenWidth} source={partnerSource} />
    </View>
  );
}

function renderPresetLayout({
  model,
  safeBottom,
  safeTop,
  screenHeight,
  screenWidth,
  step,
}: {
  model: AppStartUiModel;
  safeBottom: number;
  safeTop: number;
  screenHeight: number;
  screenWidth: number;
  step: number;
}) {
  const loader = (
    <AppStartLoader loaderType={model.content.loaderType} step={step} />
  );
  const showLogo = model.content.showLogo ?? true;
  const showPartner = model.content.showPartner ?? true;
  const showVersion = model.content.showVersion ?? true;
  const reservePartnerSpace = model.content.reservePartnerSpace ?? false;
  const logo = showLogo ? <AppStartLogo /> : null;
  const partner = (
    <BottomPartner
      partnerSource={model.content.partnerSource}
      screenWidth={screenWidth}
      visible={showPartner}
    />
  );
  const version = showVersion ? (
    <AppStartVersion label={model.content.versionLabel} />
  ) : null;
  const partnerReserve = !showPartner && reservePartnerSpace
    ? appStartTheme.partner.maxHeight + appStartTheme.spacing.s16
    : 0;
  const bottomPadding = safeBottom + appStartTheme.spacing.s4;
  const topPadding = safeTop + appStartTheme.spacing.s72;
  const bottomContent = (includeLoader: boolean) => (
    <View
      style={[
        styles.bottomStack,
        {
          paddingBottom: bottomPadding + partnerReserve,
        },
      ]}
    >
      {showPartner ? partner : null}
      {includeLoader ? (
        <View style={showVersion ? styles.loaderSpacing : undefined}>{loader}</View>
      ) : null}
      {version}
    </View>
  );

  switch (model.content.preset) {
    case 'LOADER_TOP_LOGO_CENTER':
      return (
        <View style={styles.overlay}>
          <View style={[styles.topLoader, { paddingTop: topPadding }]}>
            {loader}
          </View>
          <View style={styles.centerLogo}>{logo}</View>
          {bottomContent(false)}
        </View>
      );
    case 'LOADER_MIDDLE_LOGO_MIDDLE':
      return (
        <View style={styles.overlay}>
          <View style={styles.middleColumn}>
            {logo}
            <View style={styles.middleGap} />
            {loader}
          </View>
          {bottomContent(false)}
        </View>
      );
    case 'LOADER_MIDDLE_BOTTOM_LOGO_TOP':
      return (
        <View style={styles.overlay}>
          <View style={[styles.topLogo, { paddingTop: topPadding }]}>{logo}</View>
          <View style={styles.middleBottomLoader}>{loader}</View>
          {bottomContent(false)}
        </View>
      );
    case 'LOADER_BOTTOM_LOGO_TOP':
      return (
        <View style={styles.overlay}>
          <View style={[styles.topLogo, { paddingTop: topPadding }]}>{logo}</View>
          {bottomContent(true)}
        </View>
      );
    case 'LOADER_BOTTOM_LOGO_MIDDLE':
    default:
      return (
        <View style={styles.overlay}>
          <View style={styles.centerLogo}>{logo}</View>
          {bottomContent(true)}
        </View>
      );
  }
}

export function AppStartScreen({
  autoAdvance = true,
  model = appStartMock,
  showNativeSplashOnMount = false,
  splashDurationMs = 420,
}: AppStartScreenProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [showSplashLayer, setShowSplashLayer] = useState(showNativeSplashOnMount);

  useEffect(() => {
    if (!autoAdvance) {
      return;
    }

    const intervalId = setInterval(() => {
      setStep((currentStep) => (
        currentStep >= APP_START_STEP_COUNT - 1
          ? currentStep
          : currentStep + 1
      ));
    }, appStartTheme.loader.stepDurationMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoAdvance]);

  useEffect(() => {
    if (!showNativeSplashOnMount) {
      return;
    }

    const cleanupTimer = setTimeout(() => {
      setShowSplashLayer(false);
    }, splashDurationMs);

    return () => {
      clearTimeout(cleanupTimer);
    };
  }, [showNativeSplashOnMount, splashDurationMs]);

  const content = useMemo(
    () =>
      renderPresetLayout({
        model,
        safeBottom: insets.bottom,
        safeTop: insets.top,
        screenHeight: height,
        screenWidth: width,
        step,
      }),
    [height, insets.bottom, insets.top, model, step, width],
  );

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: showSplashLayer
            ? appStartTheme.colors.splashBackground
            : appStartTheme.colors.introBackground,
        },
      ]}
    >
      <StatusBar
        backgroundColor={
          showSplashLayer
            ? appStartTheme.colors.splashBackground
            : appStartTheme.colors.introBackground
        }
        style="light"
      />
      {showSplashLayer ? (
        <View style={styles.nativeSplashLayer}>
          <NativeSplash />
        </View>
      ) : (
        <>
          <SmartBackground background={model.background} step={step} />
          {content}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomStack: {
    bottom: 0,
    left: 0,
    paddingHorizontal: appStartTheme.spacing.s12,
    position: 'absolute',
    right: 0,
  },
  centerLogo: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loaderSpacing: {
    marginBottom: appStartTheme.spacing.s16,
  },
  middleBottomLoader: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: appStartTheme.spacing.s24,
  },
  middleColumn: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  middleGap: {
    height: appStartTheme.spacing.s24,
  },
  nativeSplashLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  root: {
    flex: 1,
  },
  topLoader: {
    alignItems: 'center',
  },
  topLogo: {
    alignItems: 'center',
  },
});
