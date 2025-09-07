type Row = { source: string; metric: string; value: number; recorded_period_start?: string; updated_at?: string };

export function monthlyLikes(rows: Row[]) {
  const out: Record<string, number> = {};
  for (const r of rows) {
    if (r.source !== 'instagram' || r.metric !== 'likes') continue;
    const d = r.recorded_period_start ? new Date(r.recorded_period_start) : new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const key = `${y}-${m}`;
    out[key] = (out[key] ?? 0) + Number(r.value || 0);
  }
  return out; // { "2025-09": 12345, ... }
}