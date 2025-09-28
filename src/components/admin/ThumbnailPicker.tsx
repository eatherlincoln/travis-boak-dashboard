import React, { useRef, useState } from "react";
import { supabase } from "@supabaseClient";
import { v4 as uuidv4 } from "uuid";

interface ThumbnailPickerProps {
  platform: string;
  value: string;
  onChange: (url: string) => void;
}

export default function ThumbnailPicker({
  platform,
  value,
  onChange,
}: ThumbnailPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const ext = file.name.split(".").pop();
      const filePath = `${platform}/${uuidv4()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(filePath);
      if (data?.publicUrl) onChange(data.publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {value && (
        <img
          src={value}
          alt="thumb"
          className="h-12 w-12 rounded object-cover border"
        />
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="px-3 py-1 text-sm rounded border bg-gray-50 hover:bg-gray-100"
        disabled={uploading}
      >
        {uploading ? "Uploading…" : "Upload Thumbnail"}
      </button>
    </div>
  );
}
