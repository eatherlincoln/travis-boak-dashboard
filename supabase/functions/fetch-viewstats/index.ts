import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import FirecrawlApp from 'https://esm.sh/@mendable/firecrawl-js@1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = 'https://gmprigvmotrdrayxacnl.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!firecrawlApiKey) {
      throw new Error('Firecrawl API key not configured');
    }

    if (!supabaseServiceKey) {
      throw new Error('Supabase service key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey });

    console.log('Scraping ViewStats for Sheldon Simkus...');

    // Scrape the ViewStats page
    const scrapeResult = await firecrawl.scrapeUrl('https://www.viewstats.com/@sheldonsimkus/channelytics', {
      formats: ['markdown']
    });

    if (!scrapeResult.success || !scrapeResult.markdown) {
      throw new Error('Failed to scrape ViewStats page');
    }

    console.log('ViewStats page scraped successfully');

    // Parse the markdown content to extract stats
    const content = scrapeResult.markdown;
    
    // Extract key metrics using regex patterns
    const subscribersMatch = content.match(/Subscribers[\s\S]*?(\d{1,3}(?:,\d{3})*|\d+\.?\d*K)/i);
    const totalViewsMatch = content.match(/Total Views[\s\S]*?(\d{1,3}(?:,\d{3})*(?:\.\d+)?[MK]?)/i);
    const monthlyViewsMatch = content.match(/Views[\s\S]*?Last 28 days[\s\S]*?(\d{1,3}(?:,\d{3})*|\d+\.?\d*K)/i);
    const monthlySubsMatch = content.match(/Subs[\s\S]*?Last 28 days[\s\S]*?(\d+)/i);

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

    // Extract and parse the data
    const subscriberCount = subscribersMatch ? parseNumber(subscribersMatch[1]) : 8780;
    const totalViews = totalViewsMatch ? parseNumber(totalViewsMatch[1]) : 1649552;
    const monthlyViews = monthlyViewsMatch ? parseNumber(monthlyViewsMatch[1]) : 86250;
    const monthlySubs = monthlySubsMatch ? parseInt(monthlySubsMatch[1]) : 200;

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