import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

type AudienceRow = {
  platform: "instagram" | "youtube" | "tiktok";
  gender: { men?: number; women?: number } | null;
  age_groups: Array<{ range: string; percentage: number }> | null;
  countries: Array<{ country: string; percentage: number }> | null;
  cities: string[] | null;
  updated_at: string | null;
};

type AudienceState = {
  data: AudienceRow | null;
  loading: boolean;
  error: string | null;
};

const AUDIENCE_TABLE = "platform_audience";

export function usePlatformAudience(
  platform: AudienceRow["platform"]
): AudienceState {
  const [state, setState] = useState<AudienceState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setState((s) => ({ ...s, loading: true, error: null }));

      const { data, error } = await supabase
        .from<AudienceRow>(AUDIENCE_TABLE)
        .select("platform, gender, age_groups, countries, cities, updated_at")
        .eq("platform", platform)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(); // returns null if no row, doesn't throw

      if (cancelled) return;

      if (error) {
        // Don’t throw; surface non-fatal error for UI
        setState({ data: null, loading: false, error: error.message });
      } else {
        setState({ data: data ?? null, loading: false, error: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [platform]);

  return state;
}
