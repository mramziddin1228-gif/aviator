import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Session } from '@supabase/supabase-js';
import type { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { env } from '../../src/config/env';
import { impactHaptic, selectionHaptic } from '../../src/lib/haptics';
import type { Profile } from '../../src/lib/auth';
import { homeTheme } from '../../theme/homeTheme';
import { FullscreenLoader } from '../shared/FullscreenLoader';
import { HomeBrandIcon } from './HomeBrandIcon';
import { HomeSideModal } from './HomeSideModal';
import { HomeUiIcon } from './HomeUiIcon';

type HomeAviatorScreenProps = {
  onClose: () => void;
  onRefreshProfile?: () => Promise<void>;
  profile: Profile | null;
  session: Session;
  visible: boolean;
};

type BridgeMessage = {
  payload?: {
    message?: string;
    reason?: string;
  } | null;
  type?: string;
};

const AVIATOR_PATH = '/games/aviator';
const BRIDGE_STORAGE_KEY = 'aviator-native-context';

function buildBridgePayload(session: Session, profile: Profile | null) {
  return {
    platform: 'react-native',
    profile: {
      balance: profile?.balance ?? null,
      country: profile?.country ?? null,
      currency: profile?.currency ?? null,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
      userId: profile?.user_id ?? null,
    },
    session: {
      accessToken: session.access_token,
      expiresAt: session.expires_at ?? null,
      expiresIn: session.expires_in ?? null,
      refreshToken: session.refresh_token,
      user: {
        email: session.user.email ?? null,
        id: session.user.id,
      },
    },
  };
}

function buildInjectedBridge(payload: ReturnType<typeof buildBridgePayload>) {
  const serializedPayload = JSON.stringify(payload).replace(/</g, '\\u003c');

  return `
    (function() {
      var payload = ${serializedPayload};
      window.__AVIATOR_NATIVE_CONTEXT__ = payload;
      window.AviatorNativeBridge = {
        context: payload,
        close: function(reason) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'close',
              payload: { reason: reason || 'requested-from-web' }
            }));
          }
        },
        notify: function(type, payload) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: type,
              payload: payload || null
            }));
          }
        },
        platform: 'react-native'
      };
      try {
        window.sessionStorage.setItem('${BRIDGE_STORAGE_KEY}', JSON.stringify(payload));
      } catch (error) {}
      true;
    })();
  `;
}

function encodeBridgeHeader(payload: ReturnType<typeof buildBridgePayload>) {
  return encodeURIComponent(JSON.stringify(payload));
}

function getInternalUrlPath(url: string) {
  try {
    const target = new URL(url);
    const base = new URL(env.webUrl);

    if (target.origin !== base.origin) {
      return null;
    }

    return target.pathname;
  } catch {
    return null;
  }
}

export function HomeAviatorScreen({
  onClose,
  onRefreshProfile,
  profile,
  session,
  visible,
}: HomeAviatorScreenProps) {
  const insets = useSafeAreaInsets();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const bridgePayload = buildBridgePayload(session, profile);
  const aviatorUrl = `${env.webUrl}${AVIATOR_PATH}?native=1`;
  const browserAviatorUrl = `${env.webUrl}${AVIATOR_PATH}`;
  const injectedJavaScriptBeforeContentLoaded = buildInjectedBridge(bridgePayload);
  const showInitialLoader = pageLoading && !hasLoadedOnce && !pageError;
  const showRefreshIndicator = pageLoading && hasLoadedOnce && !pageError;

  const handleClose = () => {
    void selectionHaptic();
    onClose();
    void onRefreshProfile?.();
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as BridgeMessage;

      if (message.type === 'close') {
        handleClose();
      }

      if (message.type === 'native-auth-bootstrap-error') {
        setPageLoading(false);
        setPageError(message.payload?.message || 'Не удалось подключить сессию приложения');
      }
    } catch {
      // Ignore non-JSON bridge messages from the web page.
    }
  };

  const handleShouldStartLoad = (request: WebViewNavigation) => {
    if (request.url === 'about:blank') {
      return true;
    }

    const internalPath = getInternalUrlPath(request.url);

    if (internalPath === null) {
      void Linking.openURL(request.url);
      return false;
    }

    if (
      internalPath === AVIATOR_PATH ||
      internalPath.startsWith(`${AVIATOR_PATH}/`) ||
      internalPath.startsWith('/_next/') ||
      internalPath.startsWith('/api/') ||
      internalPath.startsWith('/assets/') ||
      internalPath.startsWith('/AviatorWinn_files/')
    ) {
      return true;
    }

    if (internalPath === '/' || internalPath === '/login' || internalPath === '/registration') {
      setPageLoading(false);
      setPageError('Веб-часть ушла на экран авторизации вместо страницы игры');
      return false;
    }

    return false;
  };

  return (
    <HomeSideModal onRequestClose={handleClose} visible={visible}>
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.navBar}>
            <Pressable
              hitSlop={10}
              onPress={handleClose}
              style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            >
              <HomeUiIcon
                color={homeTheme.colors.secondary}
                icon={{ kind: 'brand', name: 'arrow-left', size: 24 }}
                size={24}
              />
            </Pressable>

            <View style={styles.headerCenter}>
              <View style={styles.brandRow}>
                <Image
                  resizeMode="contain"
                  source={require('../../assets/home/game_aviator_plane.png')}
                  style={styles.brandPlane}
                />
                <Image
                  resizeMode="contain"
                  source={require('../../assets/home/game_aviator_logo.png')}
                  style={styles.brandLogo}
                />
              </View>
              <Text numberOfLines={1} style={styles.headerMeta}>
                {profile?.user_id ? `ID ${profile.user_id}` : 'Встроенная web-игра'}
              </Text>
            </View>

            <Pressable
              hitSlop={10}
              onPress={() => {
                void impactHaptic();
                void Linking.openURL(browserAviatorUrl);
              }}
              style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            >
              <HomeBrandIcon color={homeTheme.colors.primary} name="search-new" size={18} />
            </Pressable>
          </View>
        </View>

        <View style={styles.webviewWrap}>
          <WebView
            bounces
            cacheEnabled={false}
            contentInsetAdjustmentBehavior="never"
            domStorageEnabled
            injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
            javaScriptEnabled
            key={reloadToken}
            onLoad={() => {
              setHasLoadedOnce(true);
            }}
            onError={({ nativeEvent }) => {
              setPageLoading(false);
              setPageError(nativeEvent.description || 'Не удалось открыть Aviator');
            }}
            onLoadEnd={() => {
              setPageLoading(false);
            }}
            onLoadStart={() => {
              setPageError(null);
              setPageLoading(true);
            }}
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            originWhitelist={['*']}
            pullToRefreshEnabled={Platform.OS === 'ios'}
            refreshControlLightMode
            setSupportMultipleWindows={false}
            sharedCookiesEnabled
            source={{
              headers: {
                'X-Aviator-Native-Context': encodeBridgeHeader(bridgePayload),
                'X-Aviator-Native-Route': '1',
              },
              uri: aviatorUrl,
            }}
            style={styles.webview}
            thirdPartyCookiesEnabled
          />

          {showInitialLoader ? (
            <View pointerEvents="none" style={styles.loadingOverlay}>
              <FullscreenLoader
                backgroundColor={homeTheme.colors.background}
                label="Открываем Aviator"
              />
            </View>
          ) : null}

          {showRefreshIndicator ? (
            <View pointerEvents="none" style={styles.refreshIndicatorWrap}>
              <View style={styles.refreshIndicator}>
                <ActivityIndicator color={homeTheme.colors.textPrimary} size="small" />
                <Text style={styles.refreshIndicatorText}>Обновляем контент</Text>
              </View>
            </View>
          ) : null}

          {pageError ? (
            <View style={styles.errorOverlay}>
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>Aviator не открылся</Text>
                <Text style={styles.errorSubtitle}>{pageError}</Text>

                <Pressable
                  onPress={() => {
                    setPageError(null);
                    setPageLoading(true);
                    setReloadToken((current) => current + 1);
                  }}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.retryButtonText}>Повторить</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </HomeSideModal>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: homeTheme.colors.background,
    flex: 1,
  },
  header: {
    backgroundColor: homeTheme.colors.background,
    paddingHorizontal: homeTheme.spacing.md,
  },
  navBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
  },
  navButton: {
    alignItems: 'center',
    borderRadius: homeTheme.radii.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  brandPlane: {
    height: 18,
    width: 26,
  },
  brandLogo: {
    height: 18,
    width: 72,
  },
  headerMeta: {
    color: homeTheme.colors.secondary,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 2,
  },
  webviewWrap: {
    backgroundColor: homeTheme.colors.background,
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    backgroundColor: homeTheme.colors.background,
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  refreshIndicatorWrap: {
    alignItems: 'center',
    left: 0,
    paddingTop: 10,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  refreshIndicator: {
    alignItems: 'center',
    backgroundColor: '#10161dcc',
    borderColor: '#ffffff14',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  refreshIndicatorText: {
    color: homeTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: '#0b1015dd',
    justifyContent: 'center',
    padding: homeTheme.spacing.lg,
  },
  errorCard: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 24,
    padding: homeTheme.spacing.lg,
    width: '100%',
  },
  errorTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  errorSubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: homeTheme.spacing.md,
    minHeight: 48,
    paddingHorizontal: homeTheme.spacing.lg,
  },
  retryButtonText: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.84,
  },
});
