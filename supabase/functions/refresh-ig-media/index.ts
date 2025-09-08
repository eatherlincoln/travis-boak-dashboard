import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const { media_ids } = await req.json();
    
    if (!Array.isArray(media_ids) || media_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'media_ids array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
    if (!accessToken) {
      console.warn('INSTAGRAM_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Instagram access token not configured',
          updated: 0,
          skipped: media_ids.length 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let updated = 0;
    let errors = 0;

    // Process in batches of 20
    for (let i = 0; i < media_ids.length; i += 20) {
      const batch = media_ids.slice(i, i + 20);
      
      for (const mediaId of batch) {
        try {
          // Fetch current media_url from Instagram Graph API
          const response = await fetch(
            `https://graph.instagram.com/${mediaId}?fields=media_url&access_token=${accessToken}`
          );
          
          if (!response.ok) {
            console.error(`Failed to fetch media ${mediaId}: ${response.status}`);
            errors++;
            continue;
          }
          
          const data = await response.json();
          const newMediaUrl = data.media_url;
          
          if (!newMediaUrl) {
            console.warn(`No media_url found for ${mediaId}`);
            continue;
          }
          
          // Get current media_url from database
          const { data: currentPost, error: fetchError } = await supabase
            .from('instagram_posts_public')
            .select('media_url')
            .eq('media_id', mediaId)
            .single();
            
          if (fetchError) {
            console.error(`Failed to fetch current post ${mediaId}:`, fetchError);
            errors++;
            continue;
          }
          
          // Only update if URL has changed
          if (currentPost?.media_url !== newMediaUrl) {
            const { error: updateError } = await supabase
              .from('instagram_posts_public')
              .update({ 
                media_url: newMediaUrl,
                updated_at: new Date().toISOString()
              })
              .eq('media_id', mediaId);
              
            if (updateError) {
              console.error(`Failed to update post ${mediaId}:`, updateError);
              errors++;
            } else {
              updated++;
              console.log(`Updated media_url for ${mediaId}`);
            }
          }
          
        } catch (error) {
          console.error(`Error processing media ${mediaId}:`, error);
          errors++;
        }
      }
      
      // Small delay between batches to avoid rate limiting
      if (i + 20 < media_ids.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: media_ids.length,
        updated,
        errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in refresh-ig-media function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});