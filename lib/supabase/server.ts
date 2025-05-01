import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    "https://bhtmmfhevoboczrvvpft.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJodG1tZmhldm9ib2N6cnZ2cGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjIwNjQsImV4cCI6MjA2MDk5ODA2NH0.XHZA0g3u46o1TI7f63i1ewYiVysXzFQkyZQs7wc0ftE",
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore;
          return cookie.get(name)?.value;
        },
        async set(name: string, value: string, options: any) {
          try {
            const cookie = await cookieStore;
            cookie.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting error
          }
        },
        async remove(name: string, options: any) {
          try {
            const cookie = await cookieStore;
            cookie.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie removal error
          }
        },
      },
    }
  );
} 