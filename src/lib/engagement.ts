// src/lib/engagement.ts
import { supabase } from "@supabaseClient";

export type Platform = "instagram" | "youtube" | "tiktok";

/**
 * engagement% = ((sum(likes+comments+shares) across top_posts) / (monthly_views || followers)) * 100
 * Rounded to 2 decimals. Persists to platform_stats.engagement for the platform.
 */
export async function recalcEngagement(platform: Platform) {
  // 1) sum interactions from top_posts
  const { data: posts, error: postsErr } = await supabase
    .from("top_posts")
    .select("likes,comments,shares")
    .eq("platform", platform);

  if (postsErr) throw postsErr;

  const interactions =
    posts?.reduce(
      (sum, p) => sum + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0),
      0
    ) ?? 0;

  // 2) pick denominator from platform_stats
  const { data: stats, error: statsErr } = await supabase
    .from("platform_stats")
    .select("monthly_views, followers")
    .eq("platform", platform)
    .maybeSingle();

  if (statsErr) throw statsErr;

  const denom =
    (stats?.monthly_views ?? 0) > 0
      ? (stats!.monthly_views as number)
      : stats?.followers ?? 0;

  const engagement =
    denom > 0 ? Number(((interactions / denom) * 100).toFixed(2)) : null;

  // 3) persist
  const { error: upErr } = await supabase
    .from("platform_stats")
    .upsert([{ platform, engagement }], { onConflict: "platform" });

  if (upErr) throw upErr;
}
