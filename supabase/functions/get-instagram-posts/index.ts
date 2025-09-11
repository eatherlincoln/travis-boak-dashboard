// Supabase Edge Function: get-instagram-posts
// Returns curated Instagram posts stored by admins in platform_stats.additional_metrics.post_analysis
// Uses service role to bypass RLS for public consumption

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  try {
    const { data, error } = await supabase
      .from('platform_stats')
      .select('additional_metrics, follower_count, updated_at')
      .eq('platform', 'instagram')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('DB error fetching platform_stats:', error);
      return new Response(JSON.stringify({ posts: [], error: error.message }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      });
    }

    const row = data?.[0];
    const follower_count = row?.follower_count ?? 38700;
    const posts = Array.isArray(row?.additional_metrics?.post_analysis)
      ? row.additional_metrics.post_analysis
      : [];

    console.log('Edge:get-instagram-posts returning', { count: posts.length, follower_count });

    return new Response(
      JSON.stringify({ posts, follower_count }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (e) {
    console.error('Unexpected error in get-instagram-posts:', e);
    return new Response(JSON.stringify({ posts: [], error: String(e) }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500,
    });
  }
});