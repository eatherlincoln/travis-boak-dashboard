import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useViewStats = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const refreshStats = async () => {
    // Require an active session before invoking the secured function
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.info('Skipping ViewStats refresh: user not authenticated');
      return null;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-viewstats');

      if (error) throw error;

      // Also trigger platform-wide refresh to sync platform_stats for dashboard
      await supabase.functions.invoke('refresh-social-stats');

      if (data.success) {
        toast({
          title: "Success!",
          description: `YouTube stats updated from ViewStats: ${data.data.subscriberCount.toLocaleString()} subscribers, ${Math.round(data.data.monthlyViews / 1000)}K monthly views`
        });
        
        // Force a page reload to ensure all components get the updated data
        window.location.reload();
        
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch ViewStats data');
      }
    } catch (error) {
      console.error('Error fetching ViewStats:', error);
      const msg = (error as any)?.message?.toString() || '';
      const isAuthError = msg.includes('403') || msg.includes('401') || msg.toLowerCase().includes('jwt') || msg.toLowerCase().includes('token');
      toast({
        title: isAuthError ? "Sign in required" : "Error",
        description: isAuthError ? "Please sign in as admin to refresh ViewStats." : "Failed to update YouTube stats from ViewStats",
        variant: isAuthError ? "default" : "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { refreshStats, loading };
};