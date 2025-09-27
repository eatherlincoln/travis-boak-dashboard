import React, { useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks";

export default function InstagramPostForm() {
  const [permalink, setPermalink] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [likes, setLikes] = useState<number | "">("");
  const [comments, setComments] = useState<number | "">("");
  const [reach, setReach] = useState<number | "">("");
  const [saves, setSaves] = useState<number | "">("");
  const [timestamp, setTimestamp] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { notify } = useRefreshSignal();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    // Primary key in table is media_id. Generate one if you don’t have it.
    const media_id = crypto.randomUUID();

    const { error } = await supabase.from("instagram_posts_public").insert({
      media_id,
      permalink: permalink || null,
      media_url: mediaUrl || null,
      like_count: likes === "" ? null : Number(likes),
      comment_count: comments === "" ? null : Number(comments),
      reach: reach === "" ? null : Number(reach),
      saves: saves === "" ? null : Number(saves),
      timestamp: timestamp ? new Date(timestamp).toISOString() : null,
    });

    setSaving(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Post saved!");
    notify(); // 👈 refresh public IG list

    // Reset fields (optional)
    setPermalink("");
    setMediaUrl("");
    setLikes("");
    setComments("");
    setReach("");
    setSaves("");
    setTimestamp("");
  }

  return (
    <div className="admin-card">
      <form onSubmit={handleSave} id="ig-posts-form">
        <div>
          <label>Post URL (permalink)</label>
          <input
            type="url"
            value={permalink}
            onChange={(e) => setPermalink(e.target.value)}
            placeholder="https://www.instagram.com/p/XXXX/"
          />
        </div>

        <div>
          <label>Image URL (media_url)</label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://…/image.jpg"
          />
        </div>

        <div className="row">
          <div>
            <label>Likes</label>
            <input
              type="number"
              inputMode="numeric"
              value={likes}
              onChange={(e) =>
                setLikes(e.target.value === "" ? "" : +e.target.value)
              }
            />
          </div>
          <div>
            <label>Comments</label>
            <input
              type="number"
              inputMode="numeric"
              value={comments}
              onChange={(e) =>
                setComments(e.target.value === "" ? "" : +e.target.value)
              }
            />
          </div>
        </div>

        <div className="row">
          <div>
            <label>Reach</label>
            <input
              type="number"
              inputMode="numeric"
              value={reach}
              onChange={(e) =>
                setReach(e.target.value === "" ? "" : +e.target.value)
              }
            />
          </div>
          <div>
            <label>Saves</label>
            <input
              type="number"
              inputMode="numeric"
              value={saves}
              onChange={(e) =>
                setSaves(e.target.value === "" ? "" : +e.target.value)
              }
            />
          </div>
        </div>

        <div>
          <label>Post Timestamp</label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>

        {mediaUrl && (
          <div>
            <label>Preview</label>
            <img src={mediaUrl} alt="" className="h-28 w-auto rounded-md" />
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Post"}
          </button>
          {msg && <span className="text-xs text-neutral-600">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
