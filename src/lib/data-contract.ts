// Single source of truth for DB → UI shapes

// ---------- Instagram (instagram_posts_public) ----------
export type InstagramPublicRow = {
  media_id: string;
  caption: string | null;
  permalink: string | null;
  media_url: string | null;
  like_count: number | null;
  comment_count: number | null;
  reach: number | null;
  saves: number | null;
  timestamp?: string | null;
  updated_at?: string | null;
};

export type IgPost = {
  id: string;
  media_url: string | null;
  permalink: string | null;
  like_count: number;
  comments_count: number;
  caption: string | null;
  reach: number;
  saves: number;
  updated_at: string | null;
};

export function normalizeInstagram(row: InstagramPublicRow): IgPost {
  return {
    id: row.media_id,
    media_url: row.media_url ?? null,
    permalink: row.permalink ?? null,
    like_count: Number(row.like_count ?? 0),
    comments_count: Number(row.comment_count ?? 0),
    caption: row.caption ?? null,
    reach: Number(row.reach ?? 0),
    saves: Number(row.saves ?? 0),
    updated_at: row.updated_at ?? row.timestamp ?? null,
  };
}

// ---------- YouTube channel stats (youtube_stats) ----------
export type YouTubeStatsRow = {
  id: string;
  channel_id: string | null;
  subscriber_count: number | null;
  view_count: number | null;
  video_count: number | null;
  updated_at: string | null;
  created_at: string | null;
};

export type YouTubeChannelStats = {
  id: string;
  channel_id: string | null;
  subscriber_count: number;
  view_count: number;
  video_count: number | null;
  updated_at: string | null;
  created_at: string | null;
};

export function normalizeYouTubeChannel(
  r: YouTubeStatsRow
): YouTubeChannelStats {
  return {
    id: r.id,
    channel_id: r.channel_id ?? null,
    subscriber_count: Number(r.subscriber_count ?? 0),
    view_count: Number(r.view_count ?? 0),
    video_count: r.video_count == null ? null : Number(r.video_count),
    updated_at: r.updated_at ?? null,
    created_at: r.created_at ?? null,
  };
}

// ---------- Platform totals (platform_stats) ----------
export type PlatformStatsRow = {
  platform: string;
  follower_count: number | null;
  monthly_views: number | null;
  engagement_rate: number | null;
  updated_at: string | null;
};

export type FollowerTotal = {
  platform: string;
  followers: number;
  monthly_views: number;
  engagement_rate: number;
  updated_at: string | null;
};

export function normalizeFollowerTotal(r: PlatformStatsRow): FollowerTotal {
  return {
    platform: String(r.platform ?? "unknown"),
    followers: Number(r.follower_count ?? 0),
    monthly_views: Number(r.monthly_views ?? 0),
    engagement_rate: Number(r.engagement_rate ?? 0),
    updated_at: r.updated_at ?? null,
  };
}

// ---------- Demographics (platform_audience) ----------
export type PlatformAudienceRow = {
  platform: string;
  gender: Record<string, number>;
  age_groups: { range: string; percentage: number }[];
  countries: { country: string; percentage: number }[];
  cities: string[];
  updated_at: string;
};

export type AudienceDemographics = PlatformAudienceRow; // already UI-ready
