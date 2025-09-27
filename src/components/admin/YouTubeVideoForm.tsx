import React, { useState } from "react";

type NumOrEmpty = number | "";

export default function YouTubeVideoForm() {
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [views, setViews] = useState<NumOrEmpty>("");
  const [likes, setLikes] = useState<NumOrEmpty>("");
  const [comments, setComments] = useState<NumOrEmpty>("");
  const [shares, setShares] = useState<NumOrEmpty>("");

  // utility to coerce text input into number-or-empty
  const toNumOrEmpty = (v: string): NumOrEmpty => (v === "" ? "" : Number(v));

  const handleSave = async () => {
    // TODO: wire to Supabase upsert here if desired.
    // For now, just log so you can see the shape.
    const payload = {
      url,
      thumbnail_url: thumbnailUrl,
      views: views === "" ? null : views,
      likes: likes === "" ? null : likes,
      comments: comments === "" ? null : comments,
      shares: shares === "" ? null : shares,
    };
    console.log("YouTube save:", payload);
    // Example Supabase shape:
    // const { error } = await supabase.from("youtube_videos").upsert(payload);
    // if (error) return toast.error(error.message);
    // toast.success("Saved");
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-3 font-medium">YouTube Video</div>

      {/* URL */}
      <label className="block text-sm text-neutral-600 mb-1">Video URL</label>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
        className="mb-4 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
      />

      {/* Thumbnail */}
      <label className="block text-sm text-neutral-600 mb-1">
        Thumbnail URL
      </label>
      <input
        type="url"
        value={thumbnailUrl}
        onChange={(e) => setThumbnailUrl(e.target.value)}
        placeholder="https://i.ytimg.com/vi/.../hqdefault.jpg"
        className="mb-4 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
      />

      {/* Numbers row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm text-neutral-600 mb-1">Views</label>
          <input
            inputMode="numeric"
            value={views}
            onChange={(e) => setViews(toNumOrEmpty(e.target.value))}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
            placeholder="e.g. 12345"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-600 mb-1">Likes</label>
          <input
            inputMode="numeric"
            value={likes}
            onChange={(e) => setLikes(toNumOrEmpty(e.target.value))}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
            placeholder="e.g. 420"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-600 mb-1">
            Comments
          </label>
          <input
            inputMode="numeric"
            value={comments}
            onChange={(e) => setComments(toNumOrEmpty(e.target.value))}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
            placeholder="e.g. 69"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-600 mb-1">Shares</label>
          <input
            inputMode="numeric"
            value={shares}
            onChange={(e) => setShares(toNumOrEmpty(e.target.value))}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
            placeholder="e.g. 10"
          />
        </div>
      </div>

      {/* Thumbnail preview */}
      {thumbnailUrl ? (
        <div className="mt-4">
          <div className="text-xs text-neutral-500 mb-1">Preview</div>
          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt="YouTube Thumbnail"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Save
        </button>
      </div>
    </div>
  );
}
