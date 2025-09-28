import React, { useRef, useState } from "react";
import { supabase } from "@supabaseClient";
import { v4 as uuidv4 } from "uuid";

interface ThumbnailPickerProps {
  platform: "instagram" | "youtube" | "tiktok";
  value: string; // current thumbnail_url
  onChange: (url: string) => void; // callback with public URL
}

export default function ThumbnailPicker({
  platform,
  value,
  onChange,
}: ThumbnailPickerProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Build a unique, tidy object key:
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const objectKey = `${platform}/${uuidv4()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(objectKey, file, {
          cacheControl: "3600",
          upsert: false, // never overwrite
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get a public URL we can save in the DB
      const { data } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(objectKey);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) {
        throw new Error("Could not resolve public URL for uploaded file.");
      }

      onChange(publicUrl);
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-32 h-20 overflow-hidden rounded-md border">
          <img
            src={value}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-32 h-20 flex items-center justify-center border rounded-md text-xs text-neutral-400">
          No thumbnail
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload Thumbnail"}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
