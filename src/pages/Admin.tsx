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
import { Settings, LogOut, Save, ArrowLeft, Instagram, Youtube, Video, RotateCcw } from 'lucide-react';
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

interface AudienceData {
  gender?: { men: number; women: number };
  age_groups?: Array<{ range: string; percentage: number }>;
  countries?: Array<{ country: string; percentage: number }>;
  cities?: string[];
}

const Admin = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<PlatformStats[]>([]);
  const [editingStats, setEditingStats] = useState<{ [key: string]: PlatformStats }>({});
  const [audienceData, setAudienceData] = useState<AudienceData>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchAudienceData();
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

  const fetchAudienceData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('platform_audience')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'instagram')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setAudienceData({
          gender: data.gender as { men: number; women: number },
          age_groups: data.age_groups as Array<{ range: string; percentage: number }>,
          countries: data.countries as Array<{ country: string; percentage: number }>,
          cities: data.cities as string[]
        });
      }
    } catch (error) {
      console.error('Error fetching audience data:', error);
    }
  };

  const updateAudienceValue = (field: string, value: any) => {
    setAudienceData(prev => ({ ...prev, [field]: value }));
  };

  const updateAgeGroup = (index: number, percentage: number) => {
    const newAgeGroups = [...(audienceData.age_groups || [])];
    newAgeGroups[index] = { ...newAgeGroups[index], percentage };
    setAudienceData(prev => ({ ...prev, age_groups: newAgeGroups }));
  };

  const updateCountry = (index: number, field: 'country' | 'percentage', value: string | number) => {
    const newCountries = [...(audienceData.countries || [])];
    newCountries[index] = { ...newCountries[index], [field]: value };
    setAudienceData(prev => ({ ...prev, countries: newCountries }));
  };

  const updateCity = (index: number, value: string) => {
    const newCities = [...(audienceData.cities || [])];
    newCities[index] = value;
    setAudienceData(prev => ({ ...prev, cities: newCities }));
  };

  const saveAudienceData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('platform_audience')
        .upsert({
          user_id: user.id,
          platform: 'instagram',
          gender: audienceData.gender || { men: 88, women: 12 },
          age_groups: audienceData.age_groups || [
            { range: "25-34", percentage: 31 },
            { range: "18-24", percentage: 22 },
            { range: "35-44", percentage: 21 },
            { range: "45-54", percentage: 16 }
          ],
          countries: audienceData.countries || [
            { country: "Australia", percentage: 51 },
            { country: "USA", percentage: 10 },
            { country: "Japan", percentage: 6 },
            { country: "Brazil", percentage: 5 }
          ],
          cities: audienceData.cities || ["Sydney", "Gold Coast", "Melbourne", "Sunshine Coast"]
        }, { onConflict: 'user_id,platform' });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Instagram audience demographics updated successfully"
      });
    } catch (error) {
      console.error('Error saving audience data:', error);
      toast({
        title: "Error",
        description: "Failed to save audience demographics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
        return <Instagram className="h-5 w-5" />;
      case 'youtube':
        return <Youtube className="h-5 w-5" />;
      case 'tiktok':
        return <Video className="h-5 w-5" />;
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
  
  const instagramStat = stats.find((s) => s.platform === 'instagram');
  const youtubeStat = stats.find((s) => s.platform === 'youtube');
  const tiktokStat = stats.find((s) => s.platform === 'tiktok');

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

        {/* Instagram: Metrics + Demographics side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Instagram Metrics Card */}
          {instagramStat && (
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <div className={`p-2 rounded-lg ${getPlatformColor('instagram')} text-white`}>
                    {getPlatformIcon('instagram')}
                  </div>
                  Instagram Metrics
                </CardTitle>
                <CardDescription>
                  Update your Instagram statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Followers</Label>
                  <Input
                    type="number"
                    value={editingStats['instagram']?.follower_count || 0}
                    onChange={(e) => updateEditingValue('instagram', 'follower_count', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Video Views (Monthly)</Label>
                  <Input
                    type="number"
                    value={editingStats['instagram']?.monthly_views || 0}
                    onChange={(e) => updateEditingValue('instagram', 'monthly_views', e.target.value)}
                  />
                </div>

                <div className="space-y-4 p-3 bg-muted/30 rounded-lg">
                  <Label className="text-sm font-medium">Instagram Metrics</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Monthly Likes</Label>
                      <Input
                        type="number"
                        value={editingStats['instagram']?.additional_metrics?.likes || 0}
                        onChange={(e) => updateMetricValue('instagram', 'likes', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Monthly Comments</Label>
                      <Input
                        type="number"
                        value={editingStats['instagram']?.additional_metrics?.comments || 0}
                        onChange={(e) => updateMetricValue('instagram', 'comments', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Monthly Shares</Label>
                      <Input
                        type="number"
                        value={editingStats['instagram']?.additional_metrics?.shares || 0}
                        onChange={(e) => updateMetricValue('instagram', 'shares', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Monthly Saves</Label>
                      <Input
                        type="number"
                        value={editingStats['instagram']?.additional_metrics?.saves || 0}
                        onChange={(e) => updateMetricValue('instagram', 'saves', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Engagement Rate (Auto-calculated)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={calculateEngagementRate('instagram')}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Calculated from total engagements ÷ followers × 100
                  </p>
                </div>

                <Button 
                  onClick={() => updatePlatformStats('instagram')}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Instagram Audience Demographics */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-pink-500 text-white">
                  <Instagram className="h-5 w-5" />
                </div>
                Instagram Demographics
              </CardTitle>
              <CardDescription>
                Manage your Instagram audience insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender Split */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Gender Split</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Men (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={audienceData?.gender?.men || 88}
                      onChange={(e) => updateAudienceValue('gender', { ...audienceData?.gender, men: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Women (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={audienceData?.gender?.women || 12}
                      onChange={(e) => updateAudienceValue('gender', { ...audienceData?.gender, women: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* Age Groups */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Age Groups</Label>
                <div className="grid grid-cols-2 gap-4">
                  {(audienceData?.age_groups || [
                    { range: "18-24", percentage: 22 },
                    { range: "25-34", percentage: 31 },
                    { range: "35-44", percentage: 21 },
                    { range: "45-54", percentage: 16 }
                  ]).map((age, index) => (
                    <div key={age.range}>
                      <Label className="text-sm">{age.range} (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={age.percentage}
                        onChange={(e) => updateAgeGroup(index, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Countries */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Top Countries</Label>
                <div className="grid grid-cols-1 gap-3">
                  {(audienceData?.countries || [
                    { country: "Australia", percentage: 51 },
                    { country: "USA", percentage: 10 },
                    { country: "Japan", percentage: 6 },
                    { country: "Brazil", percentage: 5 }
                  ]).map((country, index) => (
                    <div key={country.country} className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm">Country {index + 1}</Label>
                        <Input
                          type="text"
                          value={country.country}
                          onChange={(e) => updateCountry(index, 'country', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Percentage (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={country.percentage}
                          onChange={(e) => updateCountry(index, 'percentage', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Cities */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Top Cities</Label>
                <div className="grid grid-cols-2 gap-4">
                  {(audienceData?.cities || ["Sydney", "Gold Coast", "Melbourne", "Sunshine Coast"]).map((city, index) => (
                    <div key={index}>
                      <Label className="text-sm">City {index + 1}</Label>
                      <Input
                        type="text"
                        value={city}
                        onChange={(e) => updateCity(index, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={saveAudienceData}
                disabled={loading}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving Demographics...' : 'Save Demographics'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* YouTube and TikTok below */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {youtubeStat && (
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <div className={`p-2 rounded-lg ${getPlatformColor('youtube')} text-white`}>
                    {getPlatformIcon('youtube')}
                  </div>
                  YouTube Metrics
                </CardTitle>
                <CardDescription>
                  Manual update recommended - dashboard shows live ViewStats data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subscribers</Label>
                  <Input
                    type="number"
                    value={editingStats['youtube']?.follower_count || 0}
                    onChange={(e) => updateEditingValue('youtube', 'follower_count', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Views</Label>
                  <Input
                    type="number"
                    value={editingStats['youtube']?.monthly_views || 0}
                    onChange={(e) => updateEditingValue('youtube', 'monthly_views', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Engagement Rate (Auto-calculated)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={calculateEngagementRate('youtube')}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    YouTube engagement = comments + likes ÷ subscribers × 100
                  </p>
                </div>

                <Button 
                  onClick={() => updatePlatformStats('youtube')}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {tiktokStat && (
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <div className={`p-2 rounded-lg ${getPlatformColor('tiktok')} text-white`}>
                    {getPlatformIcon('tiktok')}
                  </div>
                  TikTok Metrics
                </CardTitle>
                <CardDescription>Update your TikTok statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Followers</Label>
                  <Input
                    type="number"
                    value={editingStats['tiktok']?.follower_count || 0}
                    onChange={(e) => updateEditingValue('tiktok', 'follower_count', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Video Views (Monthly)</Label>
                  <Input
                    type="number"
                    value={editingStats['tiktok']?.monthly_views || 0}
                    onChange={(e) => updateEditingValue('tiktok', 'monthly_views', e.target.value)}
                  />
                </div>

                <div className="space-y-4 p-3 bg-muted/30 rounded-lg">
                  <Label className="text-sm font-medium">TikTok Metrics</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Monthly Likes</Label>
                      <Input
                        type="number"
                        value={editingStats['tiktok']?.additional_metrics?.likes || 0}
                        onChange={(e) => updateMetricValue('tiktok', 'likes', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Monthly Comments</Label>
                      <Input
                        type="number"
                        value={editingStats['tiktok']?.additional_metrics?.comments || 0}
                        onChange={(e) => updateMetricValue('tiktok', 'comments', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Monthly Shares</Label>
                      <Input
                        type="number"
                        value={editingStats['tiktok']?.additional_metrics?.shares || 0}
                        onChange={(e) => updateMetricValue('tiktok', 'shares', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Engagement Rate (Auto-calculated)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={calculateEngagementRate('tiktok')}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Calculated from total engagements ÷ followers × 100
                  </p>
                </div>

                <Button 
                  onClick={() => updatePlatformStats('tiktok')}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}
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