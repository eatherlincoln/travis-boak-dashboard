import React, { useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks/useAutoRefresh";
import { recalcEngagement } from "@/lib/engagement";
import ThumbnailPicker from "@/components/admin/ThumbnailPicker";
import {
  Instagram,
  Image as ImageIcon,
  Link2,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";

type PostRow = {
  url: string;
  caption?: string;
  image_url?: string;
  likes?: number | string | null;
  comments?: number | string | null;
  shares?: number | string | null;
};

const RANKS = [1, 2, 3, 4];

const toInt = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : null;
};

export default function InstagramPostList() {
  const { tick } = useRefreshSignal();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [rows, setRows] = useState<Record<number, PostRow>>({
    1: { url: "", caption: "", image_url: "" },
    2: { url: "", caption: "", image_url: "" },
    3: { url: "", caption: "", image_url: "" },
    4: { url: "", caption: "", image_url: "" },
  });

  const setField = (rank: number, key: keyof PostRow, val: string) =>
    setRows((prev) => ({ ...prev, [rank]: { ...prev[rank], [key]: val } }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const payload = RANKS.map((rank) => rows[rank])
        .filter((r) => r.url?.trim())
        .map((r, idx) => ({
          platform: "instagram" as const,
          rank: RANKS[idx],
          url: r.url.trim(),
          caption: r.caption?.trim() || null,
          image_url: r.image_url?.trim() || null,
          likes: toInt(r.likes),
          comments: toInt(r.comments),
          shares: toInt(r.shares),
        }));

      if (payload.length === 0) {
        setMsg("Add at least one post URL.");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("top_posts")
        .upsert(payload, { onConflict: "platform,rank" });

      if (error) throw error;

      // 👉 keep stats in sync
      await recalcEngagement(supabase, "instagram");

      setMsg("Instagram posts saved ✅");
      tick(); // refresh public grid
    } catch (e: any) {
      setMsg(e?.message || "Failed to save Instagram posts.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50">
            <Instagram size={16} className="text-pink-600" />
          </span>
          <h2 className="text-sm font-semibold text-neutral-900">
            Instagram — Top Posts
          </h2>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? "Saving…" : "Save Posts"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {RANKS.map((rank) => {
          const r = rows[rank];
          return (
            <section
              key={rank}
              className="rounded-xl border border-neutral-200 p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-neutral-50 text-xs text-neutral-700">
                  #{rank}
                </span>
                <h3 className="text-sm font-semibold text-neutral-800">
                  Post {rank}
                </h3>
              </div>

              <div className="space-y-3">
                <Field
                  icon={<Link2 size={14} className="text-neutral-500" />}
                  label="Post URL"
                  placeholder="https://www.instagram.com/p/…"
                  value={r.url}
                  onChange={(v) => setField(rank, "url", v)}
                />

                <Field
                  icon={<ImageIcon size={14} className="text-neutral-500" />}
                  label="Caption (optional)"
                  placeholder="Optional caption"
                  value={r.caption || ""}
                  onChange={(v) => setField(rank, "caption", v)}
                />

                <div className="grid grid-cols-3 gap-3">
                  <Metric
                    icon={<Heart size={14} className="text-pink-600" />}
                    label="Likes"
                    value={r.likes ?? ""}
                    onChange={(v) => setField(rank, "likes", v)}
                  />
                  <Metric
                    icon={<MessageCircle size={14} className="text-sky-600" />}
                    label="Comments"
                    value={r.comments ?? ""}
                    onChange={(v) => setField(rank, "comments", v)}
                  />
                  <Metric
                    icon={<Share2 size={14} className="text-emerald-600" />}
                    label="Shares"
                    value={r.shares ?? ""}
                    onChange={(v) => setField(rank, "shares", v)}
                  />
                </div>

                <div>
                  <span className="mb-1 block text-xs font-medium text-neutral-600">
                    Thumbnail
                  </span>
                  <ThumbnailPicker
                    platform="instagram"
                    value={r.image_url || ""}
                    onChange={(publicUrl) =>
                      setField(rank, "image_url", publicUrl)
                    }
                  />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {msg && <p className="mt-4 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
            {icon}
          </span>
        )}
        <input
          className={[
            "h-9 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500",
            icon ? "pl-8" : "",
          ].join(" ")}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}

function Metric({
  icon,
  label,
  value,
  onChange,
}: {
  icon?: React.ReactNode;
  label: string;
  value: any;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
            {icon}
          </span>
        )}
        <input
          inputMode="numeric"
          className={[
            "h-9 w-full rounded-md border border-neutral-300 px-3 text-right text-sm outline-none focus:border-neutral-500",
            icon ? "pl-8" : "",
          ].join(" ")}
          value={value as any}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
        />
      </div>
    </label>
  );
}
