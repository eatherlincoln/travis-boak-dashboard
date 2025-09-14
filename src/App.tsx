import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { fetchTopPosts, TopPost } from './lib/queries';

type Metric = {
  id: number;
  date: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  engagement_rate: number | null;
};

export default function App() {
  const [rows, setRows] = useState<Metric[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  // KPIs
  const [totals, setTotals] = useState({
    views: 0,
    likes: 0,
    comments: 0,
    er: 0,
  });

  useEffect(() => {
    (async () => {
      // --- Metrics (last 10 days)
      const { data, error } = await supabase
        .from('metrics_daily')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      if (error) {
        setError(error.message);
        return;
      }

      if (data) {
        setRows(data as Metric[]);
        const views = data.reduce((sum, r) => sum + (r.views || 0), 0);
        const likes = data.reduce((sum, r) => sum + (r.likes || 0), 0);
        const comments = data.reduce((sum, r) => sum + (r.comments || 0), 0);
        const er =
          data.reduce((sum, r) => sum + (r.engagement_rate || 0), 0) /
          (data.length || 1);

        setTotals({ views, likes, comments, er });
      }

      // --- Top posts
      const tops = await fetchTopPosts(5);
      setTopPosts(tops);
    })();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Supabase Test</h1>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {/* KPI cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
          <b>Total Views</b>
          <div>{totals.views.toLocaleString()}</div>
        </div>
        <div style={{ flex: 1, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
          <b>Total Likes</b>
          <div>{totals.likes.toLocaleString()}</div>
        </div>
        <div style={{ flex: 1, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
          <b>Total Comments</b>
          <div>{totals.comments.toLocaleString()}</div>
        </div>
        <div style={{ flex: 1, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
          <b>Avg ER</b>
          <div>{totals.er.toFixed(3)}</div>
        </div>
      </div>

      {/* Top Posts */}
      <h2 style={{ fontSize: 18, margin: '12px 0' }}>Top posts (latest ER)</h2>
      {topPosts.length === 0 ? (
        <div>No posts yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 16 }}>
          {topPosts.map((p) => (
            <div key={p.post_id} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
              <div style={{ fontWeight: 600 }}>{(p.platform || 'post').toUpperCase()}</div>
              <div style={{ margin: '4px 0' }}>
                <a href={p.url || '#'} target="_blank" rel="noreferrer">
                  {p.url || 'No URL'}
                </a>
              </div>
              <div>
                ER: {p.engagement_rate ?? 0} • Likes: {p.likes ?? 0} • Comments: {p.comments ?? 0}
              </div>
              <div>Date: {p.date}</div>
            </div>
          ))}
        </div>
      )}

      {/* Latest Metrics */}
      <h2 style={{ fontSize: 18, margin: '12px 0' }}>Latest Metrics</h2>
      {rows.length === 0 && !error && <div>No rows yet (add sample data in Supabase).</div>}
      {rows.map((r) => (
        <div
          key={r.id}
          style={{ marginBottom: 10, padding: 10, border: '1px solid #ccc', borderRadius: 8 }}
        >
          <div>
            <b>Date:</b> {r.date}
          </div>
          <div>
            <b>Views:</b> {r.views ?? 0} | <b>Likes:</b> {r.likes ?? 0} |{' '}
            <b>Comments:</b> {r.comments ?? 0}
          </div>
          <div>
            <b>ER:</b> {r.engagement_rate ?? 0}
          </div>
        </div>
      ))}
    </div>
  );
}
