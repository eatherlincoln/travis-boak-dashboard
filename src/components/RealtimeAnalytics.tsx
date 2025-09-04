import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, TrendingUp, Users, Eye, Heart } from 'lucide-react';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import { upsertAnalytics } from '@/api/upsertAnalytics';
import { useToast } from '@/hooks/use-toast';

interface RealtimeAnalyticsProps {
  className?: string;
}

const RealtimeAnalytics: React.FC<RealtimeAnalyticsProps> = ({ className }) => {
  const { data, loading, error, refetch, getMetricValue, getSourceMetrics, getLatestUpdate } = useRealtimeAnalytics();
  const { toast } = useToast();

  const handleTestUpdate = async (source: 'instagram' | 'tiktok' | 'youtube') => {
    try {
      // Generate some test data
      const metrics = [
        { metric: 'followers', value: Math.floor(Math.random() * 50000) + 10000 },
        { metric: 'monthly_views', value: Math.floor(Math.random() * 500000) + 50000 },
        { metric: 'engagement_rate', value: Math.floor(Math.random() * 10) + 1 },
      ];

      for (const { metric, value } of metrics) {
        await upsertAnalytics({ source, metric, value });
      }

      toast({
        title: "Analytics Updated",
        description: `Test data sent for ${source}. Watch the realtime updates!`,
      });
    } catch (error) {
      console.error('Error updating analytics:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update analytics data",
        variant: "destructive",
      });
    }
  };

  const formatValue = (value: number, metric: string): string => {
    if (metric === 'engagement_rate') {
      return `${value.toFixed(1)}%`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'followers': return <Users className="h-4 w-4" />;
      case 'monthly_views': return <Eye className="h-4 w-4" />;
      case 'engagement_rate': return <Heart className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const platforms = ['instagram', 'tiktok', 'youtube'] as const;

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Realtime Analytics
            <Badge variant="destructive">Error</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load analytics: {error}</p>
          <Button onClick={refetch} variant="outline" size="sm" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Realtime Analytics
            <Badge variant="secondary">Live</Badge>
          </div>
          <div className="flex gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        {getLatestUpdate() && (
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(getLatestUpdate()!).toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Platform Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platforms.map((platform) => {
              const metrics = getSourceMetrics(platform);
              
              return (
                <Card key={platform} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base capitalize flex items-center justify-between">
                      {platform}
                      <Button
                        onClick={() => handleTestUpdate(platform)}
                        variant="outline"
                        size="sm"
                      >
                        Test Update
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {metrics.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No data available</p>
                    ) : (
                      metrics.map((item) => (
                        <div key={item.metric} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getMetricIcon(item.metric)}
                            <span className="text-sm capitalize">
                              {item.metric.replace('_', ' ')}
                            </span>
                          </div>
                          <Badge variant="outline">
                            {formatValue(item.value, item.metric)}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Raw Data Table */}
          {data.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Raw Analytics Data ({data.length} records)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Source</th>
                      <th className="text-left p-2">Metric</th>
                      <th className="text-right p-2">Value</th>
                      <th className="text-left p-2">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 10).map((item, index) => (
                      <tr key={`${item.source}-${item.metric}`} className="border-b">
                        <td className="p-2 capitalize">{item.source}</td>
                        <td className="p-2">{item.metric.replace('_', ' ')}</td>
                        <td className="p-2 text-right font-mono">
                          {formatValue(item.value, item.metric)}
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {new Date(item.updated_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeAnalytics;