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

    // Parse and validate request payload with enhanced security
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid JSON' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { source, metric, value, recorded_at } = requestBody;
    
    // Enhanced validation with limits
    const allowedSources = ['instagram', 'tiktok', 'youtube'];
    const maxMetricLength = 50;
    const maxValue = 1000000000; // 1 billion limit
    
    if (!source || !allowedSources.includes(source)) {
      console.error('Invalid source:', source);
      return new Response(JSON.stringify({ ok: false, error: 'invalid source - must be instagram, tiktok, or youtube' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!metric || typeof metric !== 'string' || metric.length > maxMetricLength) {
      console.error('Invalid metric:', { metric, length: metric?.length });
      return new Response(JSON.stringify({ ok: false, error: `invalid metric - must be string under ${maxMetricLength} chars` }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (typeof value !== 'number' || isNaN(value) || value < 0 || value > maxValue) {
      console.error('Invalid value:', { value, type: typeof value });
      return new Response(JSON.stringify({ ok: false, error: `invalid value - must be number between 0-${maxValue}` }), { 
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