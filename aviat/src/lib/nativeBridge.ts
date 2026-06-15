'use client';

export const NATIVE_BRIDGE_STORAGE_KEY = 'aviator-native-context';

export type NativeBridgeContext = {
  platform?: string;
  profile?: {
    balance?: number | null;
    country?: string | null;
    currency?: string | null;
    email?: string | null;
    phone?: string | null;
    userId?: string | null;
  } | null;
  session?: {
    accessToken: string;
    expiresAt?: number | null;
    expiresIn?: number | null;
    refreshToken: string;
    user?: {
      email?: string | null;
      id: string;
    } | null;
  } | null;
};

declare global {
  interface Window {
    __AVIATOR_NATIVE_CONTEXT__?: NativeBridgeContext;
    __AVIATOR_NATIVE_ROUTE__?: boolean;
    AviatorNativeBridge?: {
      close?: (reason?: string) => void;
      context?: NativeBridgeContext;
      notify?: (type: string, payload?: unknown) => void;
      platform?: string;
    };
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

function isValidContext(value: unknown): value is NativeBridgeContext {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const context = value as NativeBridgeContext;
  return Boolean(context.session?.accessToken && context.session?.refreshToken);
}

export function readNativeBridgeContext() {
  if (typeof window === 'undefined') {
    return null;
  }

  const windowContext =
    window.__AVIATOR_NATIVE_CONTEXT__ ?? window.AviatorNativeBridge?.context ?? null;

  if (isValidContext(windowContext)) {
    return windowContext;
  }

  try {
    const stored =
      window.sessionStorage.getItem(NATIVE_BRIDGE_STORAGE_KEY) ??
      window.localStorage.getItem(NATIVE_BRIDGE_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as unknown;
    return isValidContext(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function isEmbeddedNativeRoute() {
  if (typeof window === 'undefined') {
    return false;
  }

  return Boolean(
    window.__AVIATOR_NATIVE_ROUTE__ ||
      window.ReactNativeWebView ||
      readNativeBridgeContext()
  );
}
