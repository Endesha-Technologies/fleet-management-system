// ---------------------------------------------------------------------------
// Next.js Edge Middleware — Route protection
// ---------------------------------------------------------------------------
// Runs on every navigation before the page component renders.
//
// Rules:
//   1. Public routes (/login, static assets) → allow through.
//   2. Protected routes (everything else) → redirect to /login when the
//      access-token cookie is missing.
//   3. Auth pages (/login) when already logged in → redirect to /dashboard.
//
// NOTE: The middleware only checks for the *presence* of the access-token
// cookie. It does NOT validate the JWT (that would require a secret that
// must not be exposed at the edge). Actual token validation happens when
// the API client makes its first request — the 401-refresh cycle in
// `api/client.ts` handles expired tokens gracefully.
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Cookie name — must match the constant in `lib/auth-tokens.ts`. */
const ACCESS_TOKEN_COOKIE = 'fleet_access_token';

/** Routes that do NOT require authentication. */
const PUBLIC_ROUTES = ['/login'];

/** Routes that authenticated users should be redirected away from. */
const AUTH_ONLY_ROUTES = ['/login'];

/** Default destination after login. */
const DEFAULT_AUTHENTICATED_ROUTE = '/dashboard';

/** Destination when accessing a protected route without a session. */
const LOGIN_ROUTE = '/login';

// ---------------------------------------------------------------------------
// Matcher — only run middleware on app routes (skip static files, API, etc.)
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static (static files)
     *   - _next/image  (image optimisation)
     *   - favicon.ico  (browser icon)
     *   - public folder assets
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has(ACCESS_TOKEN_COOKIE);

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = AUTH_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // ---- Authenticated user hitting /login → redirect to dashboard ----------
  if (hasToken && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(url);
  }

  // ---- Unauthenticated user hitting a protected route → redirect to login --
  if (!hasToken && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_ROUTE;
    // Preserve the originally requested URL so we can redirect back after login
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // ---- Otherwise, let the request through ---------------------------------
  return NextResponse.next();
}
