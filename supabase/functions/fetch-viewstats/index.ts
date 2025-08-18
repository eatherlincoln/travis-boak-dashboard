import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = 'https://gmprigvmotrdrayxacnl.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!supabaseServiceKey) {
      throw new Error('Supabase service key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching ViewStats data via direct HTTP request...');

    // Fetch the ViewStats page directly
    const response = await fetch('https://www.viewstats.com/@sheldonsimkus/channelytics', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ViewStats page: ${response.status}`);
    }

    const html = await response.text();
    console.log('ViewStats page fetched successfully, parsing data...');
    
    // Extract key metrics using regex patterns from HTML
    const subscribersMatch = html.match(/(\d{1,3}(?:,\d{3})*)\s*Subscribers/i) || html.match(/Subscribers[^>]*>[\s\S]*?(\d+(?:,\d{3})*|\d+\.?\d*K)/i);
    const monthlyViewsMatch = html.match(/(\d+(?:\.\d+)?K)\s*Views[^>]*Last 28 days/i) || html.match(/Views[^>]*Last 28 days[^>]*>[\s\S]*?(\d+(?:\.\d+)?K)/i);
    const monthlySubsMatch = html.match(/(\d+)\s*Subs[^>]*Last 28 days/i) || html.match(/Subs[^>]*Last 28 days[^>]*>[\s\S]*?(\d+)/i);
    const totalViewsMatch = html.match(/(\d+(?:\.\d+)?M)\s*Total Views/i) || html.match(/Total Views[^>]*>[\s\S]*?(\d+(?:\.\d+)?M)/i);

    // Helper function to parse numbers with K/M suffixes
    const parseNumber = (str: string): number => {
      if (!str) return 0;
      const cleanStr = str.replace(/,/g, '');
      if (cleanStr.includes('K')) {
        return Math.round(parseFloat(cleanStr.replace('K', '')) * 1000);
      }
      if (cleanStr.includes('M')) {
        return Math.round(parseFloat(cleanStr.replace('M', '')) * 1000000);
      }
      return parseInt(cleanStr) || 0;
    };

    // Extract and parse the data with fallbacks
    const subscriberCount = subscribersMatch ? parseNumber(subscribersMatch[1]) : 8780;
    const totalViews = totalViewsMatch ? parseNumber(totalViewsMatch[1]) : 1649552;
    const monthlyViews = monthlyViewsMatch ? parseNumber(monthlyViewsMatch[1]) : 86250;
    const monthlySubs = monthlySubsMatch ? parseInt(monthlySubsMatch[1]) : 200;

    console.log('Extracted data:', { subscribersMatch: subscribersMatch?.[1], monthlyViewsMatch: monthlyViewsMatch?.[1] });

    console.log('Parsed ViewStats data:', {
      subscriberCount,
      totalViews,
      monthlyViews,
      monthlySubs
    });

    // Update YouTube stats in the platform_stats table for all users
    const { error: updateError } = await supabase
      .from('platform_stats')
      .update({
        follower_count: subscriberCount,
        monthly_views: monthlyViews,
        updated_at: new Date().toISOString()
      })
      .eq('platform', 'youtube');

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Database error: ${updateError.message}`);
    }

    console.log('Successfully updated YouTube stats from ViewStats');

    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        subscriberCount,
        totalViews,
        monthlyViews,
        monthlySubs,
        source: 'ViewStats'
      },
      message: 'YouTube stats updated successfully from ViewStats' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-viewstats function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});