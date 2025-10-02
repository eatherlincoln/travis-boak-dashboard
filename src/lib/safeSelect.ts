// src/lib/safeSelect.ts
import { SupabaseClient } from "@supabase/supabase-js";

export async function safeSelect<T>(
  supabase: SupabaseClient,
  table: string,
  builder: (q: any) => any,
  timeoutMs = 8000
): Promise<{ data: T | null; error: string | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);

  try {
    let q: any = supabase.from(table);
    q = builder(q);
    const { data, error } = await q;
    if (error) return { data: null, error: error.message || "select error" };
    return { data: data as T, error: null };
  } catch (e: any) {
    return { data: null, error: e?.message || "aborted" };
  } finally {
    clearTimeout(timer);
  }
}
