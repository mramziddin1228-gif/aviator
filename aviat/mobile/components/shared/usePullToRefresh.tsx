import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl } from 'react-native';

import { selectionHaptic } from '../../src/lib/haptics';
import { homeTheme } from '../../theme/homeTheme';

const DEFAULT_REFRESH_DURATION_MS = 850;

type UsePullToRefreshOptions = {
  enabled?: boolean;
  minimumRefreshMs?: number;
  onRefresh?: () => Promise<void> | void;
  refreshingOverride?: boolean;
  title?: string;
};

export function usePullToRefresh({
  enabled = true,
  minimumRefreshMs = DEFAULT_REFRESH_DURATION_MS,
  onRefresh,
  refreshingOverride,
  title = 'Обновляем...',
}: UsePullToRefreshOptions = {}) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!enabled || internalRefreshing || refreshingOverride === true) {
      return;
    }

    void selectionHaptic();
    setInternalRefreshing(true);
    const startedAt = Date.now();

    try {
      await onRefresh?.();
    } finally {
      const elapsedMs = Date.now() - startedAt;
      const remainingMs = Math.max(0, minimumRefreshMs - elapsedMs);

      if (remainingMs > 0) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, remainingMs);
        });
      }

      if (mountedRef.current) {
        setInternalRefreshing(false);
      }
    }
  }, [enabled, internalRefreshing, minimumRefreshMs, onRefresh, refreshingOverride]);

  const refreshing = Boolean(refreshingOverride) || internalRefreshing;

  return {
    handleRefresh,
    refreshControl: enabled ? (
      <RefreshControl
        colors={[homeTheme.colors.primary]}
        onRefresh={() => {
          void handleRefresh();
        }}
        progressBackgroundColor={homeTheme.colors.headerSurface}
        refreshing={refreshing}
        tintColor={homeTheme.colors.primary}
        title={title}
        titleColor={homeTheme.colors.secondary}
      />
    ) : undefined,
    refreshing,
  };
}
