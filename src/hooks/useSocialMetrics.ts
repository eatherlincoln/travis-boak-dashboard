import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Row = {
  source: string;
  metric: string;
  value: number;
  updated_at: string;
};
type Metrics = Record<string, { value: number; updated_at: string }>;

async function fetchMetrics(source: "instagram" | "youtube" | "tiktok") {
  const { data, error } = await supabase
    .from("analytics_public")
    .select("metric,value,updated_at")
    .eq("source", source);
  if (error) throw new Error(error.message);
  const out: Metrics = {};
  for (const r of data ?? [])
    out[r.metric] = { value: Number(r.value), updated_at: r.updated_at };
  return out;
}

export function useSocialMetrics(source: "instagram" | "youtube" | "tiktok") {
  const [metrics, setMetrics] = useState<Metrics>({});
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const m = await fetchMetrics(source);
      setMetrics(m);
      const latest =
        Object.values(m).sort((a, b) =>
          a.updated_at < b.updated_at ? 1 : -1
        )[0]?.updated_at || "";
      setUpdatedAt(latest);
      setLoading(false);
    } catch (e: any) {
      setErr(e.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [source]);

  // optional: realtime refresh
  useEffect(() => {
    const ch = supabase
      .channel(`ap_${source}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "analytics_public",
          filter: `source=eq.${source}`,
        },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [source]);

  return { metrics, updatedAt, loading, err, reload: load };
}
