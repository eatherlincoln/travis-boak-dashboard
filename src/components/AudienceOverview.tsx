import React from "react";
import { usePlatformAudience } from "../hooks";

export default function AudienceOverview() {
  const { data, loading } = usePlatformAudience();

  if (loading) {
    return (
      <div className="admin-card rounded-2xl border bg-white p-6 text-center shadow-sm">
        Loading audience data…
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="admin-card rounded-2xl border bg-white p-6 text-center shadow-sm">
        No audience data available.
      </div>
    );
  }

  return (
    <section className="admin-card rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Audience Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((row) => (
          <div
            key={row.platform}
            className="rounded-xl border p-4 text-center bg-neutral-50"
          >
            <div className="text-sm font-medium capitalize">{row.platform}</div>
            <div className="mt-1 text-2xl font-bold">
              {row.follower_count.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Monthly Views: {row.monthly_views.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Engagement: {row.engagement_rate}%
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
