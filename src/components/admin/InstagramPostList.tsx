import React, { useState } from "react";
import { supabase } from "@supabaseClient";
import SaveButton from "@/components/admin/SaveButton";
import ThumbnailPicker from "@/components/admin/ThumbnailPicker";

type PostInput = {
  url: string;
  image_url?: string;
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
    { url: "", image_url: "", likes: "", comments: "", shares: "" },
    { url: "", image_url: "", likes: "", comments: "", shares: "" },
    { url: "", image_url: "", likes: "", comments: "", shares: "" },
    { url: "", image_url: "", likes: "", comments: "", shares: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setMsg(null);
    setSaving(true);
    try {
      const payload = posts
        .map((p, i) => ({
          platform: "instagram" as const,
          rank: i + 1,
          url: (p.url || "").trim(),
          image_url: (p.image_url || "").trim() || null,
          likes: toInt(p.likes),
          comments: toInt(p.comments),
          shares: toInt(p.shares),
        }))
        // require a URL so we don’t create empty rows
        .filter((row) => row.url.length > 0);

      if (payload.length === 0) {
        setMsg("Nothing to save — add at least one post URL.");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("top_posts")
        .upsert(payload, { onConflict: "platform,rank" });

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
      <h3 className="mb-3 font-semibold">Instagram — Top Posts</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((p, i) => (
          <div key={i} className="rounded-xl border p-4">
            <label className="block text-sm font-medium">Post URL</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="https://www.instagram.com/p/…"
              value={p.url}
              onChange={(e) => {
                const next = [...posts];
                next[i] = { ...next[i], url: e.target.value };
                setPosts(next);
              }}
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium">
                  Thumbnail URL (optional)
                </label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="https://…/image.jpg"
                  value={p.image_url || ""}
                  onChange={(e) => {
                    const next = [...posts];
                    next[i] = { ...next[i], image_url: e.target.value };
                    setPosts(next);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Upload Thumbnail
                </label>
                <ThumbnailPicker
                  platform="instagram"
                  value={p.image_url || ""}
                  onChange={(publicUrl) => {
                    const next = [...posts];
                    next[i] = { ...next[i], image_url: publicUrl };
                    setPosts(next);
                  }}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium">Likes</label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  inputMode="numeric"
                  value={p.likes as any}
                  onChange={(e) => {
                    const next = [...posts];
                    next[i] = { ...next[i], likes: e.target.value };
                    setPosts(next);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Comments</label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  inputMode="numeric"
                  value={p.comments as any}
                  onChange={(e) => {
                    const next = [...posts];
                    next[i] = { ...next[i], comments: e.target.value };
                    setPosts(next);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Shares</label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  inputMode="numeric"
                  value={p.shares as any}
                  onChange={(e) => {
                    const next = [...posts];
                    next[i] = { ...next[i], shares: e.target.value };
                    setPosts(next);
                  }}
                />
              </div>
            </div>
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
