export function erByReach({ likes = 0, comments = 0, saves = 0, reach = 0 }: { likes?: number; comments?: number; saves?: number; reach?: number }) {
  if (!reach || reach <= 0) return null;
  return (likes + comments + saves) / reach;
}

export function formatPct(x: number | null, decimals = 2) {
  if (x === null) return '—';
  return `${(x * 100).toFixed(decimals)}%`;
}