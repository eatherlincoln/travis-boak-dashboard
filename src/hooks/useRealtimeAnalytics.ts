import { useState, useEffect, useCallback } from "react";
import { supabase } from "@supabaseClient";

export interface AnalyticsSnapshot {
  source: string;
  metric: string;
  value: number;
  updated_at: string;
}

export interface UseRealtimeAnalyticsOptions {
  source?: string;
  metric?: string;
  autoRefresh?: boolean;
}

export const useRealtimeAnalytics = (
  options: UseRealtimeAnalyticsOptions = {}
) => {
  const { source, metric, autoRefresh = true } = options;
  const [data, setData] = useState<AnalyticsSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("analytics_public")
        .select("source, metric, value, updated_at")
        .order("updated_at", { ascending: false });

      // Apply filters if provided
      if (source) {
        query = query.eq("source", source);
      }
      if (metric) {
        query = query.eq("metric", metric);
      }

      const { data: analyticsData, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setData(analyticsData || []);
      console.log(
        "📊 Analytics data fetched:",
        analyticsData?.length,
        "records"
      );
    } catch (err) {
      console.error("❌ Error fetching analytics:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics"
      );
    } finally {
      setLoading(false);
    }
  }, [source, metric]);

  // Set up realtime subscription
  useEffect(() => {
    if (!autoRefresh) return;

    console.log("🔄 Setting up realtime analytics subscription...");

    const channel = supabase
      .channel("analytics-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "analytics_public",
        },
        (payload) => {
          console.log("📡 Realtime analytics update:", payload);

          // Refetch data when changes occur
          fetchAnalytics();
        }
      )
      .subscribe((status) => {
        console.log("📡 Realtime subscription status:", status);
      });

    // Initial fetch
    fetchAnalytics();

    // Cleanup subscription
    return () => {
      console.log("🔌 Cleaning up analytics subscription");
      supabase.removeChannel(channel);
    };
  }, [fetchAnalytics, autoRefresh]);

  const getMetricValue = useCallback(
    (source: string, metric: string): number | null => {
      const record = data.find(
        (item) => item.source === source && item.metric === metric
      );
      return record?.value ?? null;
    },
    [data]
  );

  const getSourceMetrics = useCallback(
    (source: string): AnalyticsSnapshot[] => {
      return data.filter((item) => item.source === source);
    },
    [data]
  );

  const getLatestUpdate = useCallback((): string | null => {
    if (data.length === 0) return null;

    const latest = data.reduce((prev, current) =>
      new Date(current.updated_at) > new Date(prev.updated_at) ? current : prev
    );

    return latest.updated_at;
  }, [data]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
    getMetricValue,
    getSourceMetrics,
    getLatestUpdate,
  };
};
