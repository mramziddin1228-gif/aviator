import type { ImageSourcePropType } from 'react-native';

export const APP_START_STEP_COUNT = 8;

export type AppStartLoaderType = 'BALLS' | 'DOTS' | 'ARROWS' | 'SPORTSMEN';

export type AppStartPresetType =
  | 'LOADER_TOP_LOGO_CENTER'
  | 'LOADER_MIDDLE_LOGO_MIDDLE'
  | 'LOADER_MIDDLE_BOTTOM_LOGO_TOP'
  | 'LOADER_BOTTOM_LOGO_TOP'
  | 'LOADER_BOTTOM_LOGO_MIDDLE';

export type AppStartBackgroundType = 'IMAGE' | 'LOTTIE' | 'SMART_IMAGE' | 'VIDEO';

export type AppStartHoliday = 'DEFAULT' | 'HALLOWEEN' | 'NEW_YEAR';

export type AppStartRatioKey = '1_12' | '1_17' | '1_2';

export type AppStartBackgroundModel = {
  type: AppStartBackgroundType;
  frames?: ImageSourcePropType[];
  holiday?: AppStartHoliday;
  imageSource?: ImageSourcePropType | null;
  lottieSource?: object | number;
  previewSource?: ImageSourcePropType;
  previewUri?: string;
  videoUri?: string;
};

export type AppStartContentModel = {
  loaderType: AppStartLoaderType;
  partnerSource?: ImageSourcePropType | null;
  preset: AppStartPresetType;
  reservePartnerSpace?: boolean;
  showLogo?: boolean;
  showPartner?: boolean;
  showVersion?: boolean;
  versionLabel: string;
};

export type AppStartUiModel = {
  background: AppStartBackgroundModel;
  content: AppStartContentModel;
};

export const appStartTheme = {
  boot: {
    extendAfterSystemReadyMs: 5000,
  },
  colors: {
    introBackground: '#1D222A',
    splashBackground: '#0310D7',
    staticWhite: '#FFFFFF',
    staticWhite20: '#33FFFFFF',
    staticWhite30: '#4DFFFFFF',
    staticWhite40: '#66FFFFFF',
    staticWhite80: '#CCFFFFFF',
  },
  splash: {
    logoWidth: 176,
  },
  logo: {
    container: { height: 140, width: 280 },
  },
  loader: {
    animationDurationMs: 180,
    stepDurationMs: 260,
    gaps: {
      ARROWS: 8,
      BALLS: 12,
      DOTS: 16,
      SPORTSMEN: 6,
    } satisfies Record<AppStartLoaderType, number>,
    sizes: {
      ARROWS: { height: 20, width: 16 },
      BALLS: { height: 16, width: 16 },
      DOTS: { height: 8, width: 8 },
      SPORTSMEN: { height: 40, width: 32 },
    } satisfies Record<AppStartLoaderType, { height: number; width: number }>,
  },
  partner: {
    maxHeight: 88,
    maxWidth: 448,
  },
  spacing: {
    s4: 4,
    s6: 6,
    s8: 8,
    s12: 12,
    s16: 16,
    s24: 24,
    s72: 72,
  },
  version: {
    fontSize: 14,
    lineHeight: 20,
  },
} as const;

export function getAppStartLogoContainer() {
  return appStartTheme.logo.container;
}

export function resolveAppStartRatioKey(
  screenWidth: number,
  screenHeight: number,
): AppStartRatioKey {
  const ratio = screenHeight / Math.max(screenWidth, 1);

  if (ratio > 2) {
    return '1_2';
  }

  if (ratio > 1.7) {
    return '1_17';
  }

  return '1_12';
}
