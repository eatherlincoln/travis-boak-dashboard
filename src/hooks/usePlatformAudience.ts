import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AudienceData {
  platform: string;
  gender: {
    men: number;
    women: number;
  };
  age_groups: Array<{
    range: string;
    percentage: number;
  }>;
  countries: Array<{
    country: string;
    percentage: number;
  }>;
  cities: string[];
  updated_at: string;
}

export const usePlatformAudience = () => {
  const [audience, setAudience] = useState<AudienceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAudience = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching audience data...');
      
      const { data, error: fetchError } = await supabase
        .from('platform_audience')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        const formattedData = data.map(item => ({
          platform: item.platform,
          gender: (item.gender as any) || { men: 88, women: 12 },
          age_groups: (item.age_groups as any) || [
            { range: "25-34", percentage: 31 },
            { range: "18-24", percentage: 22 },
            { range: "35-44", percentage: 21 },
            { range: "45-54", percentage: 16 }
          ],
          countries: (item.countries as any) || [
            { country: "Australia", percentage: 51 },
            { country: "USA", percentage: 10 },
            { country: "Japan", percentage: 6 },
            { country: "Brazil", percentage: 5 }
          ],
          cities: (item.cities as string[]) || ["Sydney", "Gold Coast", "Melbourne", "Sunshine Coast"],
          updated_at: item.updated_at
        }));
        setAudience(formattedData);
      } else {
        // Fallback data
        setAudience([]);
      }
    } catch (err) {
      console.error('Error fetching audience data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAudience([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAudience();

      // Set up real-time subscription for audience data
      const channel = supabase
        .channel('audience-data-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'platform_audience'
          },
          (payload) => {
            console.log('🔄 Audience data changed:', payload);
            fetchAudience(); // Refetch data when changes occur
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const getAudienceByPlatform = (platform: string) => {
    return audience.find(item => item.platform === platform);
  };

  return { audience, loading, error, refetch: fetchAudience, getAudienceByPlatform };
};