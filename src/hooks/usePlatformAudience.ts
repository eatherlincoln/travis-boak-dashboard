// src/hooks/usePlatformAudience.ts
import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type Audience = {
  platform: "instagram" | "youtube" | "tiktok";
  gender: { men?: number; women?: number }; // e.g., { men: 88, women: 12 }
  age_bands: Array<{ range: string; percentage: number }>; // [{range:'25-34', percentage:31}, …]
  countries: Array<{ country: string; percentage: number }>; // [{country:'Australia', percentage:51}, …]
  cities: string[]; // ["Sydney","Gold Coast",…]
  updated_at?: string;
};

export function usePlatformAudience(platform: Audience["platform"]) {
  const [data, setData] = useState<Audience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);

      const { data: rows, error } = await supabase
        .from("platform_audience")
        .select("*")
        .eq("platform", platform)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (!alive) return;

      if (error) {
        setErr(error.message);
        setData(null);
        setLoading(false);
        return;
      }

      const row = rows?.[0];
      if (!row) {
        setData(null);
        setLoading(false);
        return;
      }

      // Accept age_bands or age_groups; normalize to age_bands
      const normalizedAge = row.age_bands ?? row.age_groups ?? [];

      const normalized: Audience = {
        platform,
        gender: row.gender ?? {},
        age_bands: normalizedAge,
        countries: row.countries ?? [],
        cities: row.cities ?? [],
        updated_at: row.updated_at ?? null,
      };

      setData(normalized);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [platform]);

  return { data, loading, error };
}
