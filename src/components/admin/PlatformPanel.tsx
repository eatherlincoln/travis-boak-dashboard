import React, { useState, useMemo } from "react";
import PostCardEditor from "@/components/admin/PostCardEditor";
import NumberField from "./NumberField";
import { averageEngagement } from "@/lib/engagement";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks";

type Props = {
  platform: "instagram" | "youtube" | "tiktok";
  initialPosts?: PostModel[];
  initialFollowers?: number | null;
  initialMonthlyViews?: number | null;
  initialPostsCount?: number | null;
  initialAudience?: {
    gender?: { men?: number; women?: number };
    age_buckets?: Record<string, number>;
    countries?: { name: string; pct: number }[];
    cities?: { name: string; pct: number }[];
  };
};

export default function PlatformPanel({
  platform,
  initialPosts = [],
  initialFollowers = null,
  initialMonthlyViews = null,
  initialPostsCount = null,
  initialAudience,
}: Props) {
  const [posts, setPosts] = useState<PostModel[]>(initialPosts);
  const [followers, setFollowers] = useState<number | "">(
    initialFollowers ?? ""
  );
  const [monthlyViews, setMonthlyViews] = useState<number | "">(
    initialMonthlyViews ?? ""
  );
  const [postsCount, setPostsCount] = useState<number | "">(
    initialPostsCount ?? ""
  );
  const [audGenderMen, setAudGenderMen] = useState<number | "">(
    initialAudience?.gender?.men ?? ""
  );
  const [audGenderWomen, setAudGenderWomen] = useState<number | "">(
    initialAudience?.gender?.women ?? ""
  );

  const { bump } = useRefreshSignal(); // tell public side to refetch after saves

  const addPost = () => setPosts((arr) => [...arr, {}]);
  const removePost = (idx: number) =>
    setPosts((arr) => arr.filter((_, i) => i !== idx));
  const updatePost = (idx: number, next: PostModel) =>
    setPosts((arr) => arr.map((p, i) => (i === idx ? next : p)));

  const avgEngagement = useMemo(() => {
    const clean = posts.map((p) => ({
      likes: num(p.likes),
      comments: num(p.comments),
      shares: num(p.shares),
      views: num(p.views),
    }));
    return averageEngagement(clean, { followers: num(followers) });
  }, [posts, followers]);

  const saveMetrics = async () => {
    await supabase
      .from("platform_stats")
      .upsert({
        platform,
        follower_count: num(followers),
        monthly_views: num(monthlyViews),
        posts_count: num(postsCount),
        engagement_rate: avgEngagement,
        updated_at: new Date().toISOString(),
      })
      .select();
    bump();
  };

  const savePosts = async () => {
    await supabase.from("platform_posts").delete().eq("platform", platform);
    const rows = posts.map((p) => ({
      platform,
      url: p.url ?? null,
      thumbnail_url: p.thumbnail_url ?? null,
      views: num(p.views),
      likes: num(p.likes),
      comments: num(p.comments),
      shares: num(p.shares),
      posted_at: p.posted_at ?? null,
      updated_at: new Date().toISOString(),
    }));
    if (rows.length) await supabase.from("platform_posts").insert(rows);
    bump();
  };

  const saveAudience = async () => {
    await supabase
      .from("platform_audience")
      .upsert({
        platform,
        gender: { men: num(audGenderMen), women: num(audGenderWomen) },
        updated_at: new Date().toISOString(),
      })
      .select();
    bump();
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold capitalize">{platform} Admin</h2>
        <div className="text-xs text-neutral-500">
          Avg post engagement:{" "}
          <span className="font-semibold">{avgEngagement.toFixed(2)}%</span>
        </div>
      </div>

      {/* Popular posts */}
      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-medium">Popular Posts</div>
          <button
            onClick={addPost}
            className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Add Post
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((p, i) => (
            <PostCardEditor
              key={i}
              post={p}
              onChange={(next) => updatePost(i, next)}
              onRemove={() => removePost(i)}
              followers={num(followers)}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={savePosts}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Save Posts
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-5">
        <div className="mb-3 font-medium">Metrics</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <NumberField
            label="Followers / Subscribers"
            value={followers}
            onChange={setFollowers}
          />
          <NumberField
            label="Monthly Views"
            value={monthlyViews}
            onChange={setMonthlyViews}
          />
          <NumberField
            label="Posts (optional)"
            value={postsCount}
            onChange={setPostsCount}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={saveMetrics}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Save Metrics
          </button>
        </div>
      </div>

      {/* Audience */}
      <div>
        <div className="mb-3 font-medium">Audience Demographics</div>
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="Men (%)"
            value={audGenderMen}
            onChange={setAudGenderMen}
          />
          <NumberField
            label="Women (%)"
            value={audGenderWomen}
            onChange={setAudGenderWomen}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={saveAudience}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Save Demographics
          </button>
        </div>
      </div>
    </section>
  );
}

function num(v: number | "" | null | undefined) {
  return v === "" || v == null ? null : Number(v);
}
