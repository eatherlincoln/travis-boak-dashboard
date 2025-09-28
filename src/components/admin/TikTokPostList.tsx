import React, { useState } from "react";
import { supabase } from "@supabaseClient";
import SaveButton from "@/components/admin/SaveButton";
import ThumbnailPicker from "@/components/admin/ThumbnailPicker";
import { useRefreshSignal } from "@/hooks";
import { Card } from "@/components/ui/card";

type PostInput = {
  url: string;
  image_url?: string; // <-- stored to DB as image_url
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

const PLATFORM = "tiktok";
const TABLE = "top_posts";

export default function TikTokPostList() {
  const [posts, setPosts] = useState<PostInput[]>(
    Array.from({ length: 4 }, () => ({
      url: "",
      image_url: "",
      likes: "",
      comments: "",
      shares: "",
    }))
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { bump } = useRefreshSignal();

  const setField = (i: number, key: keyof PostInput) => (val: string) => {
    const next = [...posts];
    (next[i] as any)[key] = val;
    setPosts(next);
  };

  const handleSave = async () => {
    setMsg(null);
    setSaving(true);
    try {
      // Build 4 ranked rows (1..4). If URL is empty, we still upsert a cleared slot.
      const payload = posts.map((p, idx) => ({
        platform: PLATFORM,
        rank: idx + 1,
        url: (p.url || "").trim() || null, // allow clearing
        image_url: (p.image_url || "").trim() || null,
        likes: toInt(p.likes),
        comments: toInt(p.comments),
        shares: toInt(p.shares),
      }));

      const { error } = await supabase
        .from(TABLE)
        .upsert(payload, { onConflict: "platform,rank" });

      if (error) throw error;

      setMsg("TikTok posts saved ✅");
      bump(); // notify frontend hooks to refetch
    } catch (e: any) {
      setMsg(e?.message || "Failed to save TikTok posts.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">TikTok — Top Posts</h2>
          <p className="text-sm text-neutral-500">
            Paste the post URL, upload a thumbnail, and add metrics. Up to 4
            posts.
          </p>
        </div>
        <SaveButton onClick={handleSave} saving={saving} label="Save Posts" />
      </div>

      {/* 2 x 2 editor grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {posts.map((p, i) => (
          <div
            key={i}
            className="rounded-lg border bg-white p-3 shadow-sm space-y-3"
          >
            <div className="text-sm font-medium">Post {i + 1}</div>

            {/* URL */}
            <label className="text-xs font-medium text-neutral-700">
              Post URL
            </label>
            <input
              type="url"
              inputMode="url"
              placeholder="https://www.tiktok.com/@user/video/…"
              value={p.url}
              onChange={(e) => setField(i, "url")(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
            />

            {/* Thumbnail URL + uploader */}
            <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="text-xs font-medium text-neutral-700">
                  Thumbnail URL (optional)
                </label>
                <input
                  type="url"
                  inputMode="url"
                  placeholder="https://…/image.jpg"
                  value={p.image_url || ""}
                  onChange={(e) => setField(i, "image_url")(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="justify-self-start sm:justify-self-end">
                <label className="block text-xs font-medium text-neutral-700">
                  Upload Thumbnail
                </label>
                <ThumbnailPicker
                  platform={PLATFORM}
                  value={p.image_url || ""}
                  onChange={(publicUrl) => setField(i, "image_url")(publicUrl)}
                  // You can pass a desired path prefix if you want:
                  // pathPrefix={`tiktok/rank-${i + 1}`}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-700">
                  Likes
                </label>
                <input
                  inputMode="numeric"
                  value={String(p.likes ?? "")}
                  onChange={(e) => setField(i, "likes")(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700">
                  Comments
                </label>
                <input
                  inputMode="numeric"
                  value={String(p.comments ?? "")}
                  onChange={(e) => setField(i, "comments")(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700">
                  Shares
                </label>
                <input
                  inputMode="numeric"
                  value={String(p.shares ?? "")}
                  onChange={(e) => setField(i, "shares")(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save CTA + message */}
      <div className="mt-4 flex justify-end">
        <SaveButton onClick={handleSave} saving={saving} label="Save Posts" />
      </div>
      {msg && <p className="mt-2 text-sm text-neutral-600">{msg}</p>}
    </Card>
  );
}
