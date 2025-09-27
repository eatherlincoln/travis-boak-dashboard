// src/components/admin/PostCardEditor.tsx
import React from "react";

export type PostCardEditorProps = {
  id?: string;
  url?: string;
  likes?: number | "";
  comments?: number | "";
  shares?: number | "";
  thumbnailUrl?: string;
  onChange: (next: Partial<PostCardEditorProps>) => void;
  onRemove?: () => void;
};

function PostCardEditor({
  id,
  url = "",
  likes = "",
  comments = "",
  shares = "",
  thumbnailUrl = "",
  onChange,
  onRemove,
}: PostCardEditorProps) {
  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Post {id ?? ""}</div>
        {onRemove && (
          <button
            type="button"
            className="text-xs rounded-md border px-2 py-1 hover:bg-neutral-50"
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>

      <label className="block text-xs text-neutral-600">Post URL</label>
      <input
        className="w-full rounded-md border px-3 py-2 text-sm"
        placeholder="https://…"
        value={url}
        onChange={(e) => onChange({ url: e.target.value })}
      />

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-neutral-600">Likes</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            inputMode="numeric"
            value={likes}
            onChange={(e) =>
              onChange({
                likes: e.target.value === "" ? "" : Number(e.target.value) || 0,
              })
            }
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-600">Comments</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            inputMode="numeric"
            value={comments}
            onChange={(e) =>
              onChange({
                comments:
                  e.target.value === "" ? "" : Number(e.target.value) || 0,
              })
            }
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-600">Shares</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            inputMode="numeric"
            value={shares}
            onChange={(e) =>
              onChange({
                shares:
                  e.target.value === "" ? "" : Number(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>

      <label className="block text-xs text-neutral-600">Thumbnail URL</label>
      <input
        className="w-full rounded-md border px-3 py-2 text-sm"
        placeholder="https://…"
        value={thumbnailUrl}
        onChange={(e) => onChange({ thumbnailUrl: e.target.value })}
      />
    </div>
  );
}

export default PostCardEditor;
