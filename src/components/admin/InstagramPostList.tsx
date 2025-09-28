import React, { useState } from "react";
import { supabase } from "@supabaseClient";
import SaveButton from "@/components/admin/SaveButton";
import ThumbnailPicker from "@/components/admin/ThumbnailPicker";
import { notifyDataUpdated } from "@/hooks/useAutoRefresh";

type PostInput = {
  url: string;
  caption?: string;
  image_url?: string;
  likes?: string | number;
  comments?: string | number;
  shares?: string | number;
};

const toInt = (v: string | number | undefined | null): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n =
    typeof v === "number" ? v : parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

export default function InstagramPostList() {
  const [posts, setPosts] = useState<PostInput[]>(
    Array.from({ length: 4 }, () => ({ url: "" }))
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setMsg(null);
    setSaving(true);
    try {
      const payload = posts.map((p, idx) => ({
        platform: "instagram" as const,
        rank: idx + 1,
        url: (p.url || "").trim() || null,
        caption: (p.caption || "").trim() || null,
        image_url: (p.image_url || "").trim() || null,
        likes: toInt(p.likes),
        comments: toInt(p.comments),
        shares: toInt(p.shares),
      }));

      const { error } = await supabase
        .from("top_posts")
        .upsert(payload, { onConflict: "platform,rank" });

      if (error) throw error;
      setMsg("Instagram posts saved ✅");
      notifyDataUpdated();
    } catch (e: any) {
      setMsg(e?.message || "Failed to save Instagram posts.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">Instagram — Top Posts</h3>

      <div className="space-y-4">
        {posts.map((p, i) => (
          <div key={i} className="rounded-lg border p-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs text-neutral-600">Post URL</label>
                <input
                  value={p.url}
                  onChange={(e) => {
                    const next = [...posts];
                    next[i] = { ...p, url: e.target.value };
                    setPosts(next);
                  }}
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                  placeholder="https://www.instagram.com/p/…"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs text-neutral-600">Caption</label>
                <input
                  value={p.caption || ""}
                  onChange={(e) => {
                    const next = [...posts];
                    next[i] = { ...p, caption: e.target.value };
                    setPosts(next);
                  }}
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                  placeholder="Optional caption"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-neutral-600">Thumbnail</label>
                <div className="mt-1">
                  <ThumbnailPicker
                    platform="instagram"
                    value={p.image_url}
                    onChange={(url) => {
                      const next = [...posts];
                      next[i] = { ...p, image_url: url };
                      setPosts(next);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:col-span-3">
                <div>
                  <label className="text-xs text-neutral-600">Likes</label>
                  <input
                    value={p.likes ?? ""}
                    onChange={(e) => {
                      const next = [...posts];
                      next[i] = { ...p, likes: e.target.value };
                      setPosts(next);
                    }}
                    className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-600">Comments</label>
                  <input
                    value={p.comments ?? ""}
                    onChange={(e) => {
                      const next = [...posts];
                      next[i] = { ...p, comments: e.target.value };
                      setPosts(next);
                    }}
                    className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-600">Shares</label>
                  <input
                    value={p.shares ?? ""}
                    onChange={(e) => {
                      const next = [...posts];
                      next[i] = { ...p, shares: e.target.value };
                      setPosts(next);
                    }}
                    className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                    placeholder="0"
                  />
                </div>
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
