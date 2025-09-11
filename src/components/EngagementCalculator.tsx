import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, Instagram, Youtube, Video } from 'lucide-react';
import { useState } from 'react';
import { instagramEngagementRate, tiktokEngagementRate, youtubeEngagementRate, formatPct } from '@/utils/engagement';

interface EngagementData {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  totalViews: number;
}

export function EngagementCalculator() {
  const [instagramData, setInstagramData] = useState<EngagementData>({
    likes: 1000,
    comments: 150,
    shares: 0,
    saves: 50,
    reach: 10000,
    totalViews: 0
  });

  const [tiktokData, setTiktokData] = useState<EngagementData>({
    likes: 800,
    comments: 64,
    shares: 96,
    saves: 120,
    reach: 0,
    totalViews: 8000
  });

  const [youtubeData, setYoutubeData] = useState<EngagementData>({
    likes: 300,
    comments: 30,
    shares: 15,
    saves: 0,
    reach: 0,
    totalViews: 10000
  });

  const updateData = (platform: 'instagram' | 'tiktok' | 'youtube', field: keyof EngagementData, value: number) => {
    const setters = {
      instagram: setInstagramData,
      tiktok: setTiktokData,
      youtube: setYoutubeData
    };
    
    setters[platform](prev => ({ ...prev, [field]: value }));
  };

  const calculateRate = (platform: 'instagram' | 'tiktok' | 'youtube') => {
    const data = { instagram: instagramData, tiktok: tiktokData, youtube: youtubeData }[platform];
    
    switch (platform) {
      case 'instagram':
        return instagramEngagementRate({
          likes: data.likes,
          comments: data.comments,
          saves: data.saves,
          reach: data.reach
        });
      case 'tiktok':
        return tiktokEngagementRate({
          likes: data.likes,
          comments: data.comments,
          shares: data.shares,
          saves: data.saves,
          totalViews: data.totalViews
        });
      case 'youtube':
        return youtubeEngagementRate({
          likes: data.likes,
          comments: data.comments,
          shares: data.shares,
          totalViews: data.totalViews
        });
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Engagement Rate Calculator
        </CardTitle>
        <CardDescription>
          Calculate accurate engagement rates using platform-specific formulas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="instagram" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              TikTok
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              YouTube
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instagram" className="space-y-4 mt-6">
            <div className="text-center mb-4">
              <Badge variant="outline" className="text-pink-600 border-pink-200">
                Formula: (Likes + Comments + Saves) / Reach × 100
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Likes</Label>
                <Input
                  type="number"
                  value={instagramData.likes}
                  onChange={(e) => updateData('instagram', 'likes', Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Comments</Label>
                <Input
                  type="number"
                  value={instagramData.comments}
                  onChange={(e) => updateData('instagram', 'comments', Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Saves</Label>
                <Input
                  type="number"
                  value={instagramData.saves}
                  onChange={(e) => updateData('instagram', 'saves', Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Reach</Label>
                <Input
                  type="number"
                  value={instagramData.reach}
                  onChange={(e) => updateData('instagram', 'reach', Number(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="text-center p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">
                {formatPct(calculateRate('instagram'))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Instagram Engagement Rate
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tiktok" className="space-y-4 mt-6">
            <div className="text-center mb-4">
              <Badge variant="outline" className="text-black border-gray-200">
                Formula: (Likes + Comments + Shares + Saves) / Total Views × 100
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Likes</Label>
                <Input
                  type="number"
                  value={tiktokData.likes}
                  onChange={(e) => updateData('tiktok', 'likes', Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Comments</Label>
                <Input
                  type="number"
                  value={tiktokData.comments}
                  onChange={(e) => updateData('tiktok', 'comments', Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Shares</Label>
                <Input
                  type="number"
                  value={tiktokData.shares}
                  onChange={(e) => updateData('tiktok', 'shares', Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Saves</Label>
                <Input
                  type="number"
                  value={tiktokData.saves}
                  onChange={(e) => updateData('tiktok', 'saves', Number(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-2">
                <Label>Total Views</Label>
                <Input
                  type="number"
                  value={tiktokData.totalViews}
                  onChange={(e) => updateData('tiktok', 'totalViews', Number(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatPct(calculateRate('tiktok'))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                TikTok Engagement Rate
              </div>
            </div>
          </TabsContent>

          <TabsContent value="youtube" className="space-y-4 mt-6">
            <div className="text-center mb-4">
              <Badge variant="outline" className="text-red-600 border-red-200">
                Formula: (Likes + Comments + Shares) / Total Views × 100
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Likes</Label>
                <Input
                  type="number"
                  value={youtubeData.likes}
                  onChange={(e) => updateData('youtube', 'likes', Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Comments</Label>
                <Input
                  type="number"
                  value={youtubeData.comments}
                  onChange={(e) => updateData('youtube', 'comments', Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Shares</Label>
                <Input
                  type="number"
                  value={youtubeData.shares}
                  onChange={(e) => updateData('youtube', 'shares', Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Total Views</Label>
                <Input
                  type="number"
                  value={youtubeData.totalViews}
                  onChange={(e) => updateData('youtube', 'totalViews', Number(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatPct(calculateRate('youtube'))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                YouTube Engagement Rate
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}