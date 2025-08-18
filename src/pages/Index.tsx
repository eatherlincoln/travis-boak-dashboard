import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { PlatformCard } from "@/components/PlatformCard";
import { AudienceChart } from "@/components/AudienceChart";
import { Badge } from "@/components/ui/badge";
import { Youtube, Instagram, Music, Users, Eye, TrendingUp, Play, Heart, Share, MessageCircle } from "lucide-react";
import heroImage from "/lovable-uploads/350aac33-19a1-4c3e-bac9-1e7258ac89b7.png";

const Index = () => {
  // Total reach calculation
  const totalFollowers = 38700 + 8800 + 1410; // Instagram + YouTube + TikTok
  const totalViews = 847000 + 228000 + 729656; // YouTube 12-month + TikTok 12-month + Instagram 90-day

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
                {(totalViews / 1000000).toFixed(1)}M+ Total Views
              </Badge>
              <Badge variant="secondary" className="text-base px-4 py-2">
                3 Active Platforms
              </Badge>
            </div>
            
            {/* Social Media Icons and Followers */}
            <div className="flex gap-6 items-center">
              <div className="flex items-center gap-2 text-primary-foreground/90">
                <Instagram className="h-5 w-5 text-white" />
                <span className="text-sm font-medium">38.7K</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/90">
                <Youtube className="h-5 w-5 text-white" />
                <span className="text-sm font-medium">8.8K</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/90">
                <Music className="h-5 w-5 text-white" />
                <span className="text-sm font-medium">1.4K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Reach"
            value={`${totalFollowers.toLocaleString()}`}
            subtitle="Cross-platform followers"
            icon={<Users className="h-6 w-6" />}
          />
          <MetricCard
            title="Monthly Views"
            value="1.8M+"
            subtitle="Combined platforms"
            icon={<Eye className="h-6 w-6" />}
            trend={{ value: "47.5%", isPositive: true }}
          />
          <MetricCard
            title="Engagement Rate"
            value="8.2%"
            subtitle="Above industry average"
            icon={<Heart className="h-6 w-6" />}
          />
          <MetricCard
            title="Revenue Potential"
            value="$5.4K+"
            subtitle="YouTube 12-month"
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ value: "58%", isPositive: true }}
          />
        </div>

        {/* Platform-specific cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Instagram */}
          <PlatformCard
            platform="Instagram"
            handle="@sheldonsimkus"
            followers="38.7K"
            icon={<Instagram className="h-6 w-6 text-pink-500" />}
            accentColor="pink-500"
            metrics={[
              { label: "30-Day Views", value: "233K" },
              { label: "90-Day Views", value: "730K" },
              { label: "Stories Engagement", value: "67%" },
              { label: "Primary Audience", value: "AU (51%)" }
            ]}
            highlights={[
              "Strongest platform with 38.7K engaged followers",
              "High story engagement (67% of total)",
              "Strong Australian surf community presence"
            ]}
          />

          {/* YouTube */}
          <PlatformCard
            platform="YouTube"
            handle="@sheldonsimkus"
            followers="8.8K"
            icon={<Youtube className="h-6 w-6 text-red-500" />}
            accentColor="red-500"
            metrics={[
              { label: "Monthly Views", value: "86.8K", trend: "47.5%" },
              { label: "Monthly Subs", value: "+190", trend: "58%" },
              { label: "Avg Watch Time", value: "3.2 min" },
              { label: "Avg Likes/Video", value: "1.2K" }
            ]}
            highlights={[
              "POV surf content performing exceptionally well",
              "116K views on 'POV Snapper Rocks' video",
              "Consistent 40-50K views on surf edits"
            ]}
          />

          {/* TikTok */}
          <PlatformCard
            platform="TikTok"
            handle="@sheldonsimkus"
            followers="1.4K"
            icon={<Music className="h-6 w-6 text-black" />}
            accentColor="black"
            metrics={[
              { label: "28-Day Views", value: "37K" },
              { label: "12-Month Views", value: "228K" },
              { label: "Total Likes", value: "31K" },
              { label: "For You %", value: "87.6%" }
            ]}
            highlights={[
              "Strong 'For You' page discovery",
              "Growing engagement with 1,653 shares",
              "Emerging platform with growth potential"
            ]}
          />
        </div>

        {/* Audience Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AudienceChart data={audienceData} />
          
          {/* Top Content Performance */}
          <Card className="shadow-card border-border/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Top Performing Content
              </h3>
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">POV Snapper Rocks – First Swell</h4>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>YouTube</span>
                    <span>116K views</span>
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">POV Best of Snapper Rocks</h4>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>YouTube</span>
                    <span>54K views</span>
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Cyclone Alfred at Double Island</h4>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>YouTube</span>
                    <span>54K views</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary">
                  <strong>Content Strategy:</strong> POV surf videos consistently perform 40-50K+ views, 
                  showing strong audience preference for immersive surf content.
                </p>
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