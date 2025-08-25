import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InstagramPostData {
  post_number: number;
  url: string;
  likes: number;
  comments: number;  
  shares: number;
  image_url?: string;
}

interface FormattedInstagramPost {
  title: string;
  platform: string;
  likes: string;
  image: string;
  engagement: string;
  comments: number;
  shares: number;
  url: string;
}

const defaultInstagramPosts = [
  {
    title: "Perfect barrel at Snapper Rocks",
    platform: "Instagram",
    likes: "2.8K likes",
    image: "https://images.unsplash.com/photo-1581852017103-68ac65514cf7?w=500&h=500&fit=crop&crop=center",
    engagement: "8.2%"
  },
  {
    title: "Dawn patrol magic hours",
    platform: "Instagram", 
    likes: "2.1K likes",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=center",
    engagement: "7.8%"
  },
  {
    title: "Behind the scenes setup",
    platform: "Instagram",
    likes: "1.9K likes", 
    image: "https://images.unsplash.com/photo-1519018307286-6e2407875739?w=500&h=500&fit=crop&crop=center",
    engagement: "9.1%"
  },
  {
    title: "Post-session recovery",
    platform: "Instagram",
    likes: "1.6K likes",
    image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=500&h=500&fit=crop&crop=center", 
    engagement: "7.5%"
  }
];

export const useInstagramPosts = () => {
  const [posts, setPosts] = useState<FormattedInstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Helper to format numbers like 2.8K
  const formatNumberShort = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${Math.round(n)}`;
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching Instagram posts from platform_stats...');
      
      // Fetch Instagram platform stats which contains post analysis
      const { data, error: fetchError } = await supabase
        .from('platform_stats')
        .select('additional_metrics, engagement_rate')
        .eq('platform', 'instagram')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data?.additional_metrics && 
          typeof data.additional_metrics === 'object' && 
          data.additional_metrics !== null) {
        
        const metrics = data.additional_metrics as any;
        if (metrics.post_analysis && Array.isArray(metrics.post_analysis)) {
          console.log('✅ Found admin Instagram posts:', metrics.post_analysis);
          
          const adminPosts = metrics.post_analysis as InstagramPostData[];
          const engagementStr = typeof data.engagement_rate === 'number' 
            ? `${data.engagement_rate}%` 
            : '8.2%';

          const formattedPosts: FormattedInstagramPost[] = adminPosts.map((post, index) => ({
            title: post.url 
              ? `Instagram Post ${post.post_number || index + 1}` 
              : defaultInstagramPosts[index]?.title || `Post ${index + 1}`,
            platform: "Instagram",
            likes: post.likes ? `${formatNumberShort(post.likes)} likes` : defaultInstagramPosts[index]?.likes || "0 likes",
            image: post.image_url || defaultInstagramPosts[index]?.image || "https://images.unsplash.com/photo-1581852017103-68ac65514cf7?w=500&h=500&fit=crop&crop=center",
            engagement: engagementStr,
            comments: post.comments || 0,
            shares: post.shares || 0,
            url: post.url || '#'
          })).slice(0, 4); // Only show first 4 posts

          setPosts(formattedPosts);
        } else {
          console.log('⚠️ No admin post analysis found, using default posts');
          setPosts(defaultInstagramPosts.map(p => ({ ...p, url: '#', comments: 0, shares: 0 })));
        }
      } else {
        console.log('⚠️ No additional_metrics found, using default posts');
        setPosts(defaultInstagramPosts.map(p => ({ ...p, url: '#', comments: 0, shares: 0 })));
      }
    } catch (err) {
      console.error('Error fetching Instagram posts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback to default posts
      setPosts(defaultInstagramPosts.map(p => ({ ...p, url: '#', comments: 0, shares: 0 })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Set up real-time subscription for platform stats changes (Instagram posts are stored here)
    const channel = supabase
      .channel('instagram-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'platform_stats',
          filter: 'platform=eq.instagram'
        },
        (payload) => {
          console.log('🔄 Instagram posts data changed:', payload);
          fetchPosts(); // Refetch data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // No dependency on user since we want to listen to all changes

  return { posts, loading, error, refetch: fetchPosts };
};