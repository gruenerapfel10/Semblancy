import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    "https://bhtmmfhevoboczrvvpft.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJodG1tZmhldm9ib2N6cnZ2cGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjIwNjQsImV4cCI6MjA2MDk5ODA2NH0.XHZA0g3u46o1TI7f63i1ewYiVysXzFQkyZQs7wc0ftE"
  );
} 