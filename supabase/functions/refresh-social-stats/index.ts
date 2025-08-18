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

    console.log('Refreshing all social platform stats...');

    // Refresh ViewStats (YouTube)
    console.log('1. Fetching YouTube data from ViewStats...');
    const viewStatsResponse = await supabase.functions.invoke('fetch-viewstats');
    
    let youtubeSuccess = false;
    if (viewStatsResponse.data?.success) {
      youtubeSuccess = true;
      console.log('✅ YouTube stats updated from ViewStats');
    } else {
      console.log('❌ YouTube ViewStats update failed:', viewStatsResponse.error);
    }

    // Attempt to fetch Instagram data (limited due to API restrictions)
    console.log('2. Attempting Instagram data refresh...');
    let instagramData = null;
    try {
      // Try to fetch Instagram profile page (public data only)
      const instagramResponse = await fetch('https://www.instagram.com/sheldonsimkus/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (instagramResponse.ok) {
        const html = await instagramResponse.text();
        
        // Extract follower count from meta tags or structured data
        const followerMatch = html.match(/"edge_followed_by":{"count":(\d+)}/i) || 
                             html.match(/(\d+(?:,\d{3})*)\s*followers/i);
        
        if (followerMatch) {
          const followers = parseInt(followerMatch[1].replace(/,/g, ''));
          instagramData = { followers };
          console.log('✅ Instagram follower count extracted:', followers);
        }
      }
    } catch (error) {
      console.log('❌ Instagram data fetch failed (expected due to restrictions):', error.message);
    }

    // Attempt to fetch TikTok data (very limited)
    console.log('3. Attempting TikTok data refresh...');
    let tiktokData = null;
    try {
      // TikTok is heavily protected, but we can try basic page scraping
      const tiktokResponse = await fetch('https://www.tiktok.com/@sheldonsimkus', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (tiktokResponse.ok) {
        const html = await tiktokResponse.text();
        console.log('TikTok page accessed, but data extraction is limited due to dynamic loading');
      }
    } catch (error) {
      console.log('❌ TikTok data fetch failed (expected due to restrictions):', error.message);
    }

    // Return results
    const results = {
      success: true,
      updates: {
        youtube: youtubeSuccess ? 'Updated from ViewStats' : 'Failed',
        instagram: instagramData ? `Followers: ${instagramData.followers}` : 'Limited access - manual update recommended',
        tiktok: tiktokData ? 'Updated' : 'Limited access - manual update recommended'
      },
      message: 'Social platform refresh completed. YouTube auto-updated, Instagram/TikTok require manual updates in admin panel.'
    };

    console.log('Social refresh results:', results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in refresh-social-stats function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});