import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { monthlyLikes } from '../selectors/instagramMonthlyLikes';

export function useInstagramMonthlyLikes() {
  const [map, setMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('analytics_public')
      .select('source, metric, value, recorded_period_start, updated_at')
      .eq('source', 'instagram')
      .eq('metric', 'likes');
    if (error) setErr(error.message);
    setMap(monthlyLikes((data as any[]) || []));
    setLoading(false);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel('analytics_public_likes')
      .on('postgres_changes', { event:'*', schema:'public', table:'analytics_public' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return { map, loading, err, reload: load };
}