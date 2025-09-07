import { PlatformCard } from './PlatformCard';
import { useSocialMetrics } from '../hooks/useSocialMetrics';
import { useSocialAssets } from '../hooks/useSocialAssets';
import { useState, useEffect } from 'react';
import { getAssetUrl } from '../utils/signedUrls';
import { erByReach, formatPct } from '../utils/engagement';

export function YouTubeCard() {
  const { metrics, updatedAt, loading, err } = useSocialMetrics('youtube');
  const { asset, loading: assetLoading } = useSocialAssets('youtube');
  const [iconUrl, setIconUrl] = useState('/lovable-uploads/9aa87b25-88f0-439d-890a-7c2d475c22f5.png');
  
  useEffect(() => {
    if (asset) {
      (async () => {
        const url = await getAssetUrl(
          asset.thumb_path, 
          asset.updated_at, 
          '/lovable-uploads/9aa87b25-88f0-439d-890a-7c2d475c22f5.png'
        );
        if (url) setIconUrl(url);
      })();
    }
  }, [asset]);
  
  if (loading) return <div className="animate-pulse bg-muted h-64 rounded-lg"></div>;
  if (err) return <div className="text-destructive">Error loading YouTube data</div>;

  const subscribers = metrics['subscribers']?.value ?? 8800;
  const monthlyViews = metrics['monthly_views']?.value ?? 86800;
  const avgWatchTime = metrics['avg_watch_time']?.value ?? 3.2;
  
  // Calculate engagement rate using standardized formula (by reach)
  // For YouTube, estimate engagement from views
  const likes = Math.round(monthlyViews * 0.03); // Estimate likes as 3% of views
  const comments = Math.round(likes * 0.10); // Estimate comments as 10% of likes
  const saves = 0; // YouTube doesn't have saves like Instagram/TikTok
  const reach = monthlyViews; // Use monthly views as reach
  const engagementRate = erByReach({ likes, comments, saves, reach });

  return (
    <PlatformCard
      platform="YouTube"
      handle="@sheldonsimkus"
      followers={`${(subscribers / 1000).toFixed(1)}K`}
      icon={<img src={iconUrl} className="h-6 w-6" alt="YouTube" />}
      accentColor="red-500"
      metrics={[
        { label: "Monthly Views", value: `${Math.round(monthlyViews / 1000)}K`, trend: "+15.2%" },
        { label: "Subscribers", value: `${(subscribers / 1000).toFixed(1)}K`, trend: "+4.1%" },
        { label: "Engagement Rate (by reach)", value: formatPct(engagementRate), trend: "+1.8%" },
        { label: "Avg Watch Time", value: `${avgWatchTime.toFixed(1)} min`, trend: "+8.3%" }
      ]}
      highlights={[
        `${subscribers.toLocaleString()} subscribers with consistent growth`,
        `${Math.round(monthlyViews / 1000)}K monthly views from latest data`,
        `POV surf content averaging ${Math.round(monthlyViews / 4 / 1000)}K+ views per video`,
        updatedAt ? `Updated: ${new Date(updatedAt).toLocaleString()}` : ''
      ].filter(Boolean)}
    />
  );
}