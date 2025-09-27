import React, { useState } from "react";
import { supabase } from "@supabaseClient";
import SaveButton from "@/components/admin/SaveButton";

const POSTS_TABLE = "top_posts";
const CONFLICT_KEY = "platform,url";
await supabase.from("top_posts").upsert(payload, { onConflict: CONFLICT_KEY });

type PostInput = {
  url: string;
  image_url?: string;
  thumbnail_url?: string; // UI alias still accepted
  caption?: string;
  likes?: number | string;
  comments?: number | string;
  shares?: number | string; // keep for consistency (or use "views" if you add it in DB)
};

const toInt = (v: string | number | undefined | null): number => {
  if (v === undefined || v === null || v === "") return 0;
  const n =
    typeof v === "number" ? v : parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

async function uploadThumbnail(file: File): Promise<string> {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `youtube/${Date.now()}_${safeName}`;
  const { error } = await supabase.storage
    .from("thumbnails")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("thumbnails").getPublicUrl(path);
  return data.publicUrl;
}

export default function YouTubePostList() {
  const [posts, setPosts] = useState<PostInput[]>([
    {
      url: "",
      image_url: "",
      caption: "",
      likes: "",
      comments: "",
      shares: "",
    },
    {
      url: "",
      image_url: "",
      caption: "",
      likes: "",
      comments: "",
      shares: "",
    },
    {
      url: "",
      image_url: "",
      caption: "",
      likes: "",
      comments: "",
      shares: "",
    },
    {
      url: "",
      image_url: "",
      caption: "",
      likes: "",
      comments: "",
      shares: "",
    },
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

  const onPickFile =
    (i: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setMsg("Uploading thumbnail…");
      try {
        const publicUrl = await uploadThumbnail(file);
        setPosts((prev) => {
          const copy = [...prev];
          copy[i] = { ...copy[i], image_url: publicUrl };
          return copy;
        });
        setMsg("Thumbnail uploaded ✅");
      } catch (err: any) {
        console.error(err);
        setMsg(err?.message || "Thumbnail upload failed.");
      } finally {
        e.currentTarget.value = "";
      }
    };

  const handleSave = async () => {
    setMsg(null);
    setSaving(true);
    try {
      const payload = posts
        .filter((p) => (p.url || "").trim().length > 0)
        .map((p, idx) => {
          const imageUrl = (
            (p as any).image_url ||
            (p as any).thumbnail_url ||
            ""
          ).trim();
          return {
            platform: "youtube" as const,
            rank: idx + 1,
            url: (p.url || "").trim(),
            image_url: imageUrl || "",
            caption: (p.caption ?? "").trim(),
            likes: toInt(p.likes),
            comments: toInt(p.comments),
            shares: toInt(p.shares),
            meta: {}, // safe default
          };
        });

      if (payload.length === 0) {
        setMsg("Nothing to save — add at least one video URL.");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from(POSTS_TABLE)
        .upsert(payload, { onConflict: CONFLICT_KEY });

      if (error) throw error;

      setMsg("YouTube posts saved ✅");
    } catch (e: any) {
      console.error(e);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((p, i) => (
          <div key={i} className="rounded-xl border p-4">
            <label className="block text-xs font-medium text-neutral-600">
              Video URL
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="https://www.youtube.com/watch?v=…"
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
                  value={p.image_url || p.thumbnail_url || ""}
                  onChange={(e) =>
                    setPosts((prev) => {
                      const copy = [...prev];
                      copy[i] = { ...copy[i], image_url: e.target.value };
                      return copy;
                    })
                  }
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
                  onChange={onPickFile(i)}
                />
              </div>
            </div>

            <label className="block mt-3">
              <span className="text-[11px] text-neutral-500">
                Caption (optional)
              </span>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Short caption or title"
                value={p.caption ?? ""}
                onChange={setField(i, "caption")}
              />
            </label>

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

            {(p.image_url || p.thumbnail_url) && (
              <div className="mt-3 overflow-hidden rounded-lg border">
                <img
                  src={(p.image_url || p.thumbnail_url) as string}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {msg && <p className="mt-3 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}
