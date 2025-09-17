// ✅ This runs on Supabase's Deno runtime (server-side)
// supabase/functions/fetch-viewstats/index.ts
/// <reference lib="deno.ns" />

// Import the Supabase client for Deno
// (either line works — pick one and keep it consistent)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, unknown>;

// CORS (adjust origin if you want to lock it down)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); // only if you truly need admin writes

    // Optional: parse payload (if POSTing anything)
    const body =
      req.method === "POST"
        ? await req.json().catch(() => ({} as Json))
        : ({} as Json);

    // Optional: read Bearer token from the client (if you want RLS as the logged-in user)
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");

    // 1) Public client (no RLS as user) — good for verifying tokens, reading public tables
    const supabaseAuth = createClient(supabaseUrl, anonKey);

    // 2) Authed client that runs with the user's RLS context (when you have a token)
    const supabaseUser = token
      ? createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        })
      : null;

    // 3) (Optional) Admin client — ONLY if you must bypass RLS (never expose this in frontend)
    const supabaseAdmin = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : null;

    // ---- Example: verify user (optional) ----
    let userId: string | null = null;
    if (token) {
      const { data: userRes, error: authError } =
        await supabaseAuth.auth.getUser(token);
      if (authError) {
        return new Response(
          JSON.stringify({ success: false, error: authError.message }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      userId = userRes.user?.id ?? null;
    }

    // ---- Example: do your work here ----
    // e.g., recompute monthly view stats, write to platform_stats
    // This is a stub; replace with your real logic
    if (supabaseAdmin) {
      // Example write (bypassing RLS with service role)
      const { error: upsertErr } = await supabaseAdmin
        .from("platform_stats")
        .upsert(
          [
            { platform: "youtube", monthly_views: 86800 },
            { platform: "instagram", monthly_views: 730000 },
            { platform: "tiktok", monthly_views: 37000 },
          ],
          { onConflict: "platform" }
        );

      if (upsertErr) {
        return new Response(
          JSON.stringify({ success: false, error: upsertErr.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(JSON.stringify({ success: true, userId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ success: false, error: e?.message ?? "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
