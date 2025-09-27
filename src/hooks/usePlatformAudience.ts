import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type AudienceRow = {
  platform: "instagram" | "youtube" | "tiktok";
  // adjust to your schema
  gender_male?: number | null;
  gender_female?: number | null;
  gender_other?: number | null;
  ages?: Record<string, number> | null; // e.g. { "13-17": 3, "18-24": 22, ... }
  countries?: Record<string, number> | null; // e.g. { AU: 35, US: 28, ... }
  cities?: Record<string, number> | null; // e.g. { Sydney: 12, Tokyo: 7, ... }
  updated_at?: string | null;
};

type State = {
  data: AudienceRow | null;
  loading: boolean;
  error: string | null;
};

export function usePlatformAudience(
  platform: "instagram" | "youtube" | "tiktok"
) {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      setState((s) => ({ ...s, loading: true, error: null }));

      const { data, error } = await supabase
        .from("audience") // ← your demographics table name
        .select("*")
        .eq("platform", platform)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!alive) return;

      if (error) {
        setState({ data: null, loading: false, error: error.message });
        return;
      }
      setState({ data: data as AudienceRow, loading: false, error: null });
    })();

    return () => {
      alive = false;
    };
  }, [platform]);

  return state;
}
