import type { ReactNode } from 'react';
import { headers } from 'next/headers';

const NATIVE_BRIDGE_STORAGE_KEY = 'aviator-native-context';

function getBootstrapScript(encodedPayload: string | null) {
  if (!encodedPayload) {
    return null;
  }

  try {
    const decodedPayload = decodeURIComponent(encodedPayload);
    const parsedPayload = JSON.parse(decodedPayload) as unknown;

    if (!parsedPayload || typeof parsedPayload !== 'object') {
      return null;
    }

    const serializedPayload = JSON.stringify(parsedPayload).replace(/</g, '\\u003c');

    return `
      (function() {
        var payload = ${serializedPayload};
        window.__AVIATOR_NATIVE_CONTEXT__ = payload;
        window.AviatorNativeBridge = window.AviatorNativeBridge || {
          close: function(reason) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'close',
                payload: { reason: reason || 'requested-from-web' }
              }));
            }
          },
          notify: function(type, innerPayload) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: type,
                payload: innerPayload || null
              }));
            }
          },
          platform: 'react-native'
        };
        window.AviatorNativeBridge.context = payload;
        try {
          var serialized = JSON.stringify(payload);
          window.sessionStorage.setItem('${NATIVE_BRIDGE_STORAGE_KEY}', serialized);
          window.localStorage.setItem('${NATIVE_BRIDGE_STORAGE_KEY}', serialized);
        } catch (error) {}
      })();
    `;
  } catch {
    return null;
  }
}

export default async function AviatorLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const isNativeRoute = requestHeaders.get('x-aviator-native-route') === '1';
  const bootstrapScript = getBootstrapScript(
    requestHeaders.get('x-aviator-native-context')
  );
  const nativeRouteScript = isNativeRoute
    ? `
        window.__AVIATOR_NATIVE_ROUTE__ = true;
        document.documentElement.dataset.aviatorNativeRoute = '1';
      `
    : null;

  return (
    <>
      {isNativeRoute ? (
        <style>{`
          .aviator-native-hidden {
            display: none !important;
          }
        `}</style>
      ) : null}
      {nativeRouteScript ? (
        <script dangerouslySetInnerHTML={{ __html: nativeRouteScript }} />
      ) : null}
      {bootstrapScript ? (
        <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
      ) : null}
      {children}
    </>
  );
}
