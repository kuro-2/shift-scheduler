import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware runs on the Edge runtime which doesn't support Node.js modules
 * like `jsonwebtoken`. We do a lightweight cookie-existence check here for
 * redirect logic. Full JWT verification happens server-side in the API routes
 * (Node.js runtime) and the SessionGate component.
 */

const SESSION_COOKIE = 'nexora-session';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/forgot', '/otp', '/reset', '/onboarding'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthenticated = !!token;

  // Allow API routes to pass through (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // If on a public route (login, forgot, etc.) and already authenticated → redirect to app
  if (isPublicRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/schedule', request.url));
  }

  // If on a public route and not authenticated → allow through
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // If not authenticated and trying to access a protected route → redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user accessing a protected route → allow through
  return NextResponse.next();
}

export const config = {
  // Match all paths except static assets and Next.js internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
