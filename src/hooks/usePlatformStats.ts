import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PlatformStats {
  platform: string;
  follower_count: number;
  monthly_views: number;
  engagement_rate: number;
  additional_metrics: any;
  updated_at: string;
}

export const usePlatformStats = () => {
  const [stats, setStats] = useState<PlatformStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // If user is logged in, fetch their stats
      if (user) {
        const { data, error } = await supabase
          .from('platform_stats')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setStats(data || []);
      } else {
        // Fallback to default stats for public view
        setStats([
          {
            platform: 'instagram',
            follower_count: 38700,
            monthly_views: 730000,
            engagement_rate: 8.2,
            additional_metrics: {},
            updated_at: new Date().toISOString()
          },
          {
            platform: 'youtube',
            follower_count: 8800,
            monthly_views: 86800,
            engagement_rate: 6.5,
            additional_metrics: {},
            updated_at: new Date().toISOString()
          },
          {
            platform: 'tiktok',
            follower_count: 1410,
            monthly_views: 37000,
            engagement_rate: 9.1,
            additional_metrics: {},
            updated_at: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching platform stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to hardcoded stats if API fails
      setStats([
        {
          platform: 'instagram',
          follower_count: 38700,
          monthly_views: 730000,
          engagement_rate: 8.2,
          additional_metrics: {},
          updated_at: new Date().toISOString()
        },
        {
          platform: 'youtube',
          follower_count: 8800,
          monthly_views: 86800,
          engagement_rate: 6.5,
          additional_metrics: {},
          updated_at: new Date().toISOString()
        },
        {
          platform: 'tiktok',
          follower_count: 1410,
          monthly_views: 37000,
          engagement_rate: 9.1,
          additional_metrics: {},
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const getPlatformStat = (platform: string) => {
    return stats.find(stat => stat.platform === platform);
  };

  return { stats, loading, error, refetch: fetchStats, getPlatformStat };
};