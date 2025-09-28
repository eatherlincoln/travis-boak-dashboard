import React, { useState } from "react";
import { supabase } from "@supabaseClient";
import SaveButton from "@/components/admin/SaveButton";
import ThumbnailPicker from "@/components/admin/ThumbnailPicker";

type PostInput = {
  url: string;
  image_url?: string; // we store the uploaded public URL here
  views?: number | string;
  likes?: number | string;
  comments?: number | string;
  title?: string;
};

const toInt = (v: string | number | undefined | null): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n =
    typeof v === "number" ? v : parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

export default function YouTubePostList() {
  // exactly 2 slots, rank 1..2
  const [posts, setPosts] = useState<PostInput[]>([
    { url: "", image_url: "", views: "", likes: "", comments: "", title: "" },
    { url: "", image_url: "", views: "", likes: "", comments: "", title: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const update = (i: number, patch: Partial<PostInput>) =>
    setPosts((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const payload = posts.map((p, i) => ({
        platform: "youtube" as const,
        rank: i + 1,
        url: (p.url || "").trim(),
        image_url: (p.image_url || "").trim() || null,
        caption: (p.title || "").trim() || null,
        views: toInt(p.views),
        likes: toInt(p.likes),
        comments: toInt(p.comments),
      }));

      const { error } = await supabase
        .from("top_posts")
        .upsert(payload, { onConflict: "platform,rank" });

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
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">YouTube — Top Videos</h3>
        <SaveButton onClick={handleSave} saving={saving} label="Save Posts" />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {posts.map((p, i) => (
          <div key={i} className="rounded-xl border p-4">
            <label className="block text-xs font-medium text-neutral-600">
              Video URL
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="https://youtube.com/watch?v=..."
              value={p.url}
              onChange={(e) => update(i, { url: e.target.value })}
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Thumbnail URL (optional)
                </label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="https://…/image.jpg"
                  value={p.image_url || ""}
                  onChange={(e) => update(i, { image_url: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Upload Thumbnail
                </label>
                <div className="mt-1">
                  <ThumbnailPicker
                    platform="youtube"
                    value={p.image_url || ""}
                    onChange={(publicUrl) =>
                      update(i, { image_url: publicUrl })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Views
                </label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  inputMode="numeric"
                  value={p.views as any}
                  onChange={(e) => update(i, { views: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Likes
                </label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  inputMode="numeric"
                  value={p.likes as any}
                  onChange={(e) => update(i, { likes: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Comments
                </label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  inputMode="numeric"
                  value={p.comments as any}
                  onChange={(e) => update(i, { comments: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-neutral-600">
                Title (optional)
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                value={p.title || ""}
                onChange={(e) => update(i, { title: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      {msg && <p className="mt-3 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}
