export function usePlatformStats() {
  const data = {
    instagram: { follower_count: 38700, monthly_views: 730000 },
    youtube: { follower_count: 8800, monthly_views: 86800 },
    tiktok: { follower_count: 1410, monthly_views: 37000 },
  };
  return {
    getPlatformStat: (p: keyof typeof data) => data[p],
    refetch: async () => {},
  };
}
