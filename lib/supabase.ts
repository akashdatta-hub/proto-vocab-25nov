import { createClient } from '@supabase/supabase-js';

// Supabase client for browser/client-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Supabase admin client for server-side operations (has elevated permissions)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to get Supabase client based on context
export function getSupabaseClient(useAdmin = false) {
  return useAdmin ? supabaseAdmin : supabase;
}
