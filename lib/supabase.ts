import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Allow development without Supabase credentials
// This enables testing features like CSV import without full infrastructure
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Running in dev mode without Supabase credentials - some features will be limited');
      // Create a mock client that won't error
      return {
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          signOut: async () => ({ error: null }),
        },
        from: () => ({
          select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        }),
      } as any;
    } else {
      throw new Error('Missing Supabase environment variables');
    }
  }

  // Use SSR browser client for proper cookie-based session management
  // This works with both client-side and middleware cookie handling
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

// For server-side operations that need elevated permissions
export const getServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL');
  }
  return createClient(supabaseUrl, serviceRoleKey);
};
