import { useEffect, useCallback } from 'react';
import { useViewStats } from './useViewStats';

interface AutoRefreshOptions {
  intervalMinutes?: number;
  enableExternalRefresh?: boolean;
}

export const useAutoRefresh = (options: AutoRefreshOptions = {}) => {
  const { intervalMinutes = 30, enableExternalRefresh = true } = options;
  const { refreshStats } = useViewStats();

  const refreshExternalData = useCallback(async () => {
    if (!enableExternalRefresh) return;
    
    try {
      console.log('🔄 Auto-refreshing external data...');
      await refreshStats();
      console.log('✅ External data refreshed successfully');
    } catch (error) {
      console.error('❌ Auto-refresh failed:', error);
    }
  }, [refreshStats, enableExternalRefresh]);

  useEffect(() => {
    if (!enableExternalRefresh) return;

    // Initial refresh on mount
    refreshExternalData();

    // Set up interval for periodic refresh
    const interval = setInterval(refreshExternalData, intervalMinutes * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [refreshExternalData, intervalMinutes, enableExternalRefresh]);

  return { refreshExternalData };
};