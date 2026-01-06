import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Allow utility pages to bypass all checks (for clearing session issues)
  if (req.nextUrl.pathname.startsWith('/clear-session')) {
    return response;
  }

  // Get the user (more secure than getSession for server-side)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define protected routes that require authentication
  const protectedPaths = [
    '/trips',
    '/analytics',
    '/reports',
    '/subscription',
    '/account',
    '/settings',
    '/vendors',
    '/agencies',
    '/data',
    '/export-options',
    '/api-docs',
    '/what-if',
  ];

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  );

  // Redirect to login if accessing protected route without user
  if (isProtectedPath && !user) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // SECURITY: Check if user has paid (prevents "back button" bypass)
  // Users must complete Stripe checkout before accessing protected pages
  if (isProtectedPath && user) {
    // Allow access to setup-subscription and pricing pages (where they can pay)
    if (req.nextUrl.pathname.startsWith('/setup-subscription') ||
        req.nextUrl.pathname.startsWith('/subscription/success') ||
        req.nextUrl.pathname.startsWith('/pricing')) {
      return response;
    }

    // Check if user has completed payment (has stripe_customer_id)
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_tier, created_at')
      .eq('id', user.id)
      .single();

    // If no stripe_customer_id, they haven't paid yet
    if (profile && !profile.stripe_customer_id) {
      const tier = profile.subscription_tier || 'starter';

      // Check if account is older than 24 hours - give grace period for payment
      const accountAge = Date.now() - new Date(profile.created_at).getTime();
      const gracePeriodHours = 24;
      const gracePeriodMs = gracePeriodHours * 60 * 60 * 1000;

      if (accountAge > gracePeriodMs) {
        // Grace period expired - require them to complete payment or contact support
        return NextResponse.redirect(new URL(`/setup-subscription?tier=${tier}&expired=true`, req.url));
      } else {
        // Still within grace period - redirect to payment
        return NextResponse.redirect(new URL(`/setup-subscription?tier=${tier}`, req.url));
      }
    }
  }

  // Redirect authenticated users away from auth pages
  // BUT allow unpaid users to access login/register to change accounts or sign out
  const authPaths = ['/login', '/register', '/forgot-password'];
  const isAuthPath = authPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath && user) {
    // Check if user has paid
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    // Only redirect to /trips if they've paid
    // If unpaid, let them access auth pages (so they can sign out or change accounts)
    if (profile && profile.stripe_customer_id) {
      return NextResponse.redirect(new URL('/trips', req.url));
    }
  }

  return response;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
