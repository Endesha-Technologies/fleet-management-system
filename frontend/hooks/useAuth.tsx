'use client';

// ---------------------------------------------------------------------------
// Auth context + useAuth hook
// ---------------------------------------------------------------------------
// Provides auth state (user, loading, authenticated) to the component tree
// and exposes `login` / `logout` actions.
//
// Usage:
//   Wrap the root layout with <AuthProvider> then consume via useAuth():
//
//     const { user, isAuthenticated, login, logout, isLoading } = useAuth();
// ---------------------------------------------------------------------------

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authService } from '@/api/auth';
import type { AuthUser, LoginRequest } from '@/api/auth';
import { hasTokens, getAccessToken } from '@/lib/auth-tokens';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AuthContextValue {
  /** The currently authenticated user, or `null` while logged out / loading. */
  user: AuthUser | null;
  /** `true` while the initial auth check is in progress. */
  isLoading: boolean;
  /** Convenience flag – `true` when a user object is present. */
  isAuthenticated: boolean;
  /** Authenticate with credentials. Throws on failure. */
  login: (credentials: LoginRequest) => Promise<void>;
  /** End the session and clear tokens. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helper – decode a JWT payload without a library (client-side only)
// ---------------------------------------------------------------------------

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  // 30-second buffer to avoid edge-case race conditions
  return payload.exp * 1000 < Date.now() + 30_000;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ------ Bootstrap: restore session from persisted tokens -----------------
  useEffect(() => {
    async function bootstrap() {
      try {
        if (!hasTokens()) return;

        const accessToken = getAccessToken();

        // If the access token is expired, try a silent refresh
        if (accessToken && isTokenExpired(accessToken)) {
          try {
            await authService.refreshToken();
          } catch {
            // Refresh failed – user must log in again
            return;
          }
        }

        // Re-read the (possibly refreshed) token to extract the user
        const freshToken = getAccessToken();
        if (!freshToken) return;

        const payload = decodeJwtPayload(freshToken);
        if (!payload) return;

        // Reconstruct a minimal AuthUser from the JWT claims.
        // Full user data is only available right after login; on subsequent
        // page loads we hydrate from the token. If the backend provides a
        // `/auth/me` endpoint in the future, call it here instead.
        setUser({
          id: payload.userId as string,
          email: payload.email as string,
          firstName: '', // not in token – populated on full login
          lastName: '',
          type: (payload.type as AuthUser['type']) ?? 'SYSTEM',
          roles: [],
          permissions: [],
        });
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();
  }, []);

  // ------ Actions ----------------------------------------------------------

  const login = useCallback(async (credentials: LoginRequest) => {
    const { user: loggedInUser } = await authService.login(credentials);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  // ------ Memoised value ---------------------------------------------------

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access auth state and actions from any client component.
 *
 * Must be called inside an `<AuthProvider>`.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
