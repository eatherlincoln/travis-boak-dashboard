import React, { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

type Row = {
  id: string;
  platform: string;
  gender: { men: number; women: number } | null;
  updated_at: string | null;
};

const DemographicsList: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase
        .from("platform_audience")
        .select("id, platform, gender, updated_at")
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
      <h3 className="mb-3 text-sm font-semibold">Recent Audience Records</h3>
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
                <th className="px-2 py-2">% Men</th>
                <th className="px-2 py-2">% Women</th>
                <th className="px-2 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-2 py-2">{r.platform}</td>
                  <td className="px-2 py-2">{r.gender?.men ?? "—"}</td>
                  <td className="px-2 py-2">{r.gender?.women ?? "—"}</td>
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

export default DemographicsList;
