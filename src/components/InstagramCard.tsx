import { PlatformCard } from './PlatformCard';
import { useSocialMetrics } from '../hooks/useSocialMetrics';
import { useSocialAssets } from '../hooks/useSocialAssets';
import { useInstagramMonthlyLikes } from '../hooks/useInstagramMonthlyLikes';
import { useState, useEffect } from 'react';
import { getAssetUrl } from '../utils/signedUrls';
import { instagramEngagementRate, formatPct } from '../utils/engagement';
import { usePlatformStats } from '../hooks/usePlatformStats';

export function InstagramCard() {
  const { metrics, updatedAt, loading, err } = useSocialMetrics('instagram');
  const { asset, loading: assetLoading } = useSocialAssets('instagram');
  const { map: monthlyLikesMap, loading: likesLoading } = useInstagramMonthlyLikes();
  const { getPlatformStat, loading: statsLoading } = usePlatformStats();
  const stat = getPlatformStat('instagram');
  const [iconUrl, setIconUrl] = useState('/lovable-uploads/502a8d59-4e94-4c4a-94c8-4e5f78e6decf.png');
  
  useEffect(() => {
    if (asset) {
      (async () => {
        const url = await getAssetUrl(
          asset.thumb_path, 
          asset.updated_at, 
          '/lovable-uploads/502a8d59-4e94-4c4a-94c8-4e5f78e6decf.png'
        );
        if (url) setIconUrl(url);
      })();
    }
  }, [asset]);
  
  if (loading || likesLoading || statsLoading) return <div className="animate-pulse bg-muted h-64 rounded-lg"></div>;
  if (err) return <div className="text-destructive">Error loading Instagram data</div>;

  const followers = stat?.follower_count ?? metrics['followers']?.value ?? 38700;
  const videoViews = stat?.monthly_views ?? metrics['monthly_views']?.value ?? 314500;
  
  // Get current month's likes from unified calculation
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const monthlyLikes = monthlyLikesMap[currentMonth] ?? 15000;
  
  // Prefer admin-provided engagement rate; otherwise, compute conservatively
  const likes = monthlyLikes;
  const comments = Math.round(likes * 0.02); // ~2% of likes become comments
  const saves = Math.round(likes * 0.01); // ~1% of likes become saves
  const reach = videoViews; // Use monthly views as reach proxy
  let engagementRate = stat?.engagement_rate ?? instagramEngagementRate({ likes, comments, saves, reach }) ?? 0;
  const clamp = (x: number) => Math.max(0.003, Math.min(0.03, x)); // 0.3%–3.0%
  engagementRate = clamp(engagementRate);
  
  // Derive interactions from ER × views to stay consistent with displayed rate
  const monthlyInteractions = Math.round(engagementRate * videoViews);

  return (
    <PlatformCard
      platform="Instagram"
      handle="@sheldonsimkus"
      followers={`${(followers / 1000).toFixed(1)}K`}
      icon={<img src={iconUrl} className="h-6 w-6" alt="Instagram" />}
      accentColor="pink-500"
      metrics={[
        { label: "Video Views", value: `${Math.round(videoViews / 1000)}K`, trend: "+8.7%" },
        { label: "Monthly Likes", value: `${Math.round(monthlyLikes / 1000)}K`, trend: "+12.1%" },
        { label: "Engagement Rate (by reach)", value: formatPct(engagementRate), trend: "+0.5%" },
        { label: "Followers", value: `${(followers / 1000).toFixed(1)}K`, trend: "+2.3%" }
      ]}
      highlights={[
        `${formatPct(engagementRate)} engagement rate ${engagementRate && engagementRate > 0.02 ? '(above industry avg)' : '(in line with industry)'}`,
        `${Math.round(monthlyInteractions / 1000)}K monthly interactions`,
        `${(followers / 1000).toFixed(1)}K engaged followers`,
        (stat?.updated_at || updatedAt) ? `Updated: ${new Date(stat?.updated_at || updatedAt).toLocaleString()}` : ''
      ].filter(Boolean)}
    />
  );
}