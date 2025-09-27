import { useEffect } from "react";
import { supabase } from "@supabaseClient";

export function useSupabaseEmailLink() {
  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);

      // If there's an error from Supabase
      const err = params.get("error") || params.get("error_description");
      if (err) {
        console.warn("[auth] error:", err);
      }

      // New flow: ?code= in the URL
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession({ code });
        if (error) {
          console.warn("[auth] exchangeCodeForSession error:", error.message);
        }
        // Clean up the URL so it just shows /admin
        window.history.replaceState({}, "", "/admin");
        return;
      }

      // Old flow: #access_token= in the URL
      if (window.location.hash.includes("access_token")) {
        await supabase.auth.getSession();
        window.history.replaceState({}, "", "/admin");
      }
    })();
  }, []);
}
