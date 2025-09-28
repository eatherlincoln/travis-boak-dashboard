import React, { useState } from "react";
import { supabase } from "@supabaseClient";
import ThumbnailPicker from "@/components/admin/ThumbnailPicker";
import SaveButton from "@/components/admin/SaveButton";

type PostInput = {
  url: string; // video URL
  thumbnail_url?: string;
  likes?: number | string;
  comments?: number | string;
  shares?: number | string;
  caption?: string; // title/description (optional)
};

const toInt = (v: string | number | undefined | null): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n =
    typeof v === "number" ? v : parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

export default function YouTubePostList() {
  const [posts, setPosts] = useState<PostInput[]>(
    Array.from({ length: 4 }, () => ({
      url: "",
      thumbnail_url: "",
      likes: "",
      comments: "",
      shares: "",
      caption: "",
    }))
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const setField = (i: number, key: keyof PostInput, val: any) =>
    setPosts((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: val };
      return next;
    });

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const payload = posts.map((p, idx) => ({
        platform: "youtube" as const,
        rank: idx + 1,
        url: (p.url || "").trim() || null,
        image_url: (p.thumbnail_url || "").trim() || null,
        caption: (p.caption || "").trim() || null,
        likes: toInt(p.likes),
        comments: toInt(p.comments),
        shares: toInt(p.shares),
        meta: {},
      }));

      const { error } = await supabase
        .from("top_posts")
        .upsert(payload, { onConflict: "platform,rank" });

      if (error) throw error;
      setMsg("YouTube posts saved ✓");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save YouTube posts.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">YouTube — Top Videos</h3>
        <SaveButton onClick={handleSave} saving={saving} label="Save Posts" />
      </div>

      <p className="mb-4 text-xs text-neutral-500">
        Paste the video URL and/or add a thumbnail. Up to 4 items.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {posts.map((post, i) => (
          <div key={i} className="rounded-xl border p-4">
            <div className="mb-2 text-xs font-medium text-neutral-700">
              Video {i + 1}
            </div>

            <label className="block text-xs text-neutral-500">Video URL</label>
            <input
              className="mb-3 mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="https://youtube.com/watch?v=…"
              value={post.url}
              onChange={(e) => setField(i, "url", e.target.value)}
            />

            <label className="block text-xs text-neutral-500 mb-1">
              Thumbnail (upload or paste URL)
            </label>
            <ThumbnailPicker
              platform="youtube"
              value={post.thumbnail_url || ""}
              onChange={(url) => setField(i, "thumbnail_url", url)}
            />

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-neutral-500">Likes</label>
                <input
                  inputMode="numeric"
                  className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                  value={post.likes as any}
                  onChange={(e) => setField(i, "likes", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500">
                  Comments
                </label>
                <input
                  inputMode="numeric"
                  className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                  value={post.comments as any}
                  onChange={(e) => setField(i, "comments", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500">Shares</label>
                <input
                  inputMode="numeric"
                  className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                  value={post.shares as any}
                  onChange={(e) => setField(i, "shares", e.target.value)}
                />
              </div>
            </div>

            <label className="mt-3 block text-xs text-neutral-500">
              Title / Caption (optional)
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={post.caption || ""}
              onChange={(e) => setField(i, "caption", e.target.value)}
            />
          </div>
        ))}
      </div>

      {msg && <p className="mt-3 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}
