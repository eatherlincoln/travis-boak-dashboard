import { supabase } from '../lib/supabase';

export async function signedThumb(path: string, expiresInSeconds = 60 * 10) {
  const { data, error } = await supabase.storage
    .from('thumbnails')
    .createSignedUrl(path, expiresInSeconds);
  
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

// Fallback to public URLs if signed URL fails
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