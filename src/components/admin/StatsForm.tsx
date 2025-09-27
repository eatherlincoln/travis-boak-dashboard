import React, { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks";
import {
  AdminInput,
  AdminLabel,
  AdminNote,
} from "@/components/admin/ui/AdminInput";

/**
 * A simple cross-platform metrics editor:
 * - instagram_followers, instagram_monthly_views
 * - youtube_subscribers, youtube_monthly_views
 * - tiktok_followers, tiktok_monthly_views
 * (Adjust to match your exact column names if different.)
 */
type Stats = {
  instagram_followers: number | null;
  instagram_monthly_views: number | null;
  youtube_subscribers: number | null;
  youtube_monthly_views: number | null;
  tiktok_followers: number | null;
  tiktok_monthly_views: number | null;
};

const toInt = (v: string) => {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null;
};

export default function StatsForm() {
  const [stats, setStats] = useState<Stats>({
    instagram_followers: null,
    instagram_monthly_views: null,
    youtube_subscribers: null,
    youtube_monthly_views: null,
    tiktok_followers: null,
    tiktok_monthly_views: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const { tick } = useRefreshSignal();

  // Load the single latest snapshot from your existing stats table
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("platform_stats")
        .select(
          "instagram_followers, instagram_monthly_views, youtube_subscribers, youtube_monthly_views, tiktok_followers, tiktok_monthly_views"
        )
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;
      if (error) {
        console.error("Load platform_stats failed:", error.message);
        setLoading(false);
        return;
      }
      if (data) {
        setStats({
          instagram_followers: data.instagram_followers ?? null,
          instagram_monthly_views: data.instagram_monthly_views ?? null,
          youtube_subscribers: data.youtube_subscribers ?? null,
          youtube_monthly_views: data.youtube_monthly_views ?? null,
          tiktok_followers: data.tiktok_followers ?? null,
          tiktok_monthly_views: data.tiktok_monthly_views ?? null,
        });
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const set = (patch: Partial<Stats>) => setStats((s) => ({ ...s, ...patch }));

  const save = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      const { error } = await supabase.from("platform_stats").insert({
        ...stats,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setStatus("saved");
      tick();
    } catch (e: any) {
      console.error(e);
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">
            Platform Metrics
          </h3>
          <AdminNote>
            Update core follower + monthly view counts for each platform.
          </AdminNote>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {status === "saved" && (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          Saved!
        </div>
      )}
      {status === "error" && (
        <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          Couldn’t save. Check your connection and try again.
        </div>
      )}

      {loading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Instagram */}
          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="mb-2 text-sm font-medium">Instagram</div>
            <div className="space-y-3">
              <div>
                <AdminLabel>Followers</AdminLabel>
                <AdminInput
                  inputMode="numeric"
                  value={stats.instagram_followers ?? ""}
                  onChange={(e) =>
                    set({ instagram_followers: toInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <AdminLabel>Monthly Views</AdminLabel>
                <AdminInput
                  inputMode="numeric"
                  value={stats.instagram_monthly_views ?? ""}
                  onChange={(e) =>
                    set({ instagram_monthly_views: toInt(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          {/* YouTube */}
          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="mb-2 text-sm font-medium">YouTube</div>
            <div className="space-y-3">
              <div>
                <AdminLabel>Subscribers</AdminLabel>
                <AdminInput
                  inputMode="numeric"
                  value={stats.youtube_subscribers ?? ""}
                  onChange={(e) =>
                    set({ youtube_subscribers: toInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <AdminLabel>Monthly Views</AdminLabel>
                <AdminInput
                  inputMode="numeric"
                  value={stats.youtube_monthly_views ?? ""}
                  onChange={(e) =>
                    set({ youtube_monthly_views: toInt(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          {/* TikTok */}
          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="mb-2 text-sm font-medium">TikTok</div>
            <div className="space-y-3">
              <div>
                <AdminLabel>Followers</AdminLabel>
                <AdminInput
                  inputMode="numeric"
                  value={stats.tiktok_followers ?? ""}
                  onChange={(e) =>
                    set({ tiktok_followers: toInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <AdminLabel>Monthly Views</AdminLabel>
                <AdminInput
                  inputMode="numeric"
                  value={stats.tiktok_monthly_views ?? ""}
                  onChange={(e) =>
                    set({ tiktok_monthly_views: toInt(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
