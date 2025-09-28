import React, { useRef, useState } from "react";
import { supabase } from "@supabaseClient";

interface ThumbnailPickerProps {
  platform: "instagram" | "youtube" | "tiktok";
  value: string;
  onChange: (url: string) => void;
}

export default function ThumbnailPicker({
  platform,
  value,
  onChange,
}: ThumbnailPickerProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      setUploading(true);

      const file = e.target.files?.[0];
      if (!file) return;

      const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
      const stamp = Date.now().toString(36);
      const rand = Math.random().toString(36).slice(2, 8);

      const objectKey = `${platform}/${stamp}-${rand}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(objectKey, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(objectKey);

      if (pub?.publicUrl) {
        onChange(pub.publicUrl);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        readOnly
        placeholder="https://…/thumbnail.jpg"
        className="flex-1 rounded border px-2 py-1 text-sm"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="px-3 py-1 text-sm rounded bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Choose file"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
