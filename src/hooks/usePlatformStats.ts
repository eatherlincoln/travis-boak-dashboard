import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export function usePlatformStats(limit = 20) {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("platform_stats")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (!mounted) return;
      if (error) {
        setError(error.message);
        setStats([]);
      } else {
        setStats(data || []);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [limit]);

  return { stats, loading, error };
}
