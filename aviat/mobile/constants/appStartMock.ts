import Constants from 'expo-constants';
import type { ImageSourcePropType } from 'react-native';

import type {
  AppStartHoliday,
  AppStartLoaderType,
  AppStartPresetType,
  AppStartRatioKey,
  AppStartUiModel,
} from '../theme/appStartTheme';

export const appStartStaticSplashLogoSource = require('../assets/start/logo_patch.png');
export const appStartPartnerSource = require('../assets/start/app_start_partner.webp');

export const appStartBackgroundSources: Record<
  AppStartHoliday,
  Record<AppStartRatioKey, ImageSourcePropType>
> = {
  DEFAULT: {
    '1_12': require('../assets/start/app_start_image_background_1_12.webp'),
    '1_17': require('../assets/start/app_start_image_background_1_17.webp'),
    '1_2': require('../assets/start/app_start_image_background_1_2.webp'),
  },
  HALLOWEEN: {
    '1_12': require('../assets/start/app_start_background_halloween_1_12.webp'),
    '1_17': require('../assets/start/app_start_background_halloween_1_17.webp'),
    '1_2': require('../assets/start/app_start_background_halloween_1_2.webp'),
  },
  NEW_YEAR: {
    '1_12': require('../assets/start/app_start_image_background_new_year_1_12.webp'),
    '1_17': require('../assets/start/app_start_image_background_new_year_1_17.webp'),
    '1_2': require('../assets/start/app_start_image_background_new_year_1_2.webp'),
  },
};

export const appStartAvailableLoaderTypes: AppStartLoaderType[] = [
  'BALLS',
  'DOTS',
  'ARROWS',
  'SPORTSMEN',
];

export const appStartAvailablePresets: AppStartPresetType[] = [
  'LOADER_TOP_LOGO_CENTER',
  'LOADER_MIDDLE_LOGO_MIDDLE',
  'LOADER_MIDDLE_BOTTOM_LOGO_TOP',
  'LOADER_BOTTOM_LOGO_TOP',
  'LOADER_BOTTOM_LOGO_MIDDLE',
];

function resolveExtraString(key: string) {
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const extraValue = extra?.[key];

  return typeof extraValue === 'string' && extraValue.length > 0 ? extraValue : undefined;
}

function resolveEnvString(key: string) {
  const value = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.[key];

  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export const appStartRemoteVideoUri =
  resolveEnvString('EXPO_PUBLIC_APP_START_VIDEO_URI') ??
  resolveExtraString('appStartVideoUri');

export const appStartRemoteVideoPreviewUri =
  resolveEnvString('EXPO_PUBLIC_APP_START_VIDEO_PREVIEW_URI') ??
  resolveExtraString('appStartVideoPreviewUri');

export function formatAppStartVersionLabel() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build =
    Constants.expoConfig?.android?.versionCode ??
    Constants.expoConfig?.ios?.buildNumber ??
    '1';

  return `1xBet v.${version}(${String(build)})`;
}

export const appStartMock: AppStartUiModel = {
  background: {
    imageSource: null,
    type: 'IMAGE',
  },
  content: {
    loaderType: 'BALLS',
    partnerSource: appStartPartnerSource,
    preset: 'LOADER_BOTTOM_LOGO_MIDDLE',
    reservePartnerSpace: false,
    showLogo: true,
    showPartner: true,
    showVersion: true,
    versionLabel: formatAppStartVersionLabel(),
  },
};
