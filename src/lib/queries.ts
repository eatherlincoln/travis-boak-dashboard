// src/lib/queries.ts
import { supabase } from './supabaseClient';

export type TopPost = {
  post_id: string;
  date: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  engagement_rate: number | null;
  platform: string | null;
  url: string | null;
  thumbnail_url: string | null;
};

export async function fetchTopPosts(limit = 5): Promise<TopPost[]> {
  const { data, error } = await supabase
    .from('v_post_latest')
    .select('*')
    .order('engagement_rate', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as TopPost[];
}
