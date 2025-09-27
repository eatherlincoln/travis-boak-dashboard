import React, { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import SaveButton from "@/components/admin/SaveButton";
import { useRefreshSignal } from "@/hooks"; // safe to keep; remove if you don't have it

const POSTS_TABLE = "top_posts";
const CONFLICT_KEY = "platform,url";

type PostInput = {
  id?: string;
  url: string;
  thumbnail_url?: string;
  likes?: number | string | null;
  comments?: number | string | null;
  shares?: number | string | null;
};

const toInt = (v: string | number | undefined | null): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n =
    typeof v === "number" ? v : parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

const emptyRow = (): PostInput => ({
  url: "",
  thumbnail_url: "",
  likes: null,
  comments: null,
  shares: null,
});

export default function TikTokPostList() {
  const [posts, setPosts] = useState<PostInput[]>([
    emptyRow(),
    emptyRow(),
    emptyRow(),
    emptyRow(),
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { tick } = useRefreshSignal?.() ?? { tick: () => {} };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from(POSTS_TABLE)
        .select("id, url, thumbnail_url, likes, comments, shares")
        .eq("platform", "tiktok")
        .order("updated_at", { ascending: false })
        .limit(4);

      if (!alive) return;
      if (error) {
        console.error("Load tiktok posts failed:", error.message);
        setLoading(false);
        return;
      }

      const rows =
        (data ?? []).map<PostInput>((r) => ({
          id: r.id,
          url: r.url ?? "",
          thumbnail_url: r.thumbnail_url ?? "",
          likes: r.likes ?? null,
          comments: r.comments ?? null,
          shares: r.shares ?? null,
        })) ?? [];

      const padded = [...rows];
      while (padded.length < 4) padded.push(emptyRow());
      setPosts(padded.slice(0, 4));
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setField = (i: number, patch: Partial<PostInput>) => {
    setPosts((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p))
    );
  };

  const handleSave = async () => {
    setMsg(null);
    setSaving(true);
    try {
      const payload = posts
        .filter((p) => (p.url || "").trim().length > 0)
        .map((p) => ({
          id: p.id,
          platform: "tiktok" as const,
          url: (p.url || "").trim(),
          thumbnail_url: (p.thumbnail_url || "").trim() || null,
          likes: toInt(p.likes),
          comments: toInt(p.comments),
          shares: toInt(p.shares),
        }));

      if (payload.length === 0) {
        setMsg("Nothing to save — add at least one post URL.");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from(POSTS_TABLE)
        .upsert(payload, { onConflict: CONFLICT_KEY });

      if (error) throw error;

      setMsg("TikTok posts saved ✅");
      tick();
    } catch (e: any) {
      setMsg(e?.message || "Failed to save TikTok posts.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-800">
          TikTok — Top Videos
        </h3>
        <SaveButton onClick={handleSave} saving={saving} label="Save Posts" />
      </div>

      {msg && <p className="mb-3 text-xs text-neutral-600">{msg}</p>}

      {loading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((p, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 p-3">
              <div className="mb-2 text-xs font-medium text-neutral-600">
                Video {i + 1}
              </div>

              <label className="block mb-2">
                <span className="text-[11px] text-neutral-500">Post URL</span>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="https://www.tiktok.com/@…/video/…"
                  value={p.url}
                  onChange={(e) => setField(i, { url: e.target.value })}
                />
              </label>

              <label className="block mb-3">
                <span className="text-[11px] text-neutral-500">
                  Thumbnail URL (optional)
                </span>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="https://…/image.jpg"
                  value={p.thumbnail_url ?? ""}
                  onChange={(e) =>
                    setField(i, { thumbnail_url: e.target.value })
                  }
                />
              </label>

              <div className="grid grid-cols-3 gap-2">
                <label className="block">
                  <span className="text-[11px] text-neutral-500">Likes</span>
                  <input
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    inputMode="numeric"
                    value={p.likes ?? ""}
                    onChange={(e) => setField(i, { likes: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] text-neutral-500">Comments</span>
                  <input
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    inputMode="numeric"
                    value={p.comments ?? ""}
                    onChange={(e) => setField(i, { comments: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] text-neutral-500">Shares</span>
                  <input
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    inputMode="numeric"
                    value={p.shares ?? ""}
                    onChange={(e) => setField(i, { shares: e.target.value })}
                  />
                </label>
              </div>

              {p.thumbnail_url ? (
                <div className="mt-3 overflow-hidden rounded-lg border">
                  <img
                    src={p.thumbnail_url}
                    alt=""
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
