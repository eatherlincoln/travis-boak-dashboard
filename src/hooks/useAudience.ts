import { useEffect, useMemo, useState } from "react";
import { supabase } from "@supabaseClient";

export type AudienceRow = {
  id: string;
  platform: string; // "instagram" | "youtube" | "tiktok"
  gender: Record<string, number> | null; // { men: 88, women: 12 }
  age_groups: Array<{ range: string; percentage: number }> | null; // [{ range: "25-34", percentage: 31 }, ...]
  countries: Array<{ country: string; percentage: number }> | null; // [{ country: "Australia", percentage: 51 }, ...]
  cities: Array<{ city: string; percentage: number }> | null; // [{ city: "Sydney", percentage: 10 }, ...]
  updated_at: string | null;
};

/**
 * Fetch audience demographics from `platform_audience`
 * Returns:
 *  - audience: full array
 *  - byPlatform: quick lookup (instagram/youtube/tiktok)
 */
export function useAudience() {
  const [audience, setAudience] = useState<AudienceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("platform_audience")
        .select("id,platform,gender,age_groups,countries,cities,updated_at")
        .order("updated_at", { ascending: false });

      if (!mounted) return;
      if (error) {
        setError(error.message);
        setAudience([]);
      } else {
        // keep only the latest row per platform
        const latest = new Map<string, AudienceRow>();
        for (const r of (data || []) as AudienceRow[]) {
          const key = (r.platform || "").toLowerCase();
          if (!latest.has(key)) latest.set(key, r);
        }
        setAudience(Array.from(latest.values()));
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const byPlatform = useMemo(() => {
    const m: Record<string, AudienceRow> = {};
    for (const r of audience) m[(r.platform || "").toLowerCase()] = r;
    return m;
  }, [audience]);

  return { audience, byPlatform, loading, error };
}
