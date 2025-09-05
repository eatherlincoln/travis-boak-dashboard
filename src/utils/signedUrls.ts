import { supabase } from '../lib/supabase';

export async function signedThumb(path: string, expiresInSeconds = 60 * 10) {
  const { data, error } = await supabase.storage
    .from('thumbnails')
    .createSignedUrl(path, expiresInSeconds);
  
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

// Get asset URL with version-based cache busting
export async function getAssetUrl(thumbPath: string, updatedAt: string, fallbackUrl?: string): Promise<string> {
  try {
    // Try to get signed URL from storage
    const signedUrl = await signedThumb(thumbPath);
    // Add timestamp for extra cache-busting clarity
    const timestamp = new Date(updatedAt).getTime();
    return `${signedUrl}&v=${timestamp}`;
  } catch (error) {
    console.warn('Failed to get signed URL, using fallback:', error);
    // Return fallback URL with cache-busting timestamp
    if (fallbackUrl) {
      const timestamp = new Date(updatedAt).getTime();
      return `${fallbackUrl}?v=${timestamp}`;
    }
    return '';
  }
}

// Fallback to public URLs if signed URL fails (legacy)
export async function getThumbUrl(path: string, fallbackUrl?: string): Promise<string> {
  try {
    const signedUrl = await signedThumb(path);
    // Add timestamp for extra cache-busting clarity
    const timestamp = Date.now();
    return `${signedUrl}&v=${timestamp}`;
  } catch (error) {
    console.warn('Failed to get signed URL, using fallback:', error);
    // Return fallback URL with cache-busting timestamp
    return fallbackUrl ? `${fallbackUrl}?v=${Date.now()}` : '';
  }
}