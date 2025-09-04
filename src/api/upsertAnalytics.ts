/**
 * Client-side API function to upsert analytics data via secure edge function
 * Uses service role authentication on the server side for admin writes
 */
export async function upsertAnalytics(payload: {
  source: 'instagram' | 'tiktok' | 'youtube';
  metric: string;
  value: number;
  recorded_at?: string;
}) {
  const SUPABASE_PROJECT_ID = 'gmprigvmotrdrayxacnl';
  const edgeUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/upsert-analytics`;
  
  try {
    const response = await fetch(edgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    // Parse response JSON safely
    const json = await response.json().catch(() => ({}));
    
    // Check for errors
    if (!response.ok || json.ok === false) {
      const errorMessage = json.error || `HTTP ${response.status}: Upsert failed`;
      console.error('Analytics upsert failed:', errorMessage, payload);
      throw new Error(errorMessage);
    }

    console.log('Analytics data upserted successfully:', json);
    return json;
    
  } catch (error) {
    console.error('Error calling upsert-analytics:', error);
    throw error;
  }
}

/**
 * Convenience functions for specific platform metrics
 */
export const analyticsAPI = {
  updateFollowers: (source: 'instagram' | 'tiktok' | 'youtube', count: number) =>
    upsertAnalytics({ source, metric: 'followers', value: count }),
  
  updateViews: (source: 'instagram' | 'tiktok' | 'youtube', count: number) =>
    upsertAnalytics({ source, metric: 'monthly_views', value: count }),
  
  updateEngagement: (source: 'instagram' | 'tiktok' | 'youtube', rate: number) =>
    upsertAnalytics({ source, metric: 'engagement_rate', value: rate }),
  
  customMetric: (source: 'instagram' | 'tiktok' | 'youtube', metric: string, value: number) =>
    upsertAnalytics({ source, metric, value }),
};