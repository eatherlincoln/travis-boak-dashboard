// src/lib/engagement.ts
export type EngagementInputs = {
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  views?: number | null;
};

export type EngagementContext = {
  followers?: number | null; // subscribers for YT counts as followers
  reach?: number | null; // if you capture reach, use it first
};

/**
 * Platform-agnostic engagement rate.
 *
 * - If you have REACH for the content set, use that as denominator.
 * - Else use FOLLOWERS/SUBSCRIBERS (industry standard).
 * - If neither is present but VIEWS exist (e.g., YouTube video), fall back to views.
 *
 * Formula: (likes + comments + shares) / denominator * 100
 */
export function computeEngagement(
  post: EngagementInputs,
  ctx: EngagementContext
): number {
  const likes = post.likes ?? 0;
  const comments = post.comments ?? 0;
  const shares = post.shares ?? 0;

  const numerator = likes + comments + shares;

  const denom =
    (ctx.reach ?? 0) > 0
      ? (ctx.reach as number)
      : (ctx.followers ?? 0) > 0
      ? (ctx.followers as number)
      : post.views ?? 0;

  if (!denom || denom <= 0) return 0;

  return (numerator / denom) * 100;
}

/**
 * Average engagement across an array of posts.
 * We compute per-post then average (avoids huge outliers dominating).
 */
export function averageEngagement(
  posts: EngagementInputs[],
  ctx: EngagementContext
): number {
  if (!posts.length) return 0;
  const vals = posts
    .map((p) => computeEngagement(p, ctx))
    .filter((v) => isFinite(v));
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
