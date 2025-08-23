import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface InstagramPost {
  id: string;
  user_id: string;
  post_url: string;
  image_url?: string;
  title: string;
  content_type: 'image' | 'video' | 'carousel' | 'story';
  
  // Engagement metrics
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  
  // Reach and impressions
  reach_count: number;
  impressions_count: number;
  
  // Post metadata
  posted_at?: string;
  hashtags?: string[];
  
  // Calculated fields
  engagement_rate: number;
  
  created_at: string;
  updated_at: string;
}

export const useInstagramPosts = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPosts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching individual Instagram posts...');
      
      const { data, error: fetchError } = await supabase
        .from('instagram_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('engagement_rate', { ascending: false })
        .limit(4);

      if (fetchError) throw fetchError;
      
      console.log('📊 Individual posts fetched:', data);
      setPosts((data || []).map(post => ({
        ...post,
        content_type: post.content_type as 'image' | 'video' | 'carousel' | 'story',
        hashtags: post.hashtags || []
      })));
    } catch (err) {
      console.error('Error fetching Instagram posts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const upsertPost = async (postData: Partial<InstagramPost> & { post_url: string; title: string }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('instagram_posts')
        .upsert({
          ...postData,
          user_id: user.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Post saved:', data);
      await fetchPosts(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Error saving post:', err);
      throw err;
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('instagram_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      console.log('🗑️ Post deleted:', postId);
      await fetchPosts(); // Refresh the list
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err;
    }
  };

  const getTopPosts = (limit: number = 4) => {
    return posts
      .sort((a, b) => b.engagement_rate - a.engagement_rate)
      .slice(0, limit);
  };

  const getTotalEngagement = () => {
    return posts.reduce((total, post) => {
      return total + post.likes_count + post.comments_count + post.shares_count + post.saves_count;
    }, 0);
  };

  const getAverageEngagementRate = () => {
    if (posts.length === 0) return 0;
    const totalRate = posts.reduce((sum, post) => sum + post.engagement_rate, 0);
    return totalRate / posts.length;
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    upsertPost,
    deletePost,
    getTopPosts,
    getTotalEngagement,
    getAverageEngagementRate
  };
};