import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, AUTH_REDIRECT_URL } from './config';

// Initialize the Supabase client
export const getClient = () => {
  return createClientComponentClient({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
  });
};

/**
 * Auth related functions
 */
export const supabase = {
  /**
   * Resend verification email
   */
  resendVerificationEmail: async (email: string) => {
    const client = getClient();
    return client.auth.resend({
      type: 'signup',
      email,
    });
  },

  /**
   * Sign in with email and password
   */
  signInWithPassword: async (email: string, password: string) => {
    const client = getClient();
    return client.auth.signInWithPassword({
      email,
      password,
    });
  },

  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, redirectTo?: string) => {
    const client = getClient();
    return client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo || `${AUTH_REDIRECT_URL}/auth/callback`,
      },
    });
  },

  /**
   * Sign out
   */
  signOut: async () => {
    const client = getClient();
    return client.auth.signOut();
  },

  /**
   * Get current session
   */
  getSession: async () => {
    const client = getClient();
    return client.auth.getSession();
  },

  /**
   * Get current user
   */
  getUser: async () => {
    const client = getClient();
    return client.auth.getUser();
  },
}; 