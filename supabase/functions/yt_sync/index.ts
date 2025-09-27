import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const YT_KEY = Deno.env.get("YOUTUBE_API_KEY")!;
const CHANNEL_ID = Deno.env.get("YT_CHANNEL_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function q(path: string) {
  return `https://www.googleapis.com/youtube/v3/${path}&key=${YT_KEY}`;
}
async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

Deno.serve(async () => {
  const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  try {
    // 1) Channel stats
    type ChannelResp = { items: Array<{ statistics?: any }> };
    const ch = await getJson<ChannelResp>(
      q(`channels?part=statistics&id=${CHANNEL_ID}`)
    );
    const s = ch.items?.[0]?.statistics ?? {};
    await sb.from("youtube_stats").upsert(
      {
        channel_id: CHANNEL_ID,
        subscriber_count: Number(s.subscriberCount ?? 0),
        view_count: Number(s.viewCount ?? 0),
        video_count: Number(s.videoCount ?? 0),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "channel_id" } // requires unique index (we added it above)
    );

    // 2) Latest videos (top 10 recent)
    type SearchResp = { items: Array<{ id?: { videoId?: string } }> };
    const search = await getJson<SearchResp>(
      q(
        `search?part=id&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=10`
      )
    );
    const ids = search.items
      .map((i) => i.id?.videoId)
      .filter((v): v is string => Boolean(v));

    if (ids.length) {
      type VideosResp = {
        items: Array<{
          id: string;
          snippet?: { title?: string; publishedAt?: string };
          statistics?: { viewCount?: string; likeCount?: string };
        }>;
      };
      const vids = await getJson<VideosResp>(
        q(`videos?part=snippet,statistics&id=${ids.join(",")}`)
      );
      const rows = vids.items.map((v) => ({
        id: v.id,
        title: v.snippet?.title ?? null,
        thumbnail_url: `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${v.id}`,
        views: Number(v.statistics?.viewCount ?? 0),
        likes: Number(v.statistics?.likeCount ?? 0),
        published_at: v.snippet?.publishedAt ?? null,
        updated_at: new Date().toISOString(),
      }));
      await sb.from("youtube_videos").upsert(rows, { onConflict: "id" });
    }

    return new Response("yt_sync ok", { status: 200 });
  } catch (err: any) {
    console.error("[yt_sync]", err?.message || err);
    return new Response(err?.message || "yt_sync failed", { status: 500 });
  }
});
