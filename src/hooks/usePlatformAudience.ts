// src/hooks/usePlatformAudience.ts
import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "./useAutoRefresh";

export type Platform = "instagram" | "youtube" | "tiktok";
export type AudienceRow = {
  platform: Platform;
  gender: { men: number; women: number } | null;
  ages: { range: string; percentage: number }[] | null;
  countries: { country: string; percentage: number }[] | null;
  cities: string[] | null;
  updated_at: string | null;
};

export function usePlatformAudience(platform: Platform) {
  const { version } = useRefreshSignal();
  const [row, setRow] = useState<AudienceRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("platform_audience")
        .select("*")
        .eq("platform", platform)
        .maybeSingle();

      if (!alive) return;
      setRow(error ? null : (data as AudienceRow | null));
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [platform, version]);

  return { row, loading };
}
