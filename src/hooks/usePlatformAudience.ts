import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

type Platform = "instagram" | "youtube" | "tiktok";

type Audience = {
  platform: Platform;
  gender: { men?: number; women?: number } | null;
  age_bands: Array<{ range: string; percentage: number }> | null;
  countries: Array<{ country: string; percentage: number }> | null;
  cities: string[] | null;
  updated_at: string | null;
};

export function usePlatformAudience(platform: Platform) {
  const [data, setData] = useState<Audience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("platform_audience")
        .select("*")
        .eq("platform", platform)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!alive) return;

      if (error) {
        setError(error.message);
        setData(null);
      } else {
        setError(null);
        setData(data as any);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [platform]);

  return { data, loading, error };
}
