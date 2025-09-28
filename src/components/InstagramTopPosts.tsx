import React from "react";
import useInstagramTopPosts from "@/hooks/useInstagramTopPosts";

const Fallback = "/placeholder.png"; // keep or swap to your asset

export default function InstagramTopPosts() {
  const { posts, loading, error, refresh } = useInstagramTopPosts();

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-lg bg-neutral-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Failed to load Instagram posts — {error}{" "}
        <button onClick={refresh} className="ml-2 underline">
          Retry
        </button>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="text-sm text-neutral-500">
        No Instagram posts saved yet.
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-base font-semibold text-neutral-900 mb-3">
        Top Instagram Posts
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.slice(0, 3).map((p) => {
          const img = p.thumbnail_url || Fallback;
          return (
            <a
              key={`${p.platform}-${p.rank}-${p.url ?? "no-url"}`}
              href={p.url ?? undefined}
              target={p.url ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group block"
            >
              <img
                src={img}
                alt="Instagram post thumbnail"
                className="w-full h-40 object-cover rounded-lg ring-1 ring-neutral-200/70 group-hover:ring-neutral-300 transition"
              />
              <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
                {p.likes != null && <span>❤️ {p.likes}</span>}
                {p.comments != null && <span>💬 {p.comments}</span>}
                {p.shares != null && <span>🔁 {p.shares}</span>}
              </div>
            </a>
          );
        })}
      </div>

      {/* updated stamp if available */}
      {posts[0]?.updated_at && (
        <p className="mt-3 text-xs text-neutral-500">
          Last updated {new Date(posts[0].updated_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
