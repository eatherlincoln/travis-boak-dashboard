import React, { useRef, useState } from "react";
import { uploadThumbnail } from "@/integrations/supabase/upload";

type Props = {
  value?: string;
  onChange: (url: string) => void;
  platform: "instagram" | "youtube" | "tiktok";
  label?: string;
};

export default function ThumbnailPicker({
  value = "",
  onChange,
  platform,
  label = "Thumbnail",
}: Props) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (f: File) => {
    setBusy(true);
    try {
      const { publicUrl } = await uploadThumbnail(f, platform);
      onChange(publicUrl);
    } catch (e: any) {
      alert(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="block">
        <span className="text-[11px] text-neutral-500">
          {label} (URL or upload)
        </span>
        <div className="mt-1 flex items-center gap-2">
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="https://…/image.jpg"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-full bg-black px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Uploading…" : "Upload"}
          </button>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.currentTarget.value = "";
          }}
        />
      </label>

      {value ? (
        <div className="mt-3 overflow-hidden rounded-lg border">
          <img
            src={value}
            alt=""
            className="aspect-video w-full object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}
