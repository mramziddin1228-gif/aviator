import {
  Image,
  ImageResolvedAssetSource,
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';

import { appStartStaticSplashLogoSource } from '../../constants/appStartMock';
import { appStartTheme } from '../../theme/appStartTheme';

function resolveImageSize(source: ImageSourcePropType) {
  const asset: ImageResolvedAssetSource = Image.resolveAssetSource(source);
  const width = appStartTheme.splash.logoWidth;
  const aspectRatio = asset.width && asset.height ? asset.width / asset.height : 4.6;

  return {
    height: width / aspectRatio,
    width,
  };
}

export function NativeSplash() {
  const size = resolveImageSize(appStartStaticSplashLogoSource);

  return (
    <View style={styles.root}>
      <Image
        resizeMode="contain"
        source={appStartStaticSplashLogoSource}
        style={[styles.logo, size]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
  root: {
    alignItems: 'center',
    backgroundColor: appStartTheme.colors.splashBackground,
    flex: 1,
    justifyContent: 'center',
  },
});
