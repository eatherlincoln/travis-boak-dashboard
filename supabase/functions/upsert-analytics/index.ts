import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security: restrict to your domain(s)
    const origin = req.headers.get('origin') ?? '';
    const allowedOrigins = [
      'https://sheldon-social-media.lovable.app',
      'https://lovable.dev',
      'http://localhost:8080', // For local development
      'https://gmprigvmotrdrayxacnl.lovable.app' // Your current domain
    ];
    
    console.log('Request origin:', origin);
    
    if (origin && !allowedOrigins.includes(origin)) {
      console.error('Forbidden origin:', origin);
      return new Response(JSON.stringify({ ok: false, error: 'forbidden origin' }), { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(JSON.stringify({ ok: false, error: 'server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, { 
      auth: { persistSession: false } 
    });

    // Parse and validate request payload
    const { source, metric, value, recorded_at } = await req.json();
    
    if (!source || !metric || typeof value !== 'number') {
      console.error('Invalid payload:', { source, metric, value, recorded_at });
      return new Response(JSON.stringify({ ok: false, error: 'invalid payload - source, metric, and numeric value required' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare the row for insertion
    const row = {
      source: String(source),
      metric: String(metric), 
      value: Number(value),
      recorded_at: recorded_at ? new Date(recorded_at).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Inserting analytics row:', row);

    // Insert into analytics table (this will trigger the sync to analytics_public)
    const { data, error } = await supabase.from('analytics').insert(row).select();
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Analytics row inserted successfully:', data);

    return new Response(JSON.stringify({ ok: true, data: data?.[0] }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json', 
        'Cache-Control': 'no-store' 
      }
    });

  } catch (error) {
    console.error('Error in upsert-analytics function:', error);
    
    return new Response(JSON.stringify({ 
      ok: false, 
      error: String(error?.message ?? error) 
    }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json', 
        'Cache-Control': 'no-store' 
      },
      status: 500,
    });
  }
});