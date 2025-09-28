// src/hooks/index.ts
// === Platform content (top posts) ===
export { useInstagramTopPosts } from "./useInstagramTopPosts";
export { useYouTubeTopVideos } from "./useYouTubeTopVideos";
export { useTikTokTopPosts } from "./useTikTokTopPosts";

// === Stats & audience ===
export { useYouTubeStats } from "./useYouTubeStats";
export { useFollowerTotals } from "./useFollowerTotals";
export { usePlatformAudience } from "./usePlatformAudience";

// === Refresh signal (for admin -> frontend updates) ===
export { useAutoRefresh, useRefreshSignal } from "./useAutoRefresh";
