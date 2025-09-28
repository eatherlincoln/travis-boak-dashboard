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

export default function InstagramPostList() {
  const [posts, setPosts] = useState<PostInput[]>([
    { url: "", thumbnail_url: "", likes: "", comments: "", shares: "" },
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
        .map((p, i) => ({
          platform: "instagram",
          rank: i + 1, // enforce rank
          url: (p.url || "").trim(),
          thumbnail_url: (p.thumbnail_url || "").trim() || null,
          likes: toInt(p.likes),
          comments: toInt(p.comments),
          shares: toInt(p.shares),
          updated_at: new Date().toISOString(), // force cache busting
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
      setMsg("Instagram posts saved ✅");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save Instagram posts.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm space-y-4">
      {posts.map((post, i) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={post.url}
            onChange={(e) => {
              const next = [...posts];
              next[i].url = e.target.value;
              setPosts(next);
            }}
            placeholder="Post URL"
            className="rounded border px-2 py-1 text-sm w-full"
          />
          <ThumbnailPicker
            platform="instagram"
            value={post.thumbnail_url || ""}
            onChange={(publicUrl) => {
              const next = [...posts];
              next[i].thumbnail_url = publicUrl;
              setPosts(next);
            }}
          />
        </div>
      ))}

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} saving={saving} label="Save Posts" />
      </div>

      {msg && <p className="mt-2 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}
