import React, { useState } from "react";
import { supabase } from "@supabaseClient";
import SaveButton from "@/components/admin/SaveButton";

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

async function uploadThumbnail(file: File): Promise<string> {
  const filePath = `${Date.now()}_${file.name}`.replace(/\s+/g, "_");
  const { error } =
    (await supabase
      .from("thumbnails")
      // @ts-expect-error — supabase-js v2 storage uses supabase.storage
      .upload?.call?.(supabase.storage.from("thumbnails"), filePath, file, {
        upsert: true,
      })) ??
    supabase.storage
      .from("thumbnails")
      .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("thumbnails").getPublicUrl(filePath);
  return data.publicUrl;
}

export default function InstagramPostList() {
  const [posts, setPosts] = useState<PostInput[]>([
    { url: "", thumbnail_url: "", likes: "", comments: "", shares: "" },
    { url: "", thumbnail_url: "", likes: "", comments: "", shares: "" },
    { url: "", thumbnail_url: "", likes: "", comments: "", shares: "" },
    { url: "", thumbnail_url: "", likes: "", comments: "", shares: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const setField =
    (i: number, key: keyof PostInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setPosts((prev) => {
        const copy = [...prev];
        copy[i] = { ...copy[i], [key]: val };
        return copy;
      });
    };

  const onPickFile = async (
    i: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg("Uploading thumbnail…");
    try {
      const publicUrl = await uploadThumbnail(file);
      setPosts((prev) => {
        const copy = [...prev];
        copy[i] = { ...copy[i], thumbnail_url: publicUrl };
        return copy;
      });
      setMsg("Thumbnail uploaded ✅");
    } catch (err: any) {
      setMsg(err?.message || "Thumbnail upload failed.");
    }
  };

  const handleSave = async () => {
    setMsg(null);
    setSaving(true);
    try {
      const payload = posts
        .filter((p) => (p.url || "").trim())
        .map((p) => ({
          platform: "instagram" as const,
          url: (p.url || "").trim(),
          thumbnail_url: (p.thumbnail_url || "").trim() || null,
          likes: toInt(p.likes),
          comments: toInt(p.comments),
          shares: toInt(p.shares),
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
    <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Instagram — Top Posts</h3>
        <SaveButton onClick={handleSave} saving={saving} label="Save Posts" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((p, i) => (
          <div key={i} className="rounded-xl border p-4">
            <label className="block text-xs font-medium text-neutral-600">
              Post URL
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="https://www.instagram.com/p/…"
              value={p.url}
              onChange={setField(i, "url")}
            />

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Thumbnail URL (optional)
                </label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="https://…/image.jpg"
                  value={p.thumbnail_url || ""}
                  onChange={setField(i, "thumbnail_url")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Upload Thumbnail
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full text-sm"
                  onChange={(e) => onPickFile(i, e)}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              {(["likes", "comments", "shares"] as const).map((k) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-neutral-600 capitalize">
                    {k}
                  </label>
                  <input
                    inputMode="numeric"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    value={(p[k] as any) ?? ""}
                    onChange={setField(i, k)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {msg && <p className="mt-3 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}
