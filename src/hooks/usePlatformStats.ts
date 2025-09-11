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
  image_urls?: string[];
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

      console.log('🔍 Fetching platform stats...');
      
      // Try to fetch stats from database first (for admin updates)
      const { data: adminStats, error: adminError } = await supabase
        .from('platform_stats')
        .select('*')
        .limit(3); // Get all platform stats from any user

      console.log('📊 Database query result:', { adminStats, adminError });

      // If we have admin stats, use them
      if (!adminError && adminStats && adminStats.length > 0) {
        console.log('✅ Using admin stats from database:', adminStats);
        const formattedStats = adminStats.map(stat => ({
          platform: stat.platform,
          follower_count: stat.follower_count || 0,
          monthly_views: stat.monthly_views || 0,
          engagement_rate: stat.engagement_rate || 0,
          additional_metrics: stat.additional_metrics || {},
          updated_at: stat.updated_at,
          image_urls: Array.isArray(stat.image_urls) ? stat.image_urls.map(url => String(url)) : []
        }));
        setStats(formattedStats);
      } else {
        // Fallback to default stats for public view
        console.log('⚠️ Using fallback stats - no admin data found');
        setStats([
          {
            platform: 'instagram',
            follower_count: 38700,
            monthly_views: 730000,
            engagement_rate: 0.021, // Realistic Instagram rate
            additional_metrics: {},
            updated_at: new Date().toISOString()
          },
          {
            platform: 'youtube',
            follower_count: 8800,
            monthly_views: 86800,
            engagement_rate: 0.028, // Realistic YouTube rate
            additional_metrics: {},
            updated_at: new Date().toISOString()
          },
          {
            platform: 'tiktok',
            follower_count: 1410,
            monthly_views: 37000,
            engagement_rate: 0.052, // Realistic TikTok rate
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
          engagement_rate: 0.021, // Realistic Instagram rate
          additional_metrics: {},
          updated_at: new Date().toISOString()
        },
        {
          platform: 'youtube',
          follower_count: 8800,
          monthly_views: 86800,
          engagement_rate: 0.028, // Realistic YouTube rate
          additional_metrics: {},
          updated_at: new Date().toISOString()
        },
        {
          platform: 'tiktok',
          follower_count: 1410,
          monthly_views: 37000,
          engagement_rate: 0.052, // Realistic TikTok rate
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

    // Set up real-time subscription for platform stats
    const channel = supabase
      .channel('platform-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'platform_stats'
        },
        (payload) => {
          console.log('🔄 Platform stats changed:', payload);
          fetchStats(); // Refetch data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]); // Re-subscribe when user changes

  const getPlatformStat = (platform: string) => {
    return stats.find(stat => stat.platform === platform);
  };

  return { stats, loading, error, refetch: fetchStats, getPlatformStat };
};