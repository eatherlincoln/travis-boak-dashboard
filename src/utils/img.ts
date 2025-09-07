// Cache-busting utility for images
export function bust(url: string, updatedAt: string): string {
  if (!url) return '';
  
  // Convert updatedAt to epoch timestamp for cache busting
  const timestamp = new Date(updatedAt).getTime();
  
  // Add version parameter to defeat CDN/browser cache
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${timestamp}`;
}