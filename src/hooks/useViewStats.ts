import { supabase } from "@supabaseClient";
export function useViewStats() {
  return { refreshStats: async () => {}, loading: false };
}
