import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, LogOut, Save, ArrowLeft, Instagram, Youtube, Music, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlatformStats {
  id: string;
  platform: string;
  follower_count: number;
  monthly_views: number;
  engagement_rate: number;
  additional_metrics: {
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
  };
}

const Admin = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<PlatformStats[]>([]);
  const [editingStats, setEditingStats] = useState<{ [key: string]: PlatformStats }>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('platform_stats')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const formattedStats = data?.map(stat => ({
        ...stat,
        additional_metrics: typeof stat.additional_metrics === 'object' && stat.additional_metrics !== null 
          ? stat.additional_metrics as { likes?: number; comments?: number; shares?: number; saves?: number; }
          : {}
      })) || [];
      
      setStats(formattedStats);
      
      // Initialize editing state
      const editingState = {};
      formattedStats.forEach(stat => {
        editingState[stat.platform] = { ...stat };
      });
      setEditingStats(editingState);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to load platform statistics",
        variant: "destructive"
      });
    }
  };

  const calculateEngagementRate = (platform: string) => {
    const stat = editingStats[platform];
    if (!stat || !stat.additional_metrics) return 0;
    
    const { likes = 0, comments = 0, shares = 0, saves = 0 } = stat.additional_metrics;
    const totalEngagements = likes + comments + shares + (platform === 'instagram' ? saves : 0);
    const engagementRate = stat.follower_count > 0 ? (totalEngagements / stat.follower_count) * 100 : 0;
    
    return Math.round(engagementRate * 100) / 100; // Round to 2 decimal places
  };

  const updatePlatformStats = async (platform: string) => {
    if (!user || !editingStats[platform]) return;
    
    setLoading(true);
    try {
      // Auto-calculate engagement rate
      const calculatedEngagementRate = calculateEngagementRate(platform);
      
      const { error } = await supabase
        .from('platform_stats')
        .update({
          follower_count: editingStats[platform].follower_count,
          monthly_views: editingStats[platform].monthly_views,
          engagement_rate: calculatedEngagementRate,
          additional_metrics: editingStats[platform].additional_metrics
        })
        .eq('user_id', user.id)
        .eq('platform', platform);

      if (error) throw error;

      toast({
        title: "Updated!",
        description: `${platform} statistics updated successfully (Engagement: ${calculatedEngagementRate}%)`
      });
      
      await fetchStats();
    } catch (error) {
      console.error('Error updating stats:', error);
      toast({
        title: "Error",
        description: "Failed to update statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEditingValue = (platform: string, field: string, value: any) => {
    setEditingStats(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: field === 'engagement_rate' ? parseFloat(value) : parseInt(value) || 0
      }
    }));
  };

  const updateMetricValue = (platform: string, metric: string, value: any) => {
    setEditingStats(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        additional_metrics: {
          ...prev[platform]?.additional_metrics,
          [metric]: parseInt(value) || 0
        }
      }
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <img src="/lovable-uploads/502a8d59-4e94-4c4a-94c8-4e5f78e6decf.png" className="h-5 w-5" alt="Instagram" />;
      case 'youtube':
        return <img src="/lovable-uploads/9aa87b25-88f0-439d-890a-7c2d475c22f5.png" className="h-5 w-5" alt="YouTube" />;
      case 'tiktok':
        return <img src="/lovable-uploads/d3d646ba-e348-45c2-9a7b-d3f53ff73b4c.png" className="h-5 w-5" alt="TikTok" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'bg-pink-500';
      case 'youtube':
        return 'bg-red-500';
      case 'tiktok':
        return 'bg-black';
      default:
        return 'bg-gray-500';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-wave flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-wave">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to site
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your platform statistics</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Platform Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.platform} className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <div className={`p-2 rounded-lg ${getPlatformColor(stat.platform)} text-white`}>
                    {getPlatformIcon(stat.platform)}
                  </div>
                  {stat.platform}
                </CardTitle>
                <CardDescription>
                  Update your {stat.platform} statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Followers</Label>
                  <Input
                    type="number"
                    value={editingStats[stat.platform]?.follower_count || 0}
                    onChange={(e) => updateEditingValue(stat.platform, 'follower_count', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{stat.platform === 'instagram' || stat.platform === 'tiktok' ? 'Video Views (Monthly)' : 'Monthly Views'}</Label>
                  <Input
                    type="number"
                    value={editingStats[stat.platform]?.monthly_views || 0}
                    onChange={(e) => updateEditingValue(stat.platform, 'monthly_views', e.target.value)}
                  />
                </div>
                
                {/* Platform-specific metrics */}
                {stat.platform === 'instagram' && (
                  <div className="space-y-4 p-3 bg-muted/30 rounded-lg">
                    <Label className="text-sm font-medium">Instagram Metrics</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Monthly Likes</Label>
                        <Input
                          type="number"
                          value={editingStats[stat.platform]?.additional_metrics?.likes || 0}
                          onChange={(e) => updateMetricValue(stat.platform, 'likes', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Monthly Comments</Label>
                        <Input
                          type="number"
                          value={editingStats[stat.platform]?.additional_metrics?.comments || 0}
                          onChange={(e) => updateMetricValue(stat.platform, 'comments', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Monthly Shares</Label>
                        <Input
                          type="number"
                          value={editingStats[stat.platform]?.additional_metrics?.shares || 0}
                          onChange={(e) => updateMetricValue(stat.platform, 'shares', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Monthly Saves</Label>
                        <Input
                          type="number"
                          value={editingStats[stat.platform]?.additional_metrics?.saves || 0}
                          onChange={(e) => updateMetricValue(stat.platform, 'saves', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {stat.platform === 'tiktok' && (
                  <div className="space-y-4 p-3 bg-muted/30 rounded-lg">
                    <Label className="text-sm font-medium">TikTok Metrics</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Monthly Likes</Label>
                        <Input
                          type="number"
                          value={editingStats[stat.platform]?.additional_metrics?.likes || 0}
                          onChange={(e) => updateMetricValue(stat.platform, 'likes', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Monthly Comments</Label>
                        <Input
                          type="number"
                          value={editingStats[stat.platform]?.additional_metrics?.comments || 0}
                          onChange={(e) => updateMetricValue(stat.platform, 'comments', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Monthly Shares</Label>
                        <Input
                          type="number"
                          value={editingStats[stat.platform]?.additional_metrics?.shares || 0}
                          onChange={(e) => updateMetricValue(stat.platform, 'shares', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Engagement Rate (Auto-calculated)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={calculateEngagementRate(stat.platform)}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Calculated from total engagements ÷ followers × 100
                  </p>
                </div>
                
                <Button 
                  onClick={() => updatePlatformStats(stat.platform)}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats Overview */}
        <Card className="mt-8 shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Current Statistics Overview</CardTitle>
            <CardDescription>Your latest platform numbers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.platform} className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getPlatformIcon(stat.platform)}
                    <Badge variant="secondary" className="capitalize">
                      {stat.platform}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{stat.follower_count.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                    <p className="text-lg font-semibold">{stat.monthly_views.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Monthly Views</p>
                    <p className="text-lg font-semibold">{stat.engagement_rate}%</p>
                    <p className="text-sm text-muted-foreground">Engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;