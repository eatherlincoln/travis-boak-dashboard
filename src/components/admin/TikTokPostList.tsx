import React, { useState } from "react";
import { supabase } from "@supabaseClient";
import SaveButton from "@/components/admin/SaveButton";
import ThumbnailPicker from "@/components/admin/ThumbnailPicker";

const POSTS_TABLE = "top_posts";
const CONFLICT_KEY = "platform,url";

type PostInput = {
  url: string;
  thumbnail_url?: string;
  likes?: number | string;
  comments?: number | string;
  shares?: number | string;
};

const toInt = (v: string | number | undefined | null): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n =
    typeof v === "number" ? v : parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

export default function TikTokPostList() {
  const [posts, setPosts] = useState<PostInput[]>([
    { url: "", thumbnail_url: "", likes: "", comments: "", shares: "" },
    { url: "", thumbnail_url: "", likes: "", comments: "", shares: "" },
    { url: "", thumbnail_url: "", likes: "", comments: "", shares: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setMsg(null);
    setSaving(true);
    try {
      const payload = posts
        .filter((p) => (p.url || "").trim().length > 0)
        .map((p) => ({
          platform: "tiktok",
          url: (p.url || "").trim(),
          thumbnail_url: (p.thumbnail_url || "").trim() || null,
          likes: toInt(p.likes),
          comments: toInt(p.comments),
          shares: toInt(p.shares),
        }));

      if (payload.length === 0) {
        setMsg("Nothing to save — add at least one video URL.");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from(POSTS_TABLE)
        .upsert(payload, { onConflict: CONFLICT_KEY });

      if (error) throw error;

      setMsg("TikTok posts saved ✅");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save TikTok posts.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-black">TikTok Posts</h3>

      <div className="space-y-4">
        {posts.map((p, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Video URL"
              value={p.url}
              onChange={(e) => {
                const next = [...posts];
                next[i].url = e.target.value;
                setPosts(next);
              }}
              className="col-span-2 rounded border px-2 py-1 text-sm"
            />

            <ThumbnailPicker
              platform="tiktok"
              value={p.thumbnail_url || ""}
              onChange={(url) => {
                const next = [...posts];
                next[i].thumbnail_url = url;
                setPosts(next);
              }}
            />

            <input
              type="number"
              placeholder="Likes"
              value={p.likes ?? ""}
              onChange={(e) => {
                const next = [...posts];
                next[i].likes = e.target.value;
                setPosts(next);
              }}
              className="rounded border px-2 py-1 text-sm"
            />
            <input
              type="number"
              placeholder="Comments"
              value={p.comments ?? ""}
              onChange={(e) => {
                const next = [...posts];
                next[i].comments = e.target.value;
                setPosts(next);
              }}
              className="rounded border px-2 py-1 text-sm"
            />
            <input
              type="number"
              placeholder="Shares"
              value={p.shares ?? ""}
              onChange={(e) => {
                const next = [...posts];
                next[i].shares = e.target.value;
                setPosts(next);
              }}
              className="rounded border px-2 py-1 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <SaveButton onClick={handleSave} saving={saving} label="Save Posts" />
      </div>
      {msg && <p className="mt-2 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}
