import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useViewStats() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const refreshStats = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      // Optional: call an Edge Function you deploy later
      // const { data, error } = await supabase.functions.invoke("refresh-stats");
      // if (error) throw error;
    } catch (e: any) {
      setError(e?.message ?? "Failed to refresh stats");
      console.error("useViewStats error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  return { refreshStats, loading, error };
}
