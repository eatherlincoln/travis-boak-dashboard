import React from 'react';
import { useInstagramTopPosts } from '../hooks/useInstagramTopPosts';
import { bust } from '../utils/img';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RefreshCw, Heart, MessageCircle, Eye, Bookmark } from 'lucide-react';

export function InstagramTopPosts() {
  const { rows, loading, err, reload } = useInstagramTopPosts(6);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted aspect-square rounded-lg mb-2"></div>
                <div className="bg-muted h-4 rounded mb-1"></div>
                <div className="bg-muted h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (err) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error: {err}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Performing Posts</CardTitle>
        <Button variant="outline" size="sm" onClick={reload}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map(post => (
            <a 
              key={post.media_id} 
              href={post.permalink ?? '#'} 
              target="_blank" 
              rel="noreferrer"
              className="group block"
            >
              <div className="relative overflow-hidden rounded-lg">
                <img
                  alt={post.caption ?? 'Instagram post'}
                  src={bust(post.media_url || '', post.updated_at)}
                  className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center space-y-2">
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.like_count?.toLocaleString() ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.comment_count?.toLocaleString() ?? 0}
                      </span>
                    </div>
                    {(post.reach || post.saves) && (
                      <div className="flex items-center justify-center gap-4 text-xs opacity-80">
                        {post.reach && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.reach.toLocaleString()}
                          </span>
                        )}
                        {post.saves && (
                          <span className="flex items-center gap-1">
                            <Bookmark className="h-3 w-3" />
                            {post.saves.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {post.caption && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {post.caption}
                </p>
              )}
              <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {post.like_count?.toLocaleString() ?? 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {post.comment_count?.toLocaleString() ?? 0}
                </span>
              </div>
            </a>
          ))}
        </div>
        {rows.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No Instagram posts found. Add some posts to see them here.
          </div>
        )}
      </CardContent>
    </Card>
  );
}