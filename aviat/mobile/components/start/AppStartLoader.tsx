import { View } from 'react-native';

import {
  APP_START_STEP_COUNT,
  AppStartLoaderType,
  appStartTheme,
} from '../../theme/appStartTheme';
import { AppStartLoaderItem } from './AppStartLoaderItem';

type AppStartLoaderProps = {
  loaderType: AppStartLoaderType;
  step: number;
};

export function AppStartLoader({
  loaderType,
  step,
}: AppStartLoaderProps) {
  const gap = appStartTheme.loader.gaps[loaderType];

  return (
    <View
      style={{
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
      }}
    >
      {Array.from({ length: APP_START_STEP_COUNT }, (_, index) => (
        <View key={`${loaderType}-${index}`} style={{ marginRight: index === APP_START_STEP_COUNT - 1 ? 0 : gap }}>
          <AppStartLoaderItem index={index} loaderType={loaderType} step={step} />
        </View>
      ))}
    </View>
  );
}
