import { useEffect, useState } from 'react';
import {
  fetchKPIs,
  fetchLatestMetrics,
  fetchTopPosts,
  type KPI,
  type Metric,
  type TopPost,
} from './lib/queries';

export default function App() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [rows, setRows] = useState<Metric[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [k, latest, tops] = await Promise.all([
          fetchKPIs(10),         // last 10 days
          fetchLatestMetrics(10),
          fetchTopPosts(5),
        ]);
        setKpi(k);
        setRows(latest);
        setTopPosts(tops);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unknown error');
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Supabase Test</h1>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>Error: {error}</div>}

      {/* KPI cards */}
      {kpi && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <Kpi label="Total Views" value={kpi.totalViews} />
          <Kpi label="Total Likes" value={kpi.totalLikes} />
          <Kpi label="Total Comments" value={kpi.totalComments} />
          <Kpi label="Avg ER" value={Number(kpi.avgER.toFixed(3))} />
        </div>
      )}

      {/* Top Posts */}
      <h2 style={{ fontSize: 18, margin: '12px 0' }}>Top posts (latest ER)</h2>
      {topPosts.length === 0 ? (
        <div>No posts yet.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 12,
            marginBottom: 16,
          }}
        >
          {topPosts.map((p) => (
            <div
              key={p.post_id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 12,
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  overflow: 'hidden',
                  borderRadius: 8,
                  background: '#f3f3f3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {p.thumbnail_url ? (
                  <img
                    src={p.thumbnail_url}
                    alt={p.platform ?? 'post'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 12, color: '#777' }}>No image</span>
                )}
              </div>

              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {(p.platform || 'post').toUpperCase()}
                </div>
                <div style={{ margin: '4px 0' }}>
                  <a href={p.url || '#'} target="_blank" rel="noreferrer">
                    {p.url || 'No URL'}
                  </a>
                </div>
                <div style={{ marginTop: 4 }}>
                  ER: {Number((p.engagement_rate ?? 0).toFixed(3))} • Likes: {p.likes ?? 0} •
                  Comments: {p.comments ?? 0}
                </div>
                <div style={{ color: '#666' }}>Date: {p.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Latest Metrics */}
      <h2 style={{ fontSize: 18, margin: '12px 0' }}>Latest Metrics</h2>
      {rows.length === 0 && !error && <div>No rows yet.</div>}
      {rows.map((r) => (
        <div
          key={r.id}
          style={{
            marginBottom: 10,
            padding: 10,
            border: '1px solid #ccc',
            borderRadius: 8,
          }}
        >
          <div>
            <b>Date:</b> {r.date}
          </div>
          <div>
            <b>Views:</b> {r.views ?? 0} | <b>Likes:</b> {r.likes ?? 0} | <b>Comments:</b>{' '}
            {r.comments ?? 0}
          </div>
          <div>
            <b>ER:</b> {r.engagement_rate ?? 0}
          </div>
        </div>
      ))}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
      <div style={{ fontSize: 12, color: '#555' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value.toLocaleString()}</div>
    </div>
  );
}
