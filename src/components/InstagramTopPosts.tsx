import React from "react";
import { useInstagramPosts } from "../hooks";

export default function InstagramTopPosts() {
  const { posts } = useInstagramPosts();

  return (
    <div className="admin-card rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Top Instagram Posts</h2>
      {posts?.length ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {posts.map((post) => (
              <a
                key={post.media_id}
                href={post.permalink}
                target="_blank"
                rel="noreferrer"
                className="block rounded overflow-hidden border"
              >
                <img
                  src={post.media_url}
                  alt={post.caption ?? ""}
                  className="w-full h-40 object-cover"
                />
              </a>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Last updated {new Date(posts[0].updated_at).toLocaleDateString()}
          </p>
        </>
      ) : (
        <p className="text-sm text-neutral-500">No posts found.</p>
      )}
    </div>
  );
}
