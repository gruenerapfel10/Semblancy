/**
 * Supabase configuration
 * 
 * Replace these values with your actual Supabase URL and anon key
 * For production, use environment variables
 */

// Raw credentials for Supabase
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bhtmmfhevoboczrvvpft.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJodG1tZmhldm9ib2N6cnZ2cGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjIwNjQsImV4cCI6MjA2MDk5ODA2NH0.XHZA0g3u46o1TI7f63i1ewYiVysXzFQkyZQs7wc0ftE';

// Auth configuration
export const AUTH_REDIRECT_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; 