import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type AudienceRow = {
  platform: string; // "global"
  gender: { men: number | null; women: number | null } | null;
  age_groups: { range: string; percentage: number | null }[] | null;
  countries: { country: string; percentage: number | null }[] | null;
  cities: string[] | null;
  updated_at?: string | null;
};

export function useAudienceGlobal() {
  const [data, setData] = useState<AudienceRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from<AudienceRow>("platform_audience")
        .select("*")
        .eq("platform", "global")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (!alive) return;
      if (error) {
        setErr(error.message);
      } else {
        setData(data?.[0] ?? null);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { data, loading, error };
}
