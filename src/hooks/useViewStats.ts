import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useViewStats = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const refreshStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-viewstats');

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success!",
          description: `YouTube stats updated from ViewStats: ${data.data.subscriberCount.toLocaleString()} subscribers, ${Math.round(data.data.monthlyViews / 1000)}K monthly views`
        });
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch ViewStats data');
      }
    } catch (error) {
      console.error('Error fetching ViewStats:', error);
      toast({
        title: "Error",
        description: "Failed to update YouTube stats from ViewStats",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { refreshStats, loading };
};