import { PlatformCard } from './PlatformCard';
import { useSocialMetrics } from '../hooks/useSocialMetrics';
import { useState, useEffect } from 'react';
import { getThumbUrl } from '../utils/signedUrls';

export function InstagramCard() {
  const { metrics, updatedAt, loading, err } = useSocialMetrics('instagram');
  const [iconUrl, setIconUrl] = useState('');
  
  useEffect(() => {
    (async () => {
      const url = await getThumbUrl('instagram-icon.png', '/lovable-uploads/502a8d59-4e94-4c4a-94c8-4e5f78e6decf.png');
      setIconUrl(url);
    })();
  }, []);
  
  if (loading) return <div className="animate-pulse bg-muted h-64 rounded-lg"></div>;
  if (err) return <div className="text-destructive">Error loading Instagram data</div>;

  const followers = metrics['followers']?.value ?? 38700;
  const videoViews = metrics['video_views']?.value ?? 730000;
  const monthlyLikes = metrics['monthly_likes']?.value ?? 15000;
  const engagementRate = metrics['engagement_rate']?.value ?? 4.2;

  return (
    <PlatformCard
      platform="Instagram"
      handle="@sheldonsimkus"
      followers={`${(followers / 1000).toFixed(1)}K`}
      icon={iconUrl ? <img src={iconUrl} className="h-6 w-6" alt="Instagram" /> : <div className="h-6 w-6 bg-muted animate-pulse rounded" />}
      accentColor="pink-500"
      metrics={[
        { label: "Video Views", value: `${Math.round(videoViews / 1000)}K`, trend: "+8.7%" },
        { label: "Monthly Likes", value: `${Math.round(monthlyLikes / 1000)}K`, trend: "+12.1%" },
        { label: "Engagement Rate", value: `${engagementRate.toFixed(1)}%`, trend: "+0.5%" },
        { label: "Followers", value: `${(followers / 1000).toFixed(1)}K`, trend: "+2.3%" }
      ]}
      highlights={[
        `${engagementRate.toFixed(1)}% engagement rate ${engagementRate > 3.5 ? '(above industry avg)' : '(growing)'}`,
        `${Math.round((monthlyLikes + (monthlyLikes * 0.15) + (monthlyLikes * 0.05)) / 1000)}K monthly interactions`,
        `${(followers / 1000).toFixed(1)}K engaged followers with strong save rate`,
        updatedAt ? `Updated: ${new Date(updatedAt).toLocaleString()}` : ''
      ].filter(Boolean)}
    />
  );
}