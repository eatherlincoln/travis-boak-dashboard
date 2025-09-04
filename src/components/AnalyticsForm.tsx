import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { upsertAnalytics, analyticsAPI } from '@/api/upsertAnalytics';
import { Loader2, Plus, TrendingUp } from 'lucide-react';

const AnalyticsForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram');
  const [metric, setMetric] = useState('');
  const [value, setValue] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metric || !value) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) {
      toast({
        title: "Invalid Value",
        description: "Value must be a positive number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await upsertAnalytics({
        source,
        metric: metric.toLowerCase().replace(/\s+/g, '_'),
        value: numericValue
      });

      toast({
        title: "Analytics Updated!",
        description: `Successfully updated ${source} ${metric}: ${numericValue.toLocaleString()}`
      });

      // Reset form
      setMetric('');
      setValue('');
      
    } catch (error) {
      console.error('Error updating analytics:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update analytics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUpdate = async (type: 'followers' | 'views' | 'engagement') => {
    if (!value) {
      toast({
        title: "Missing Value",
        description: "Please enter a value first",
        variant: "destructive"
      });
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) {
      toast({
        title: "Invalid Value", 
        description: "Value must be a positive number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      switch (type) {
        case 'followers':
          await analyticsAPI.updateFollowers(source, numericValue);
          break;
        case 'views':
          await analyticsAPI.updateViews(source, numericValue);
          break;
        case 'engagement':
          await analyticsAPI.updateEngagement(source, numericValue);
          break;
      }

      toast({
        title: "Quick Update Success!",
        description: `Updated ${source} ${type}: ${numericValue.toLocaleString()}`
      });

      setValue('');
      
    } catch (error) {
      console.error('Error in quick update:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update analytics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Add Analytics Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="source">Platform</Label>
            <Select value={source} onValueChange={(value) => setSource(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Value Input */}
          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              placeholder="Enter numeric value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickUpdate('followers')}
              disabled={loading || !value}
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Followers'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickUpdate('views')}
              disabled={loading || !value}
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Views'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickUpdate('engagement')}
              disabled={loading || !value}
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Engagement'}
            </Button>
          </div>

          {/* Custom Metric */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="metric">Custom Metric Name</Label>
              <Input
                id="metric"
                placeholder="e.g., story_views, saves, comments"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full mt-3"
              disabled={loading || !metric || !value}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom Metric
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AnalyticsForm;