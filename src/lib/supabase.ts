import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Use the existing project configuration (no environment variables needed in Lovable)
const SUPABASE_URL = "https://gmprigvmotrdrayxacnl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcHJpZ3Ztb3RyZHJheXhhY25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODkxNDIsImV4cCI6MjA3MTA2NTE0Mn0.PVYIhlkbkSNX6h8bx8G9fHuntB2P1R1lOLh6B587SX4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { 
    persistSession: true, 
    autoRefreshToken: true 
  }
});