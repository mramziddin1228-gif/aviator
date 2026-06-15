import {
  Image,
  ImageResolvedAssetSource,
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';

import { appStartTheme } from '../../theme/appStartTheme';

type AppStartPartnerProps = {
  screenWidth: number;
  source?: ImageSourcePropType | null;
};

export function AppStartPartner({
  screenWidth,
  source,
}: AppStartPartnerProps) {
  if (!source) {
    return null;
  }

  const asset: ImageResolvedAssetSource = Image.resolveAssetSource(source);
  const aspectRatio = asset.width && asset.height ? asset.width / asset.height : 5.4;
  const targetWidth = Math.min(
    Math.max(screenWidth - appStartTheme.spacing.s24, 0),
    appStartTheme.partner.maxWidth,
  );
  const targetHeight = Math.min(
    appStartTheme.partner.maxHeight,
    targetWidth / aspectRatio,
  );

  return (
    <View style={styles.root}>
      <Image
        resizeMode="contain"
        source={source}
        style={{ height: targetHeight, width: targetWidth }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
