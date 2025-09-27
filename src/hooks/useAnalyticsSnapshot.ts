import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

type Row = {
  source: string;
  metric: string;
  value: number;
  updated_at: string;
};

export function useAnalyticsSnapshot() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("analytics_public")
      .select("source,metric,value,updated_at")
      .order("updated_at", { ascending: false });

    if (error) setErr(error.message);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();

    const ch = supabase
      .channel("analytics_public_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "analytics_public" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return { rows, loading, err, reload: load };
}
