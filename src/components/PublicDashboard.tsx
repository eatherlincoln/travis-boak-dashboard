import React from 'react';
import { useAnalyticsSnapshot } from '../hooks/useAnalyticsSnapshot';

export function PublicDashboard() {
  const { rows, loading, err } = useAnalyticsSnapshot();
  if (loading) return <div>Loading…</div>;
  if (err) return <div>Error: {err}</div>;

  return (
    <div>
      <h2>Social Analytics (Live)</h2>
      <ul>
        {rows.map(r => (
          <li key={`${r.source}:${r.metric}`}>
            <strong>{r.source}</strong> · {r.metric}: {r.value} <em>({new Date(r.updated_at).toLocaleString()})</em>
          </li>
        ))}
      </ul>
    </div>
  );
}