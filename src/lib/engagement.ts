// src/lib/engagement.ts
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Recalculate engagement for a platform and store it on platform_stats.engagement
 * Simple formula:
 *   engagement% = (sum(likes+comments+shares) across top_posts for platform / followers) * 100
 * If followers is null/0, we'll set engagement to null to avoid bad numbers.
 */
export async function recalcEngagement(
  supabase: SupabaseClient,
  platform: "instagram" | "youtube" | "tiktok"
) {
  // 1) get interaction totals from top_posts
  const { data: posts, error: postsErr } = await supabase
    .from("top_posts")
    .select("likes, comments, shares")
    .eq("platform", platform);

  if (postsErr) throw postsErr;

  const totalInteractions = (posts || []).reduce((sum, p: any) => {
    const l = Number(p?.likes ?? 0);
    const c = Number(p?.comments ?? 0);
    const s = Number(p?.shares ?? 0);
    return sum + l + c + s;
  }, 0);

  // 2) get current followers from platform_stats
  const { data: stat, error: statErr } = await supabase
    .from("platform_stats")
    .select("followers")
    .eq("platform", platform)
    .single();

  if (statErr) {
    // If row doesn't exist yet, create an empty one so we can upsert engagement
    if (statErr.code !== "PGRST116") throw statErr;
  }

  const followers = Number(stat?.followers ?? 0);

  let engagement: number | null = null;
  if (followers > 0) {
    engagement = Number(((totalInteractions / followers) * 100).toFixed(2));
  }

  // 3) persist engagement back to platform_stats
  const { error: upErr } = await supabase.from("platform_stats").upsert(
    [
      {
        platform,
        engagement, // may be null
      },
    ],
    { onConflict: "platform" }
  );

  if (upErr) throw upErr;
}
