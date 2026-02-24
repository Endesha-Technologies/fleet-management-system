'use client';

// ---------------------------------------------------------------------------
// AuthProvider
// ---------------------------------------------------------------------------
// Wraps the app tree and performs the one-time session hydration on mount.
//
// Responsibilities:
//   1. Hydrate the auth store from persisted storage (localStorage + cookies).
//   2. Validate the session by attempting a silent token refresh when tokens
//      exist but may be stale.
//   3. Expose auth actions (login, logout) to descendants via context.
//
// This component must be rendered as a client component because it uses
// `useEffect` and interacts with browser APIs.
// ---------------------------------------------------------------------------

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/api/auth/auth.service';
import type { AuthUser } from '@/api/auth/auth.types';
import type { LoginRequest } from '@/api/auth/auth.types';
import { hasTokens, clearTokens, getRefreshToken } from '@/lib/auth-tokens';
import { authStore } from './auth-store';

// ---------------------------------------------------------------------------
// Local-storage key (must match auth-store)
// ---------------------------------------------------------------------------

const USER_STORAGE_KEY = 'fleet_auth_user';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

export interface AuthActions {
  /** Authenticate with email + password. Hydrates the store on success. */
  login: (credentials: LoginRequest) => Promise<AuthUser>;
  /** Sign out – clears tokens and store, then redirects to /login. */
  logout: () => Promise<void>;
}

const AuthActionsContext = createContext<AuthActions | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // ---- Hydration on mount ---------------------------------------------------
  //
  // IMPORTANT: `isLoading` stays `true` (the initial value) for the entire
  // duration of init().  We intentionally do NOT call `authStore.hydrate()`
  // because that would flip `isLoading` to `false` before the async token
  // refresh resolves.  Instead we read localStorage directly and only update
  // the store once the refresh result is known.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function init() {
      // 1. Tentatively restore the user from localStorage (no store update yet
      //    — isLoading remains true so guarded pages show a spinner).
      let storedUser: AuthUser | null = null;
      try {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem(USER_STORAGE_KEY);
          if (raw) {
            storedUser = JSON.parse(raw) as AuthUser;
          }
        }
      } catch {
        // Corrupted data – treat as no stored user
      }

      // 2. If any token exists (access OR refresh), attempt a proactive
      //    refresh to validate the session.
      const canAttemptRefresh = hasTokens() || getRefreshToken() !== null;

      if (canAttemptRefresh) {
        try {
          await authService.refreshToken();
          // Tokens refreshed successfully.
          if (storedUser) {
            authStore.setUser(storedUser); // isLoading → false, isAuthenticated → true
          } else {
            // Edge case: valid tokens but no cached user (shouldn't happen
            // normally). Force re-login for safety.
            clearTokens();
            authStore.clearUser(); // isLoading → false, isAuthenticated → false
          }
        } catch {
          // Refresh failed – session is expired / invalid.
          clearTokens();
          authStore.clearUser(); // isLoading → false, isAuthenticated → false
        }
      } else {
        // No tokens at all – definitely not authenticated.
        authStore.clearUser(); // isLoading → false, isAuthenticated → false
      }
    }

    init();
  }, []);

  // ---- Actions --------------------------------------------------------------

  const login = useCallback(
    async (credentials: LoginRequest): Promise<AuthUser> => {
      const { user } = await authService.login(credentials);
      authStore.setUser(user);
      return user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      authStore.clearUser();
      router.replace('/login');
    }
  }, [router]);

  const actions = useMemo(() => ({ login, logout }), [login, logout]);

  return (
    <AuthActionsContext.Provider value={actions}>
      {children}
    </AuthActionsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook to consume actions
// ---------------------------------------------------------------------------

/**
 * Access auth actions (login, logout) provided by `<AuthProvider>`.
 *
 * Must be called within the AuthProvider tree.
 */
export function useAuthActions(): AuthActions {
  const ctx = useContext(AuthActionsContext);

  if (!ctx) {
    throw new Error(
      'useAuthActions must be used within an <AuthProvider>. ' +
        'Wrap your app with <AuthProvider> in the root layout.',
    );
  }

  return ctx;
}
