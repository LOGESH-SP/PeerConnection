import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.supabaseUrl || (!env.supabaseServiceRoleKey && !env.supabaseKey)) {
  console.warn('Supabase URL or Key is missing. Check your environment variables.');
}

// We use the Service Role Key to bypass RLS in the backend or default to anon key
export const supabase = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey || env.supabaseKey
);
