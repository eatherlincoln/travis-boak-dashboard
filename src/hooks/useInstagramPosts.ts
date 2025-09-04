import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InstagramPostData {
  post_number: number;
  url: string;
  likes: number;
  comments: number;  
  shares: number;
  saves?: number;
  reach?: number;
  image_url?: string;
}

interface FormattedInstagramPost {
  title: string;
  platform: string;
  likes: string;
  likesNumber: number;
  image: string;
  engagement: string;
  engagementRate: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  url: string;
}

const defaultInstagramPosts = [
  {
    title: "Perfect barrel at Snapper Rocks",
    platform: "Instagram",
    likes: "2.8K likes",
    likesNumber: 2800,
    image: "https://images.unsplash.com/photo-1581852017103-68ac65514cf7?w=500&h=500&fit=crop&crop=center",
    engagement: "4.2%",
    engagementRate: 4.2,
    comments: 45,
    shares: 12,
    saves: 156,
    reach: 96750,
    url: '#'
  },
  {
    title: "Dawn patrol magic hours",
    platform: "Instagram", 
    likes: "2.1K likes",
    likesNumber: 2100,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=center",
    engagement: "3.8%",
    engagementRate: 3.8,
    comments: 38,
    shares: 8,
    saves: 142,
    reach: 77400,
    url: '#'
  },
  {
    title: "Behind the scenes setup",
    platform: "Instagram",
    likes: "1.9K likes",
    likesNumber: 1900,
    image: "https://images.unsplash.com/photo-1519018307286-6e2407875739?w=500&h=500&fit=crop&crop=center",
    engagement: "5.1%",
    engagementRate: 5.1,
    comments: 52,
    shares: 15,
    saves: 98,
    reach: 45600,
    url: '#'
  },
  {
    title: "Post-session recovery",
    platform: "Instagram",
    likes: "1.6K likes",
    likesNumber: 1600,
    image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=500&h=500&fit=crop&crop=center", 
    engagement: "3.5%",
    engagementRate: 3.5,
    comments: 29,
    shares: 6,
    saves: 87,
    reach: 61800,
    url: '#'
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

  // Calculate engagement rate for individual posts
  const calculateEngagementRate = (post: InstagramPostData, followerCount: number = 38700) => {
    const totalEngagement = post.likes + post.comments + post.shares + (post.saves || 0);
    
    // For Instagram, engagement rate is typically calculated as:
    // (Total Engagement / Follower Count) * 100
    // This is the industry standard method
    const engagementRate = (totalEngagement / followerCount) * 100;
    
    return Math.max(0.1, Math.min(15, engagementRate)); // Cap between 0.1% and 15% for realism
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching Instagram posts from platform_stats...');
      
      // Fetch Instagram platform stats which contains post analysis
      const { data, error: fetchError } = await supabase
        .from('platform_stats')
        .select('additional_metrics, engagement_rate, follower_count')
        .eq('platform', 'instagram')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const followerCount = data?.follower_count || 38700;

      if (data?.additional_metrics && 
          typeof data.additional_metrics === 'object' && 
          data.additional_metrics !== null) {
        
        const metrics = data.additional_metrics as any;
        if (metrics.post_analysis && Array.isArray(metrics.post_analysis)) {
          console.log('✅ Found admin Instagram posts:', metrics.post_analysis);
          
          const adminPosts = metrics.post_analysis as InstagramPostData[];

          const formattedPosts: FormattedInstagramPost[] = adminPosts.map((post, index) => {
            const likesNum = post.likes || 0;
            const engagementRate = calculateEngagementRate(post, followerCount);
            // Use actual reach if provided, otherwise estimate as 2-3x follower count for viral content
            const estimatedReach = post.reach || Math.floor(followerCount * 2.5);
            
            return {
              title: post.url 
                ? `Instagram Post ${post.post_number || index + 1}` 
                : defaultInstagramPosts[index]?.title || `Post ${index + 1}`,
              platform: "Instagram",
              likes: post.likes ? `${formatNumberShort(post.likes)} likes` : defaultInstagramPosts[index]?.likes || "0 likes",
              likesNumber: likesNum,
              image: post.image_url || defaultInstagramPosts[index]?.image || "https://images.unsplash.com/photo-1581852017103-68ac65514cf7?w=500&h=500&fit=crop&crop=center",
              engagement: `${engagementRate.toFixed(1)}%`,
              engagementRate: engagementRate,
              comments: post.comments || 0,
              shares: post.shares || 0,
              saves: post.saves || 0,
              reach: estimatedReach,
              url: post.url || '#'
            };
          }).slice(0, 4); // Only show first 4 posts

          setPosts(formattedPosts);
        } else {
          console.log('⚠️ No admin post analysis found, using default posts');
          setPosts(defaultInstagramPosts);
        }
      } else {
        console.log('⚠️ No additional_metrics found, using default posts');
        setPosts(defaultInstagramPosts);
      }
    } catch (err) {
      console.error('Error fetching Instagram posts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback to default posts
      setPosts(defaultInstagramPosts);
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