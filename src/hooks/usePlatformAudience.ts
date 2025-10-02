// src/hooks/usePlatformAudience.ts
import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks";

export type AgeBand = { range: string; percentage: number };
export type Country = { country: string; percentage: number };

export type AudienceRow = {
  user_id: string | null;
  gender: { men?: number; women?: number } | null;
  age_bands: AgeBand[] | null;
  countries: Country[] | null;
  cities: string[] | null;
  updated_at: string | null;
};

export function usePlatformAudience() {
  const [row, setRow] = useState<AudienceRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { version } = useRefreshSignal();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("audience") // the VIEW created above (1 row)
        .select("*")
        .limit(1);

      if (!alive) return;
      if (error) {
        setError(error.message);
        setRow(null);
      } else {
        setError(null);
        setRow((data && data[0]) || null);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [version]);

  return { audience: row, loading, error };
}
