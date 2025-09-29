import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "./useAutoRefresh";

type Gender = { men: number; women: number };
type AgeBand = { range: string; percentage: number };
type Country = { country: string; percentage: number };

export type Audience = {
  gender: Gender;
  age_bands: AgeBand[];
  countries: Country[];
  cities: string[];
  updated_at: string | null;
};

export function useAudience() {
  const { version } = useRefreshSignal();
  const [data, setData] = useState<Audience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("audience")
        .select("gender,age_bands,countries,cities,updated_at")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (!alive) return;

      if (!error && data && data.length > 0) {
        const a = data[0] as any;
        setData({
          gender: a.gender ?? { men: 0, women: 0 },
          age_bands: a.age_bands ?? [
            { range: "13-17", percentage: 0 },
            { range: "18-24", percentage: 0 },
            { range: "25-34", percentage: 0 },
            { range: "35-44", percentage: 0 },
            { range: "45-54", percentage: 0 },
            { range: "55-64", percentage: 0 },
            { range: "65+", percentage: 0 },
          ],
          countries: a.countries ?? [],
          cities: a.cities ?? [],
          updated_at: a.updated_at ?? null,
        });
      } else {
        setData(null);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [version]);

  return { audience: data, loading };
}
