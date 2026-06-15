import LottieView from 'lottie-react-native';
import { Image, type ImageSourcePropType, StyleSheet, useWindowDimensions, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { appStartBackgroundSources } from '../../constants/appStartMock';
import {
  AppStartBackgroundModel,
  appStartTheme,
  resolveAppStartRatioKey,
} from '../../theme/appStartTheme';

type SmartBackgroundProps = {
  background: AppStartBackgroundModel;
  step: number;
};

function buildVideoHtml(videoUri: string) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: transparent;
      }
      video {
        width: 100vw;
        height: 100vh;
        object-fit: cover;
        background: transparent;
      }
    </style>
  </head>
  <body>
    <video id="app-start-video" autoplay loop muted playsinline webkit-playsinline preload="auto">
      <source src=${JSON.stringify(videoUri)} />
    </video>
    <script>
      (function() {
        var video = document.getElementById('app-start-video');
        if (!video) {
          return;
        }

        var play = function() {
          var attempt = video.play();
          if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function() {});
          }
        };

        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        play();
        document.addEventListener('visibilitychange', function() {
          if (!document.hidden) {
            play();
          }
        });
      })();
    </script>
  </body>
</html>`;
}

export function SmartBackground({
  background,
  step,
}: SmartBackgroundProps) {
  const { height, width } = useWindowDimensions();
  const ratioKey = resolveAppStartRatioKey(width, height);
  const holiday = background.holiday ?? 'DEFAULT';
  const bundledSource = background.holiday
    ? appStartBackgroundSources[holiday][ratioKey]
    : undefined;
  const previewSource: ImageSourcePropType | undefined = background.previewUri
    ? { uri: background.previewUri }
    : background.previewSource;
  const fallbackSource = previewSource ?? background.imageSource ?? bundledSource;
  const smartImageSource =
    background.frames && background.frames.length > 0
      ? background.frames[step % background.frames.length]
      : fallbackSource;

  return (
    <View style={styles.root}>
      <View style={styles.baseColor} />
      {background.type === 'IMAGE' && fallbackSource ? (
        <Image resizeMode="cover" source={fallbackSource} style={styles.media} />
      ) : null}
      {background.type === 'LOTTIE' && background.lottieSource && fallbackSource ? (
        <>
          <Image resizeMode="cover" source={fallbackSource} style={styles.media} />
          <LottieView
            autoPlay
            loop
            source={background.lottieSource as never}
            style={styles.media}
          />
        </>
      ) : null}
      {background.type === 'SMART_IMAGE' && smartImageSource ? (
        <Image resizeMode="cover" source={smartImageSource} style={styles.media} />
      ) : null}
      {background.type === 'VIDEO' ? (
        <>
          {fallbackSource ? (
            <Image resizeMode="cover" source={fallbackSource} style={styles.media} />
          ) : null}
          {background.videoUri ? (
            <WebView
              allowsInlineMediaPlayback
              androidLayerType="hardware"
              bounces={false}
              javaScriptEnabled
              mediaPlaybackRequiresUserAction={false}
              originWhitelist={['*']}
              scrollEnabled={false}
              setSupportMultipleWindows={false}
              source={{ html: buildVideoHtml(background.videoUri) }}
              style={styles.video}
            />
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  baseColor: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: appStartTheme.colors.introBackground,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});
