// src/hooks/index.ts

// Audience
export { usePlatformAudience } from "./usePlatformAudience"; // default -> named
export { useFollowerTotals } from "./useFollowerTotals";

// Platform content & stats
export { useInstagramTopPosts } from "./useInstagramTopPosts";
export { useYouTubeTopVideos } from "./useYouTubeTopVideos";
export { useYouTubeStats } from "./useYouTubeStats";
export { usePlatformStats } from "./usePlatformStats";
export { useViewStats } from "./useViewStats";
export { useRealtimeAnalytics } from "./useRealtimeAnalytics";
export { useSocialMetrics } from "./useSocialMetrics";
export { useTikTokTopPosts } from "./useTikTokTopPosts";

// Refresh signal (single source of truth — NO duplicates)
export { useAutoRefresh, useRefreshSignal } from "./useAutoRefresh";
