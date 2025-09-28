import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type AudienceRow = {
  platform: "instagram" | "youtube" | "tiktok";
  gender: { men?: number; women?: number } | null;
  age_groups: { range: string; percentage: number }[] | null;
  countries: { country: string; percentage: number }[] | null;
  cities: string[] | null;
  updated_at: string | null;
};

export function usePlatformAudience(
  platform: "instagram" | "youtube" | "tiktok"
) {
  const [row, setRow] = useState<AudienceRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);

      // Read from the real table that exists:
      const { data, error } = await supabase
        .from("platform_audience")
        .select("*")
        .eq("platform", platform)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (!alive) return;

      if (error) {
        setError(error.message);
        setRow(null);
      } else {
        const r = data?.[0] ?? null;
        setRow(
          r
            ? {
                platform: r.platform,
                gender: r.gender ?? null,
                age_groups: r.age_groups ?? null,
                countries: r.countries ?? null,
                cities: r.cities ?? null,
                updated_at: r.updated_at ?? null,
              }
            : null
        );
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [platform]);

  return { row, loading, error };
}
