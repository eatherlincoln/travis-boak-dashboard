// src/lib/engagement.ts
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Engagement Rate (platform-level) =
 *   (sum of likes+comments+shares across top_posts for that platform) / followers * 100
 *
 * Returns the computed percentage rounded to 2dp (e.g., 2.13).
 */
export async function recalcEngagement(
  supabase: SupabaseClient,
  platform: "instagram" | "youtube" | "tiktok"
): Promise<number> {
  // Sum interactions from top_posts
  const { data: posts, error: postsErr } = await supabase
    .from("top_posts")
    .select("likes,comments,shares")
    .eq("platform", platform);

  if (postsErr) throw postsErr;

  const totalInteractions = (posts ?? []).reduce((sum, p) => {
    const l = Number(p.likes ?? 0);
    const c = Number(p.comments ?? 0);
    const s = Number(p.shares ?? 0);
    return sum + l + c + s;
  }, 0);

  // Read followers from platform_stats
  const { data: stat, error: statErr } = await supabase
    .from("platform_stats")
    .select("followers")
    .eq("platform", platform)
    .maybeSingle();

  if (statErr) throw statErr;

  const followers = Number(stat?.followers ?? 0);
  const engagement =
    followers > 0 ? +((totalInteractions / followers) * 100).toFixed(2) : 0;

  // Write it back
  const { error: upErr } = await supabase
    .from("platform_stats")
    .upsert({ platform, engagement }, { onConflict: "platform" });

  if (upErr) throw upErr;

  return engagement;
}

/** Helper to recalc for all three platforms */
export async function recalcAllEngagements(supabase: SupabaseClient) {
  const platforms: Array<"instagram" | "youtube" | "tiktok"> = [
    "instagram",
    "youtube",
    "tiktok",
  ];
  for (const p of platforms) {
    try {
      await recalcEngagement(supabase, p);
    } catch {
      // don't explode the whole save; skip platform errors quietly
    }
  }
}
