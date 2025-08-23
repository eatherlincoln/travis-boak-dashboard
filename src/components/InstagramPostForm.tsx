import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PostMetrics {
  likes: number;
  comments: number;
  shares: number;
}

interface InstagramPost {
  url: string;
  metrics: PostMetrics;
  thumbnail?: File;
  thumbnailUrl?: string;
}

interface FormData {
  post1: InstagramPost;
  post2: InstagramPost;
  post3: InstagramPost;
  post4: InstagramPost;
}

const InstagramPostForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [thumbnailPreviews, setThumbnailPreviews] = useState<{ [key: string]: string }>({});

  const form = useForm<FormData>({
    defaultValues: {
      post1: { url: '', metrics: { likes: 0, comments: 0, shares: 0 } },
      post2: { url: '', metrics: { likes: 0, comments: 0, shares: 0 } },
      post3: { url: '', metrics: { likes: 0, comments: 0, shares: 0 } },
      post4: { url: '', metrics: { likes: 0, comments: 0, shares: 0 } },
    }
  });

  const handleImageUpload = async (file: File, postKey: string) => {
    if (!user) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload JPEG, PNG, or WebP images only.",
        variant: "destructive"
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload images smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(prev => ({ ...prev, [postKey]: true }));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `instagram-posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      // Update form with thumbnail URL
      form.setValue(`${postKey}.thumbnailUrl` as any, publicUrl);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreviews(prev => ({ 
          ...prev, 
          [postKey]: e.target?.result as string 
        }));
      };
      reader.readAsDataURL(file);

      toast({
        title: "Upload Successful!",
        description: "Thumbnail uploaded successfully."
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(prev => ({ ...prev, [postKey]: false }));
    }
  };

  const removeThumbnail = (postKey: string) => {
    form.setValue(`${postKey}.thumbnailUrl` as any, '');
    setThumbnailPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[postKey];
      return newPreviews;
    });
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    try {
      const posts = Object.entries(data).map(([key, post]) => ({
        user_id: user.id,
        title: `Instagram Post ${key.replace('post', '')}`,
        post_url: post.url,
        likes_count: post.metrics.likes,
        comments_count: post.metrics.comments,
        shares_count: post.metrics.shares,
        image_url: post.thumbnailUrl || null,
        content_type: 'image',
        posted_at: new Date().toISOString(),
      }));

      // Save to platform_stats additional_metrics instead until types are updated
      const instagramPost = {
        user_id: user.id,
        platform: 'instagram',
        additional_metrics: {
          post_analysis: posts.map((post, index) => ({
            post_number: index + 1,
            url: post.post_url,
            likes: post.likes_count,
            comments: post.comments_count,
            shares: post.shares_count,
            image_url: post.image_url
          }))
        }
      };

      const { error } = await supabase
        .from('platform_stats')
        .update(instagramPost)
        .eq('user_id', user.id)
        .eq('platform', 'instagram');

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Instagram post analysis saved successfully."
      });

    } catch (error) {
      console.error('Error saving posts:', error);
      toast({
        title: "Error",
        description: "Failed to save Instagram post analysis.",
        variant: "destructive"
      });
    }
  };

  const renderPostForm = (postKey: 'post1' | 'post2' | 'post3' | 'post4', postNumber: number) => {
    const isUploading = uploading[postKey];
    const preview = thumbnailPreviews[postKey];
    const thumbnailUrl = form.watch(`${postKey}.thumbnailUrl`);

    return (
      <Card key={postKey} className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Post {postNumber}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL Field */}
          <FormField
            control={form.control}
            name={`${postKey}.url`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://instagram.com/p/..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name={`${postKey}.metrics.likes`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Likes</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${postKey}.metrics.comments`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${postKey}.metrics.shares`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shares</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <Label htmlFor={`thumbnail-${postKey}`}>Thumbnail</Label>
            <div className="mt-2">
              {(preview || thumbnailUrl) ? (
                <div className="relative">
                  <img 
                    src={preview || thumbnailUrl} 
                    alt={`Post ${postNumber} thumbnail`}
                    className="w-32 h-32 object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => removeThumbnail(postKey)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    id={`thumbnail-${postKey}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, postKey);
                    }}
                    disabled={isUploading}
                  />
                  <label
                    htmlFor={`thumbnail-${postKey}`}
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {isUploading ? "Uploading..." : "Click to upload thumbnail"}
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Instagram Post Analysis</h2>
          <p className="text-muted-foreground">Enter data for your top 4 Instagram posts</p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          Save Posts
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderPostForm('post1', 1)}
            {renderPostForm('post2', 2)}
            {renderPostForm('post3', 3)}
            {renderPostForm('post4', 4)}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default InstagramPostForm;