import React, { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

type Row = {
  id: string;
  platform: string;
  follower_count: number | null;
  monthly_views: number | null;
  engagement_rate: number | null;
  updated_at: string | null;
};

const StatsList: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("platform_stats")
        .select(
          "id, platform, follower_count, monthly_views, engagement_rate, updated_at"
        )
        .order("updated_at", { ascending: false })
        .limit(12);
      if (!mounted) return;
      if (!error && data) setRows(data as any);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="admin-card rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">Recent Stat Entries</h3>
      {loading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-neutral-500">No rows yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-neutral-500">
              <tr>
                <th className="px-2 py-2">Platform</th>
                <th className="px-2 py-2">Followers</th>
                <th className="px-2 py-2">Monthly Views</th>
                <th className="px-2 py-2">Engagement %</th>
                <th className="px-2 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-2 py-2">{r.platform}</td>
                  <td className="px-2 py-2">{r.follower_count ?? "—"}</td>
                  <td className="px-2 py-2">{r.monthly_views ?? "—"}</td>
                  <td className="px-2 py-2">{r.engagement_rate ?? "—"}</td>
                  <td className="px-2 py-2">
                    {r.updated_at
                      ? new Date(r.updated_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StatsList;
