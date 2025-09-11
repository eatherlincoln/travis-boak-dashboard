// Platform-specific engagement rate calculations

// Instagram: ((Total Likes + Comments + Saves) / Reach) × 100
export function instagramEngagementRate({ likes = 0, comments = 0, saves = 0, reach = 0 }: { 
  likes?: number; 
  comments?: number; 
  saves?: number; 
  reach?: number; 
}) {
  if (!reach || reach <= 0) return null;
  return (likes + comments + saves) / reach;
}

// TikTok: ((Total Likes + Comments + Shares + Saves) / Total Views) × 100
export function tiktokEngagementRate({ likes = 0, comments = 0, shares = 0, saves = 0, totalViews = 0 }: { 
  likes?: number; 
  comments?: number; 
  shares?: number; 
  saves?: number; 
  totalViews?: number; 
}) {
  if (!totalViews || totalViews <= 0) return null;
  return (likes + comments + shares + saves) / totalViews;
}

// YouTube: Average of((Total Likes + Comments + Shares) / Total Views) × 100
export function youtubeEngagementRate({ likes = 0, comments = 0, shares = 0, totalViews = 0 }: { 
  likes?: number; 
  comments?: number; 
  shares?: number; 
  totalViews?: number; 
}) {
  if (!totalViews || totalViews <= 0) return null;
  return (likes + comments + shares) / totalViews;
}

// Legacy function for backward compatibility
export function erByReach({ likes = 0, comments = 0, saves = 0, reach = 0 }: { likes?: number; comments?: number; saves?: number; reach?: number }) {
  return instagramEngagementRate({ likes, comments, saves, reach });
}

export function formatPct(x: number | null, decimals = 2) {
  if (x === null) return '—';
  return `${(x * 100).toFixed(decimals)}%`;
}