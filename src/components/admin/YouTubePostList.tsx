import React, { useState } from "react";
import { supabase } from "@supabaseClient";
import SaveButton from "@/components/admin/SaveButton";
import ThumbnailPicker from "@/components/admin/ThumbnailPicker";

const POSTS_TABLE = "top_posts";
const CONFLICT_KEY = "platform,rank";

type PostInput = {
  url: string;
  image_url?: string;
  views?: number | string;
  likes?: number | string;
  comments?: number | string;
};

const toInt = (v: string | number | undefined | null): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n =
    typeof v === "number" ? v : parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

export default function YouTubePostList() {
  const [posts, setPosts] = useState<PostInput[]>([
    { url: "", image_url: "", views: "", likes: "", comments: "" },
    { url: "", image_url: "", views: "", likes: "", comments: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setMsg(null);
    setSaving(true);
    try {
      const payload = posts
        .map((p, i) => ({
          platform: "youtube",
          rank: i + 1,
          url: (p.url || "").trim(),
          image_url: (p.image_url || "").trim() || null,
          views: toInt(p.views),
          likes: toInt(p.likes),
          comments: toInt(p.comments),
        }))
        .filter((row) => row.url.length > 0);

      const { error } = await supabase
        .from(POSTS_TABLE)
        .upsert(payload, { onConflict: CONFLICT_KEY });

      if (error) throw error;
      setMsg("YouTube posts saved ✅");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save YouTube posts.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
      <h3 className="text-sm font-semibold mb-4">YouTube — Top Videos</h3>
      <div className="grid grid-cols-1 gap-6">
        {posts.map((p, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4"
          >
            <div>
              <label className="block text-xs text-neutral-600 mb-1">
                Video URL
              </label>
              <input
                type="text"
                value={p.url}
                onChange={(e) => {
                  const next = [...posts];
                  next[i].url = e.target.value;
                  setPosts(next);
                }}
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder="https://youtube.com/watch?v=..."
              />
              <ThumbnailPicker
                platform="youtube"
                value={p.image_url || ""}
                onChange={(publicUrl) => {
                  const next = [...posts];
                  next[i].image_url = publicUrl;
                  setPosts(next);
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Views"
                value={p.views || ""}
                onChange={(e) => {
                  const next = [...posts];
                  next[i].views = e.target.value;
                  setPosts(next);
                }}
                className="rounded border px-2 py-1 text-sm"
              />
              <input
                type="text"
                placeholder="Likes"
                value={p.likes || ""}
                onChange={(e) => {
                  const next = [...posts];
                  next[i].likes = e.target.value;
                  setPosts(next);
                }}
                className="rounded border px-2 py-1 text-sm"
              />
              <input
                type="text"
                placeholder="Comments"
                value={p.comments || ""}
                onChange={(e) => {
                  const next = [...posts];
                  next[i].comments = e.target.value;
                  setPosts(next);
                }}
                className="rounded border px-2 py-1 text-sm"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <SaveButton onClick={handleSave} saving={saving} label="Save Posts" />
      </div>
      {msg && <p className="mt-2 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}
