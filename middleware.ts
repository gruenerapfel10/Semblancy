import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/signup', '/check-email'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return req.cookies.get(name)?.value;
        },
        async set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        async remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if the path is in our public paths list
    const isPublicPath = PUBLIC_PATHS.some(path => 
      req.nextUrl.pathname.startsWith(path)
    );

    // If user is not signed in and trying to access a protected route,
    // redirect to login
    if (!session && !isPublicPath) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // If user is signed in and trying to access a public route,
    // redirect to dashboard
    if (session && isPublicPath) {
      return NextResponse.redirect(new URL('/dashboard/overview', req.url));
    }

    return res;
  } catch (error) {
    // If there's an error with the session, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
