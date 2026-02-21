// ---------------------------------------------------------------------------
// Token persistence helpers — cookie-based
// ---------------------------------------------------------------------------
// Tokens are stored as browser cookies so they survive page refreshes and
// are available to both client-side JS (for the Authorization header) and
// Next.js middleware / server actions (via the Cookie header).
//
// Cookie attributes:
//   • `Path=/`          – available on every route
//   • `SameSite=Strict` – mitigates CSRF
//   • `Secure`          – sent only over HTTPS (production)
//   • `Max-Age`         – refresh token gets 30 days; access token gets 1 day
//
// All reads / writes are guarded for SSR (server components / Node).
// ---------------------------------------------------------------------------

const ACCESS_TOKEN_KEY = 'fleet_access_token';
const REFRESH_TOKEN_KEY = 'fleet_refresh_token';

/** Access token lifetime in seconds (1 day). */
const ACCESS_MAX_AGE = 60 * 60 * 24;

/** Refresh token lifetime in seconds (30 days). */
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

/** True when running in a browser context. */
const isBrowser = typeof window !== 'undefined';

/** True when the page is served over HTTPS (or localhost). */
const isSecure =
  isBrowser && window.location.protocol === 'https:';

// ---------------------------------------------------------------------------
// Low-level cookie helpers (no external dependencies)
// ---------------------------------------------------------------------------

function getCookie(name: string): string | null {
  if (!isBrowser) return null;

  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (!isBrowser) return;

  let cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Strict; Max-Age=${maxAge}`;
  if (isSecure) {
    cookie += '; Secure';
  }
  document.cookie = cookie;
}

function deleteCookie(name: string): void {
  if (!isBrowser) return;
  // Setting Max-Age=0 instructs the browser to remove the cookie immediately.
  document.cookie = `${name}=; Path=/; SameSite=Strict; Max-Age=0`;
}

// ---------------------------------------------------------------------------
// Public API (unchanged signatures — drop-in replacement for localStorage)
// ---------------------------------------------------------------------------

// ---- Access token -----------------------------------------------------------

export function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  setCookie(ACCESS_TOKEN_KEY, token, ACCESS_MAX_AGE);
}

// ---- Refresh token ----------------------------------------------------------

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  setCookie(REFRESH_TOKEN_KEY, token, REFRESH_MAX_AGE);
}

// ---- Bulk operations --------------------------------------------------------

/**
 * Persist both tokens at once – convenience wrapper used after login and
 * after a silent refresh.
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

/**
 * Remove all auth tokens – used during logout or when a refresh fails.
 */
export function clearTokens(): void {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}

/**
 * Returns `true` when an access token is present in storage.
 * Does **not** validate whether the token is expired.
 */
export function hasTokens(): boolean {
  return getAccessToken() !== null;
}
