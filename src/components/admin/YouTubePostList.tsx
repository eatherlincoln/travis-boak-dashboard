import React, { useState } from "react";
import { supabase } from "@supabaseClient";
import SaveButton from "@/components/admin/SaveButton";
import ThumbnailPicker from "@/components/admin/ThumbnailPicker";
import { useRefreshSignal } from "@/hooks";

type PostInput = {
  url: string;
  image_url?: string;
  caption?: string;
  views?: string | number;
  likes?: string | number;
  comments?: string | number;
};

const toInt = (v: string | number | undefined | null): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n =
    typeof v === "number" ? v : parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

export default function YouTubePostList() {
  const [posts, setPosts] = useState<PostInput[]>(
    Array.from({ length: 2 }, () => ({
      url: "",
      image_url: "",
      caption: "",
      views: "",
      likes: "",
      comments: "",
    }))
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { bump } = useRefreshSignal();

  const update = (i: number, patch: Partial<PostInput>) => {
    const next = [...posts];
    next[i] = { ...next[i], ...patch };
    setPosts(next);
  };

  const handleSave = async () => {
    setMsg(null);
    setSaving(true);
    try {
      const payload = posts
        .map((p, i) => ({
          platform: "youtube" as const,
          rank: i + 1,
          url: (p.url || "").trim(),
          image_url: (p.image_url || "").trim() || null,
          caption: (p.caption || "").trim(),
          views: toInt(p.views),
          likes: toInt(p.likes),
          comments: toInt(p.comments),
          shares: null, // not used for YT
        }))
        .filter((row) => row.url.length > 0);

      if (payload.length === 0) {
        setMsg("Add at least one video URL.");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("top_posts")
        .upsert(payload, { onConflict: "platform,rank" });

      if (error) throw error;

      bump();
      setMsg("YouTube posts saved ✅");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save YouTube posts.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold">YouTube — Top Videos (2)</h3>
        <p className="text-sm text-neutral-500">
          Paste URL, upload thumbnail, and add metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {posts.map((p, i) => (
          <div key={i} className="rounded-xl border p-4">
            <div className="mb-2 text-sm font-medium">Video #{i + 1}</div>

            <label className="block text-xs font-medium text-neutral-600">
              Video URL
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="https://www.youtube.com/watch?v=…"
              value={p.url}
              onChange={(e) => update(i, { url: e.target.value })}
            />

            <div className="mt-3">
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Thumbnail (widescreen)
              </label>
              <ThumbnailPicker
                platform="youtube"
                value={p.image_url || ""}
                onChange={(publicUrl) => update(i, { image_url: publicUrl })}
              />
            </div>

            <label className="mt-3 block text-xs font-medium text-neutral-600">
              Title/Caption (optional)
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Video title"
              value={p.caption || ""}
              onChange={(e) => update(i, { caption: e.target.value })}
            />

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Views
                </label>
                <input
                  className="mt-1 w-full rounded-md border px-2 py-2 text-sm"
                  inputMode="numeric"
                  value={p.views ?? ""}
                  onChange={(e) => update(i, { views: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Likes
                </label>
                <input
                  className="mt-1 w-full rounded-md border px-2 py-2 text-sm"
                  inputMode="numeric"
                  value={p.likes ?? ""}
                  onChange={(e) => update(i, { likes: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Comments
                </label>
                <input
                  className="mt-1 w-full rounded-md border px-2 py-2 text-sm"
                  inputMode="numeric"
                  value={p.comments ?? ""}
                  onChange={(e) => update(i, { comments: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <SaveButton
          onClick={handleSave}
          saving={saving}
          label="Save Videos"
          fullWidth
        />
      </div>
      {msg && <p className="mt-2 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}
