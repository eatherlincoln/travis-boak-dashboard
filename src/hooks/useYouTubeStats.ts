import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface YouTubeStats {
  channel_id: string;
  subscriber_count: number;
  view_count: number;
  video_count: number;
  updated_at: string;
}

export const useYouTubeStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<YouTubeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First, try to get existing stats from the database (user-specific)
      const { data: existingStats, error: dbError } = await supabase
        .from('youtube_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('channel_id', 'UCKp8YgCM8wfzNHqGY0_Fhfg')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError && dbError.code !== 'PGRST116') {
        throw dbError;
      }

      // If we have recent stats (less than 1 hour old), use them
      if (existingStats) {
        const lastUpdate = new Date(existingStats.updated_at);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        if (lastUpdate > oneHourAgo) {
          setStats(existingStats);
          setLoading(false);
          return;
        }
      }

      // Otherwise, fetch fresh stats from the edge function
      const { data: freshData, error: functionError } = await supabase.functions
        .invoke('fetch-youtube-stats', {
          body: { refresh: true }
        });

      if (functionError) {
        throw functionError;
      }

      if (freshData?.success && freshData?.data) {
        // Fetch the updated stats from the database (user-specific)
        const { data: updatedStats, error: updatedError } = await supabase
          .from('youtube_stats')
          .select('*')
          .eq('user_id', user.id)
          .eq('channel_id', 'UCKp8YgCM8wfzNHqGY0_Fhfg')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (updatedError) {
          throw updatedError;
        }

        setStats(updatedStats);
      } else {
        throw new Error('Failed to fetch YouTube stats');
      }
    } catch (err) {
      console.error('Error fetching YouTube stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to hardcoded stats if API fails
      setStats({
        channel_id: 'UCKp8YgCM8wfzNHqGY0_Fhfg',
        subscriber_count: 8800,
        view_count: 847000,
        video_count: 50,
        updated_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();

      // Set up real-time subscription for YouTube stats
      const channel = supabase
        .channel('youtube-stats-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'youtube_stats'
          },
          (payload) => {
            console.log('🔄 YouTube stats changed:', payload);
            fetchStats(); // Refetch data when changes occur
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return { stats, loading, error, refetch: fetchStats };
};
