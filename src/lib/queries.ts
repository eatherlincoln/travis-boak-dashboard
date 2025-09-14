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
// --- Types ---
export type Metric = {
  id: number;
  date: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  engagement_rate: number | null;
};

export type KPI = {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgER: number;
};

// --- KPIs over a window (default last 10 days) ---
export async function fetchKPIs(days = 10): Promise<KPI> {
  const { data, error } = await supabase
    .from('metrics_daily')
    .select('views,likes,comments,engagement_rate,date')
    .gte('date', new Date(Date.now() - days * 864e5).toISOString().slice(0, 10));

  if (error) throw error;

  const totalViews = data.reduce((a, r) => a + (r.views ?? 0), 0);
  const totalLikes = data.reduce((a, r) => a + (r.likes ?? 0), 0);
  const totalComments = data.reduce((a, r) => a + (r.comments ?? 0), 0);
  const avgER =
    data.length > 0
      ? data.reduce((a, r) => a + (r.engagement_rate ?? 0), 0) / data.length
      : 0;

  return { totalViews, totalLikes, totalComments, avgER };
}

// --- Latest metrics rows (for the list) ---
export async function fetchLatestMetrics(limit = 10): Promise<Metric[]> {
  const { data, error } = await supabase
    .from('metrics_daily')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Metric[];
}
