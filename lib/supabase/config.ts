/**
 * Supabase configuration
 * 
 * Replace these values with your actual Supabase URL and anon key
 * For production, use environment variables
 */

// Raw credentials for Supabase
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project-url.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// Auth configuration
export const AUTH_REDIRECT_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; 