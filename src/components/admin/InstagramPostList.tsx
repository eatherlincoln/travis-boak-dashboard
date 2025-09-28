import React, { useState } from "react";
import { supabase } from "@supabaseClient";
import SaveButton from "@/components/admin/SaveButton";
import ThumbnailPicker from "@/components/admin/ThumbnailPicker";

type PostInput = {
  url: string;
  image_url?: string;
  likes?: string | number;
  comments?: string | number;
  shares?: string | number;
};

const POSTS_TABLE = "top_posts";
const CONFLICT_KEY = "platform,url";

const toInt = (v: string | number | undefined | null): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n =
    typeof v === "number" ? v : parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

export default function InstagramPostList() {
  const [posts, setPosts] = useState<PostInput[]>([
    { url: "", image_url: "", likes: "", comments: "", shares: "" },
    { url: "", image_url: "", likes: "", comments: "", shares: "" },
    { url: "", image_url: "", likes: "", comments: "", shares: "" },
    { url: "", image_url: "", likes: "", comments: "", shares: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onField =
    (i: number, key: keyof PostInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = [...posts];
      next[i] = { ...next[i], [key]: e.target.value };
      setPosts(next);
    };

  const onImagePicked = (i: number, publicUrl: string) => {
    const next = [...posts];
    next[i] = { ...next[i], image_url: publicUrl };
    setPosts(next);
  };

  const handleSave = async () => {
    setMsg(null);
    setSaving(true);
    try {
      // Only rows with a URL
      const payload = posts
        .map((p, idx) => ({
          platform: "instagram" as const,
          rank: idx + 1, // 1..4
          url: (p.url || "").trim(),
          image_url: (p.image_url || "").trim() || null,
          likes: toInt(p.likes),
          comments: toInt(p.comments),
          shares: toInt(p.shares),
        }))
        .filter((p) => p.url.length > 0);

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
    <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-800">
          Instagram — Top Posts
        </h3>
        <SaveButton onClick={handleSave} saving={saving} label="Save Posts" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((p, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-200 p-4 space-y-3"
          >
            <label className="block text-xs font-medium text-neutral-700">
              Post URL
            </label>
            <input
              type="url"
              placeholder="https://www.instagram.com/p/…"
              value={p.url}
              onChange={onField(i, "url")}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700">
                  Thumbnail URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://…/image.jpg"
                  value={p.image_url || ""}
                  onChange={onField(i, "image_url")}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700">
                  Upload Thumbnail
                </label>
                <ThumbnailPicker
                  platform="instagram"
                  value={p.image_url || ""}
                  onChange={(url) => onImagePicked(i, url)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700">
                  Likes
                </label>
                <input
                  inputMode="numeric"
                  value={p.likes ?? ""}
                  onChange={onField(i, "likes")}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700">
                  Comments
                </label>
                <input
                  inputMode="numeric"
                  value={p.comments ?? ""}
                  onChange={onField(i, "comments")}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700">
                  Shares
                </label>
                <input
                  inputMode="numeric"
                  value={p.shares ?? ""}
                  onChange={onField(i, "shares")}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {msg && <p className="mt-3 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}
