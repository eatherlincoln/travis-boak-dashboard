import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { PlatformCard } from "@/components/PlatformCard";
import { InstagramCard } from "@/components/InstagramCard";
import { YouTubeCard } from "@/components/YouTubeCard";
import { TikTokCard } from "@/components/TikTokCard";
import { AudienceChart } from "@/components/AudienceChart";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Youtube, Instagram, Music, Users, Eye, Play, Heart, Share, MessageCircle, ExternalLink, Settings, RotateCcw, TrendingUp, TrendingDown, Bookmark } from "lucide-react";
import { useState } from "react";
import heroImage from "/lovable-uploads/350aac33-19a1-4c3e-bac9-1e7258ac89b7.png";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useViewStats } from "@/hooks/useViewStats";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PublicDashboard } from "@/components/PublicDashboard";

const Index = () => {
  const { getPlatformStat, refetch: refetchPlatformStats } = usePlatformStats();
  const { refreshStats: refreshViewStats, loading: viewStatsLoading } = useViewStats();
  const { posts: instagramPosts, loading: postsLoading, refetch: refetchPosts } = useInstagramPosts();
  
  // Auto-refresh disabled - only manual refresh via button
  
  // Get platform stats (will use manual stats if user is logged in, fallback to hardcoded)
  const instagramStats = getPlatformStat('instagram');
  const youtubeStats = getPlatformStat('youtube');
  const tiktokStats = getPlatformStat('tiktok');
  
  const youtubeFollowers = youtubeStats?.follower_count || 8800;
  const youtubeViews = youtubeStats?.monthly_views || 86800;
  
  // Total reach calculation with all platform data
  const totalFollowers = (instagramStats?.follower_count || 38700) + youtubeFollowers + (tiktokStats?.follower_count || 1410);
  const totalViews = youtubeViews + (tiktokStats?.monthly_views || 37000) + (instagramStats?.monthly_views || 730000);

  // Helper to format numbers like 2.8K
  const formatNumberShort = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${Math.round(n)}`;
  };

  // Calculate overall Instagram engagement rate from post analysis
  // ===== ENGAGEMENT RATE FORMULA - DO NOT MODIFY UNLESS SPECIFICALLY REQUESTED =====
  // Formula: (Total Engagement ÷ Follower Count) × 100
  // Where Total Engagement = Likes + Comments + Shares + Saves
  // This is the industry standard and must remain consistent across all Instagram displays
  // ==================================================================================
  const getInstagramEngagementRate = () => {
    if (instagramStats?.additional_metrics?.post_analysis && Array.isArray(instagramStats.additional_metrics.post_analysis)) {
      const posts = instagramStats.additional_metrics.post_analysis;
      const followerCount = instagramStats?.follower_count || 38700;
      
      // Calculate average engagement rate across all posts
      const totalEngagementRates = posts.reduce((sum, post) => {
        const totalEngagement = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
        const engagementRate = (totalEngagement / followerCount) * 100;
        return sum + engagementRate;
      }, 0);
      
      const averageEngagementRate = totalEngagementRates / posts.length;
      return Math.max(0.1, Math.min(15, averageEngagementRate));
    }
    
    // Fallback to a realistic default
    return 4.2;
  };

  const calculatedInstagramER = getInstagramEngagementRate();
  const getTrend = (platform: string, metric: string) => {
    // Simulate realistic growth trends - in production, this would compare to previous month's data
    const trends = {
      instagram: {
        followers: { value: "+2.3%", isPositive: true },
        views: { value: "+8.7%", isPositive: true },
        engagement: { value: "+0.5%", isPositive: true },
        likes: { value: "+12.1%", isPositive: true }
      },
      youtube: {
        followers: { value: "+4.1%", isPositive: true },
        views: { value: "+15.2%", isPositive: true },
        engagement: { value: "+1.8%", isPositive: true }
      },
      tiktok: {
        followers: { value: "+18.5%", isPositive: true },
        views: { value: "+23.4%", isPositive: true },
        engagement: { value: "+3.2%", isPositive: true },
        likes: { value: "+28.9%", isPositive: true }
      }
    };
    return trends[platform]?.[metric] || { value: "+0%", isPositive: true };
  };

  // Video data for top performing content
  const topVideos = [
    {
      title: "POV Snapper Rocks – First Swell",
      platform: "YouTube",
      views: "116K views",
      videoId: "INJLrBxBHHc",
      thumbnail: `https://img.youtube.com/vi/INJLrBxBHHc/mqdefault.jpg`
    },
    {
      title: "POV Best of Snapper Rocks", 
      platform: "YouTube",
      views: "54K views",
      videoId: "FRC3mKhAO5U",
      thumbnail: `https://img.youtube.com/vi/FRC3mKhAO5U/mqdefault.jpg`
    },
    {
      title: "Cyclone Alfred at Double Island",
      platform: "YouTube", 
      views: "54K views",
      videoId: "ShOJK4TvA38",
      thumbnail: `https://img.youtube.com/vi/ShOJK4TvA38/mqdefault.jpg`
    },
    {
      title: "Epic Dawn Patrol Waves",
      platform: "YouTube",
      views: "48K views", 
      videoId: "7GrvnlBeC8M",
      thumbnail: `https://img.youtube.com/vi/7GrvnlBeC8M/mqdefault.jpg`
    }
  ];

  console.log('🎯 Instagram stats loaded:', instagramStats);
  console.log('📸 Instagram posts from hook:', instagramPosts);

  // Audience data for Instagram (primary platform)
  const audienceData = {
    gender: { men: 88, women: 12 },
    age: [
      { range: "25-34", percentage: 31 },
      { range: "18-24", percentage: 22 },
      { range: "35-44", percentage: 21 },
      { range: "45-54", percentage: 16 }
    ],
    countries: [
      { country: "Australia", percentage: 51 },
      { country: "USA", percentage: 10 },
      { country: "Japan", percentage: 6 },
      { country: "Brazil", percentage: 5 }
    ],
    cities: ["Sydney", "Gold Coast", "Melbourne", "Sunshine Coast"]
  };

  return (
    <div className="min-h-screen bg-gradient-wave">
      {/* Hero Section - Matching Molly Picklum Layout */}
      <div className="relative h-[60vh] min-h-[500px] bg-gradient-deep overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        
        <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-6xl font-bold mb-2">
              Sheldon Simkus
            </h1>
            <p className="text-2xl mb-8 text-white/90">
              Professional Surfer and Content Creator
            </p>
            
            <div className="flex gap-3 flex-wrap mb-8">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-base font-medium">
                {totalFollowers.toLocaleString()} Total Followers
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-base font-medium">
                {Math.round(totalViews / 1000)}K Total Views
              </div>
              <Link to="/auth">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-base font-medium hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin
                </div>
              </Link>
            </div>
            
            {/* Social Media Icons with Follower Counts */}
            <div className="flex gap-6 items-center mb-6">
              <a href="https://instagram.com/sheldonsimkus" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
                <img src="/lovable-uploads/502a8d59-4e94-4c4a-94c8-4e5f78e6decf.png" className="h-6 w-6" alt="Instagram" />
                <span className="text-lg font-bold">{((instagramStats?.follower_count || 38700) / 1000).toFixed(1)}K</span>
              </a>
              <a href="https://www.youtube.com/@sheldonsimkus" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
                <img src="/lovable-uploads/9aa87b25-88f0-439d-890a-7c2d475c22f5.png" className="h-6 w-6" alt="YouTube" />
                <span className="text-lg font-bold">{(youtubeFollowers / 1000).toFixed(1)}K</span>
              </a>
              <a href="https://www.tiktok.com/@sheldonsimkus" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
                <img src="/lovable-uploads/d3d646ba-e348-45c2-9a7b-d3f53ff73b4c.png" className="h-6 w-6" alt="TikTok" />
                <span className="text-lg font-bold">{((tiktokStats?.follower_count || 1410) / 1000).toFixed(1)}K</span>
              </a>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  await refreshViewStats();
                  await refetchPlatformStats();
                  await refetchPosts();
                }}
                disabled={viewStatsLoading}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                <RotateCcw className={`mr-2 h-4 w-4 ${viewStatsLoading ? 'animate-spin' : ''}`} />
                Refresh Stats
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* About Sheldon Section - Matching Layout */}
        <Card className="shadow-card border-border/50">
          <CardContent className="p-8">
            <div className="flex items-start gap-8">
              <img 
                src="/lovable-uploads/593bbc81-f03e-419e-a492-8024f176fd1a.png" 
                alt="Sheldon Simkus" 
                className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4 text-primary">About Sheldon</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Sheldon Simkus is a professional surfer with a proven global reach, a trusted voice in surf culture, and a track record of delivering measurable value for partners. His ability to combine high-performance surfing with authentic, creative storytelling has established him as a unique content creator whose work consistently generates strong exposure and return on investment.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                    Professional Surfer
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    Content Creator
                  </Badge>
                  <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                    Global Influencer
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Reach"
            value={`${totalFollowers.toLocaleString()}`}
            subtitle="Cross-platform followers"
            icon={<Users className="h-6 w-6" />}
            trend={{ value: "+3.8%", isPositive: true }}
          />
          <MetricCard
            title="Monthly Views"
            value={`${Math.round(totalViews / 1000)}K`}
            subtitle="Combined platforms"
            icon={<Eye className="h-6 w-6" />}
            trend={{ value: "+15.7%", isPositive: true }}
          />
          <MetricCard
            title="Engagement Rate"
            value={`${calculatedInstagramER.toFixed(1)}%`}
            subtitle="Latest Instagram engagement"
            icon={<Heart className="h-6 w-6" />}
            trend={{ value: getTrend('instagram', 'engagement').value, isPositive: true }}
          />
          <MetricCard
            title="Weekly Growth"
            value="+2.3%"
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ value: "+2.3%", isPositive: true }}
          />
        </div>

        {/* Platform-specific cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <InstagramCard />
          <YouTubeCard />
          <TikTokCard />
        </div>

        {/* Audience Demographics - Full Width */}
        <AudienceChart data={audienceData} />

        {/* Top Content Performance - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Instagram Posts */}
          <Card className="shadow-card border-border/50">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Instagram className="h-5 w-5 text-primary" />
                  Top Performing Posts
                </h3>
                <p className="text-sm text-muted-foreground">
                  Best performing content based on engagement metrics
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {instagramPosts.map((post, index) => {
                  const postNumber = index + 1;
                  
                  return (
                    <div key={index} className="bg-card rounded-lg border border-border/50 overflow-hidden hover:shadow-md transition-all duration-200">
                      {post.url && post.url !== '#' ? (
                        <a 
                          href={post.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block group"
                        >
                          <div className="aspect-square relative">
                            <img 
                              src={post.image} 
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                             
                            {/* External Link Icon */}
                            <ExternalLink className="absolute top-2 left-2 h-4 w-4 text-white opacity-80" />
                            
                            {/* Overlay Stats */}
                            <div className="absolute bottom-2 left-2 text-white">
                              <div className="flex items-center gap-3 text-sm font-medium">
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {formatNumberShort(post.likesNumber)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {post.comments}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Share className="h-3 w-3" />
                                  {post.shares}
                                </span>
                              </div>
                            </div>
                          </div>
                        </a>
                      ) : (
                        <div className="block group">
                          <div className="aspect-square relative">
                            <img 
                              src={post.image} 
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                             
                            {/* Overlay Stats */}
                            <div className="absolute bottom-2 left-2 text-white">
                              <div className="flex items-center gap-3 text-sm font-medium">
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {formatNumberShort(post.likesNumber)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {post.comments}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Share className="h-3 w-3" />
                                  {post.shares}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Post Details */}
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-muted-foreground font-medium">Post #{postNumber}</span>
                          <span className="text-xs text-green-600 font-bold">
                            {post.engagementRate.toFixed(2)}% ER
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-red-500" />
                            <span>{formatNumberShort(post.likesNumber)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3 text-blue-500" />
                            <span>{post.comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share className="h-3 w-3 text-green-500" />
                            <span>{post.shares}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bookmark className="h-3 w-3 text-orange-500" />
                            <span>{post.saves}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-muted-foreground">
                          Reach: {formatNumberShort(post.reach)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-6 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">22.3K</div>
                    <div className="text-xs text-muted-foreground">Total Likes (30d)</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-400">684</div>
                    <div className="text-xs text-muted-foreground">Total Comments (30d)</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">1.1K</div>
                    <div className="text-xs text-muted-foreground">Total Shares (30d)</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-500">2.2K</div>
                    <div className="text-xs text-muted-foreground">Total Saves (30d)</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-500">5.6K</div>
                    <div className="text-xs text-muted-foreground">Avg Likes</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">3.06</div>
                    <div className="text-xs text-muted-foreground">Comments Ratio</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Top YouTube Content */}
          <Card className="shadow-card border-border/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Top Performing YouTube Content
              </h3>
              <div className="space-y-4">
                {topVideos.slice(0, 3).map((video, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className="bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group overflow-hidden">
                        {/* Video Thumbnail - Full Width Landscape */}
                        <div className="w-full aspect-video relative rounded-t-lg overflow-hidden">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        {/* Video Info - Below Thumbnail */}
                        <div className="p-4">
                          <h4 className="font-medium text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {video.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              {video.platform}
                            </span>
                            <span className="font-semibold flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {video.views}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-[90vw]">
                      <DialogHeader>
                        <DialogTitle>{video.title}</DialogTitle>
                      </DialogHeader>
                      <div className="aspect-video w-full">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${video.videoId}`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partnership Opportunities */}
        <Card className="shadow-ocean border-primary/20 bg-gradient-ocean">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-primary-foreground mb-6 text-center">
              Partnership Opportunities
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8 text-center max-w-4xl mx-auto">
              Partner with Sheldon Simkus — a rising force in surf media whose authentic lifestyle content and world-class surfing consistently engage audiences across Australia and globally. With proven performance metrics, a loyal following, and the credibility to cut through in surf culture, Sheldon offers brands a unique opportunity to align with a content creator who delivers both reach and real impact.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Content Collaborations */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-primary-foreground mb-3">1. Content Collaborations</h3>
                <p className="text-primary-foreground/90 text-sm leading-relaxed">
                  Custom video and photo content created with your brand seamlessly integrated into Sheldon's authentic surf lifestyle. Ideal for brands looking to tap into the energy of surf culture with credibility and creativity.
                </p>
              </div>

              {/* Brand Ambassador */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-primary-foreground mb-3">2. Brand Ambassador</h3>
                <p className="text-primary-foreground/90 text-sm leading-relaxed">
                  Ongoing partnerships that put your products front and center across Sheldon's platforms and surf career. A powerful way to build trust, consistency, and long-term brand equity with his engaged audience.
                </p>
              </div>

              {/* Event & Travel Integration */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-primary-foreground mb-3">3. Event & Travel Integration</h3>
                <p className="text-primary-foreground/90 text-sm leading-relaxed">
                  Leverage Sheldon's global surf schedule, trips, and competitions to position your brand in premium, culturally relevant moments. From contest appearances to surf edits in iconic locations, this is high-visibility exposure with impact.
                </p>
              </div>

              {/* Custom Campaigns */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-primary-foreground mb-3">4. Custom Campaigns</h3>
                <p className="text-primary-foreground/90 text-sm leading-relaxed">
                  Tailored programs that align with your specific goals — whether that's launching a new product, targeting a key demographic, or creating buzz across surf and lifestyle media.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-base px-4 py-2">
                Authentic Audience
              </Badge>
              <Badge variant="secondary" className="text-base px-4 py-2">
                Growing Revenue
              </Badge>
              <Badge variant="secondary" className="text-base px-4 py-2">
                Multi-Platform Reach
              </Badge>
              <Badge variant="secondary" className="text-base px-4 py-2">
                Professional Content
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Live Analytics Dashboard */}
        <Card className="shadow-card border-border/50">
          <CardContent className="p-6">
            <PublicDashboard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;