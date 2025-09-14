import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anon) {
  console.warn('Supabase env vars are missing. Check .env.local');
}

export const supabase = createClient(url, anon);
console.log('ENV CHECK', {
  url: import.meta.env.VITE_SUPABASE_URL,
  anon: (import.meta.env.VITE_SUPABASE_ANON_KEY || '').slice(0, 6) + '...'
});
