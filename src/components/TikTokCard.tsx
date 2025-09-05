import { PlatformCard } from './PlatformCard';
import { useSocialMetrics } from '../hooks/useSocialMetrics';
import { useSocialAssets } from '../hooks/useSocialAssets';
import { useState, useEffect } from 'react';
import { getAssetUrl } from '../utils/signedUrls';

export function TikTokCard() {
  const { metrics, updatedAt, loading, err } = useSocialMetrics('tiktok');
  const { asset, loading: assetLoading } = useSocialAssets('tiktok');
  const [iconUrl, setIconUrl] = useState('/lovable-uploads/d3d646ba-e348-45c2-9a7b-d3f53ff73b4c.png');
  
  useEffect(() => {
    if (asset) {
      (async () => {
        const url = await getAssetUrl(
          asset.thumb_path, 
          asset.updated_at, 
          '/lovable-uploads/d3d646ba-e348-45c2-9a7b-d3f53ff73b4c.png'
        );
        if (url) setIconUrl(url);
      })();
    }
  }, [asset]);
  
  if (loading) return <div className="animate-pulse bg-muted h-64 rounded-lg"></div>;
  if (err) return <div className="text-destructive">Error loading TikTok data</div>;

  const followers = metrics['followers']?.value ?? 1410;
  const videoViews = metrics['video_views']?.value ?? 37000;
  const monthlyLikes = metrics['monthly_likes']?.value ?? 8000;
  const engagementRate = metrics['engagement_rate']?.value ?? 9.1;

  return (
    <PlatformCard
      platform="TikTok"
      handle="@sheldonsimkus"
      followers={`${(followers / 1000).toFixed(1)}K`}
      icon={<img src={iconUrl} className="h-6 w-6" alt="TikTok" />}
      accentColor="black"
      metrics={[
        { label: "Video Views", value: `${Math.round(videoViews / 1000)}K`, trend: "+23.4%" },
        { label: "Monthly Likes", value: `${Math.round(monthlyLikes / 1000)}K`, trend: "+28.9%" },
        { label: "Engagement Rate", value: `${engagementRate.toFixed(1)}%`, trend: "+3.2%" },
        { label: "Followers", value: `${(followers / 1000).toFixed(1)}K`, trend: "+18.5%" }
      ]}
      highlights={[
        `${engagementRate.toFixed(1)}% engagement rate ${engagementRate > 8 ? '(excellent performance)' : '(growing)'}`,
        `${Math.round((monthlyLikes + (monthlyLikes * 0.08) + (monthlyLikes * 0.15)) / 1000)}K monthly interactions`,
        `Growing platform with ${(followers / 1000).toFixed(1)}K followers and high viral potential`,
        updatedAt ? `Updated: ${new Date(updatedAt).toLocaleString()}` : ''
      ].filter(Boolean)}
    />
  );
}