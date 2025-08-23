import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { PlatformCard } from "@/components/PlatformCard";
import { AudienceChart } from "@/components/AudienceChart";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Youtube, Instagram, Music, Users, Eye, Play, Heart, Share, MessageCircle, ExternalLink, Settings, RotateCcw, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import heroImage from "/lovable-uploads/350aac33-19a1-4c3e-bac9-1e7258ac89b7.png";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useViewStats } from "@/hooks/useViewStats";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { getPlatformStat, refetch: refetchPlatformStats } = usePlatformStats();
  const { refreshStats: refreshViewStats, loading: viewStatsLoading } = useViewStats();
  
  // Get platform stats (will use manual stats if user is logged in, fallback to hardcoded)
  const instagramStats = getPlatformStat('instagram');
  const youtubeStats = getPlatformStat('youtube');
  const tiktokStats = getPlatformStat('tiktok');
  
  const youtubeFollowers = youtubeStats?.follower_count || 8800;
  const youtubeViews = youtubeStats?.monthly_views || 86800;
  
  // Total reach calculation with all platform data
  const totalFollowers = (instagramStats?.follower_count || 38700) + youtubeFollowers + (tiktokStats?.follower_count || 1410);
  const totalViews = youtubeViews + (tiktokStats?.monthly_views || 37000) + (instagramStats?.monthly_views || 730000);

  // Helper function to generate trend indicators (simulated based on typical growth patterns)
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

  // Instagram posts data for top performing content
  const topInstagramPosts = [
    {
      title: "Perfect barrel at Snapper Rocks",
      platform: "Instagram",
      likes: "2.8K likes",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=500&fit=crop&crop=center",
      engagement: "8.2%"
    },
    {
      title: "Dawn patrol magic hours",
      platform: "Instagram", 
      likes: "2.1K likes",
      image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=500&h=500&fit=crop&crop=center",
      engagement: "7.8%"
    },
    {
      title: "Behind the scenes setup",
      platform: "Instagram",
      likes: "1.9K likes", 
      image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500&h=500&fit=crop&crop=center",
      engagement: "9.1%"
    },
    {
      title: "Post-session recovery",
      platform: "Instagram",
      likes: "1.6K likes",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=center", 
      engagement: "7.5%"
    }
  ];

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
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-deep overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-primary-foreground mb-4">
              Sheldon Simkus
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-6">
              Professional Surfer & Content Creator
            </p>
            <div className="flex gap-4 flex-wrap mb-6">
              <Badge variant="secondary" className="text-base px-4 py-2">
                {totalFollowers.toLocaleString()} Total Followers
              </Badge>
              <Badge variant="secondary" className="text-base px-4 py-2">
                {Math.round(totalViews / 1000)}K Total Views
              </Badge>
              <Badge variant="secondary" className="text-base px-4 py-2">
                3 Active Platforms
              </Badge>
            </div>
            
            {/* Social Media Icons and Followers */}
            <div className="flex gap-6 items-center">
              <a href="https://instagram.com/sheldonsimkus" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                <img src="/lovable-uploads/502a8d59-4e94-4c4a-94c8-4e5f78e6decf.png" className="h-5 w-5" alt="Instagram" />
                <span className="text-sm font-medium">{((instagramStats?.follower_count || 38700) / 1000).toFixed(1)}K</span>
              </a>
              <a href="https://www.youtube.com/@sheldonsimkus" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                <img src="/lovable-uploads/9aa87b25-88f0-439d-890a-7c2d475c22f5.png" className="h-5 w-5" alt="YouTube" />
                <span className="text-sm font-medium">{(youtubeFollowers / 1000).toFixed(1)}K</span>
              </a>
              <a href="https://www.tiktok.com/@sheldonsimkus" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                <img src="/lovable-uploads/d3d646ba-e348-45c2-9a7b-d3f53ff73b4c.png" className="h-5 w-5" alt="TikTok" />
                <span className="text-sm font-medium">{((tiktokStats?.follower_count || 1410) / 1000).toFixed(1)}K</span>
              </a>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="flex flex-col">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    await refreshViewStats();
                    await refetchPlatformStats();
                  }}
                  disabled={viewStatsLoading}
                >
                  <RotateCcw className={`mr-2 h-4 w-4 ${viewStatsLoading ? 'animate-spin' : ''}`} />
                  Refresh YouTube stats
                </Button>
                <p className="text-xs text-primary-foreground/90 mt-1">
                  Stats are refreshed at the start of each month
                </p>
              </div>
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Brand Introduction */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-8 items-center">
            {/* Text Content - 2/3 width (8 columns) */}
            <div className="col-span-8 space-y-4">
              <p className="text-base leading-relaxed text-foreground">
                Sheldon Simkus is a professional surfer with a proven global reach, a trusted voice in surf culture, and a track record of delivering measurable value for partners.
              </p>
              <p className="text-base leading-relaxed text-foreground">
                Sheldon's ability to combine high-performance surfing with authentic, creative storytelling has established him as a unique content creator whose work consistently generates strong exposure and return on investment. His attention to detail and credibility in the surfing world ensure that every collaboration feels genuine, resonates deeply with audiences, and elevates the brands he works with.
              </p>
              <p className="text-base leading-relaxed text-foreground">
                We invite you to join Sheldon in building meaningful partnerships that go beyond traditional sponsorships — driving real engagement, cultural relevance, and business growth.
              </p>
            </div>
            
            {/* Headshot - 1/3 width (4 columns) */}
            <div className="col-span-4">
              <div className="relative">
                <img 
                  src="/lovable-uploads/e66a9bc1-6ece-4033-bea3-123135a4d342.png" 
                  alt="Sheldon Simkus - Professional Surfer" 
                  className="w-full rounded-lg shadow-card object-cover aspect-[3/4]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            value="8.2%"
            subtitle="Above industry average"
            icon={<Heart className="h-6 w-6" />}
            trend={{ value: "+1.2%", isPositive: true }}
          />
        </div>

        {/* Platform-specific cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Instagram */}
          <PlatformCard
            platform="Instagram"
            handle="@sheldonsimkus"
            followers={`${((instagramStats?.follower_count || 38700) / 1000).toFixed(1)}K`}
            icon={<img src="/lovable-uploads/502a8d59-4e94-4c4a-94c8-4e5f78e6decf.png" className="h-6 w-6" alt="Instagram" />}
            accentColor="pink-500"
            metrics={[
              { label: "Video Views", value: `${Math.round((instagramStats?.monthly_views || 730000) / 1000)}K`, trend: getTrend('instagram', 'views').value },
              { label: "Monthly Likes", value: `${Math.round((instagramStats?.additional_metrics?.likes || 15000) / 1000)}K`, trend: getTrend('instagram', 'likes').value },
              { label: "Engagement Rate", value: `${instagramStats?.engagement_rate || 8.2}%`, trend: getTrend('instagram', 'engagement').value },
              { label: "Followers", value: `${((instagramStats?.follower_count || 38700) / 1000).toFixed(1)}K`, trend: getTrend('instagram', 'followers').value }
            ]}
            highlights={[
              `${instagramStats?.engagement_rate ? `${instagramStats.engagement_rate}%` : '8.2%'} engagement rate ${(instagramStats?.engagement_rate || 8.2) > 6 ? '(above industry avg)' : '(growing)'}`,
              `${Math.round(((instagramStats?.additional_metrics?.likes || 15000) + (instagramStats?.additional_metrics?.comments || 2000) + (instagramStats?.additional_metrics?.shares || 800)) / 1000)}K monthly interactions`,
              `${instagramStats?.follower_count ? `${((instagramStats.follower_count || 38700) / 1000).toFixed(1)}K` : '38.7K'} engaged followers with ${instagramStats?.additional_metrics?.saves ? `${Math.round(instagramStats.additional_metrics.saves / 1000)}K saves` : 'strong save rate'}`
            ]}
          />

          {/* YouTube */}
          <PlatformCard
            platform="YouTube"
            handle="@sheldonsimkus"
            followers={`${(youtubeFollowers / 1000).toFixed(1)}K`}
            icon={<img src="/lovable-uploads/9aa87b25-88f0-439d-890a-7c2d475c22f5.png" className="h-6 w-6" alt="YouTube" />}
            accentColor="red-500"
            metrics={[
              { label: "Monthly Views", value: `${Math.round((youtubeStats?.monthly_views || 86800) / 1000)}K`, trend: getTrend('youtube', 'views').value },
              { label: "Subscribers", value: `${(youtubeFollowers / 1000).toFixed(1)}K`, trend: getTrend('youtube', 'followers').value },
              { label: "Engagement Rate", value: `${youtubeStats?.engagement_rate || 6.5}%`, trend: getTrend('youtube', 'engagement').value },
              { label: "Avg Watch Time", value: "3.2 min", trend: "+8.3%" }
            ]}
            highlights={[
              `${youtubeFollowers.toLocaleString()} subscribers with consistent growth`,
              `${Math.round((youtubeStats?.monthly_views || 86800) / 1000)}K monthly views (updated from ViewStats)`,
              `POV surf content averaging ${Math.round((youtubeStats?.monthly_views || 86800) / 4 / 1000)}K+ views per video`
            ]}
          />

          {/* TikTok */}
          <PlatformCard
            platform="TikTok"
            handle="@sheldonsimkus"
            followers={`${((tiktokStats?.follower_count || 1410) / 1000).toFixed(1)}K`}
            icon={<img src="/lovable-uploads/d3d646ba-e348-45c2-9a7b-d3f53ff73b4c.png" className="h-6 w-6" alt="TikTok" />}
            accentColor="black"
            metrics={[
              { label: "Video Views", value: `${Math.round((tiktokStats?.monthly_views || 37000) / 1000)}K`, trend: getTrend('tiktok', 'views').value },
              { label: "Monthly Likes", value: `${Math.round((tiktokStats?.additional_metrics?.likes || 8000) / 1000)}K`, trend: getTrend('tiktok', 'likes').value },
              { label: "Engagement Rate", value: `${tiktokStats?.engagement_rate || 9.1}%`, trend: getTrend('tiktok', 'engagement').value },
              { label: "Followers", value: `${((tiktokStats?.follower_count || 1410) / 1000).toFixed(1)}K`, trend: getTrend('tiktok', 'followers').value }
            ]}
            highlights={[
              `${tiktokStats?.engagement_rate ? `${tiktokStats.engagement_rate}%` : '9.1%'} engagement rate ${(tiktokStats?.engagement_rate || 9.1) > 8 ? '(excellent performance)' : '(growing)'}`,
              `${Math.round(((tiktokStats?.additional_metrics?.likes || 8000) + (tiktokStats?.additional_metrics?.comments || 600) + (tiktokStats?.additional_metrics?.shares || 1200)) / 1000)}K monthly interactions`,
              `Growing platform with ${((tiktokStats?.follower_count || 1410) / 1000).toFixed(1)}K followers and high viral potential`
            ]}
          />
        </div>

        {/* Audience Demographics - Full Width */}
        <AudienceChart data={audienceData} />

        {/* Top Content Performance - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Instagram Posts */}
          <Card className="shadow-card border-border/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Instagram className="h-5 w-5 text-primary" />
                Top Performing Instagram Posts
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {topInstagramPosts.map((post, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group overflow-hidden">
                    <div className="aspect-square relative">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <Heart className="absolute top-2 right-2 h-4 w-4 text-white opacity-80" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{post.likes}</span>
                        <span>{post.engagement} ER</span>
                      </div>
                    </div>
                  </div>
                ))}
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
              <div className="grid grid-cols-2 gap-3">
                {topVideos.map((video, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className="bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group overflow-hidden">
                        <div className="aspect-square relative">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                            {video.title}
                          </h4>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{video.platform}</span>
                            <span>{video.views}</span>
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

        {/* Contact & Partnership Info */}
        <Card className="shadow-ocean border-primary/20 bg-gradient-ocean">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Partnership Opportunities
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-6 max-w-2xl mx-auto">
              Ready to collaborate with a growing surf content creator reaching engaged audiences 
              across Australia and globally. Strong performance metrics and authentic surf lifestyle content.
            </p>
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
      </div>
    </div>
  );
};

export default Index;