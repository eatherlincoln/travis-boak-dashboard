import { useCallback, useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type BaseState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useSupabaseList<T = any>(opts: {
  table: string;
  selectStr?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  map?: (rows: any[]) => T;
}): BaseState<T> {
  const { table, selectStr = "*", orderBy, limit, map } = opts;

  const [data, setData] = useState<T>([] as unknown as T);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let q = supabase.from(table).select(selectStr);
      if (orderBy)
        q = q.order(orderBy.column, { ascending: !!orderBy.ascending });
      if (limit) q = q.limit(limit);

      const { data, error } = await q;
      if (error) throw error;

      const val = map ? map(data ?? []) : ((data ?? []) as unknown as T);
      setData(val);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load data");
      setData([] as unknown as T);
    } finally {
      setLoading(false);
    }
  }, [table, selectStr, orderBy?.column, orderBy?.ascending, limit, map]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  return { data, loading, error, refetch: fetchRows };
}
