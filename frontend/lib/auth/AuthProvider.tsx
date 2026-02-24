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
import { hasTokens } from '@/lib/auth-tokens';
import { authStore } from './auth-store';

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
  useEffect(() => {
    async function init() {
      // 1. Try to restore user from localStorage
      authStore.hydrate();

      // 2. If tokens exist, attempt a proactive refresh to validate the session
      if (hasTokens()) {
        try {
          await authService.refreshToken();
          // Tokens refreshed successfully – user data from localStorage is valid
        } catch {
          // Refresh failed – session is expired
          authStore.clearUser();
        }
      } else {
        // No tokens at all – ensure store reflects "not authenticated"
        authStore.clearUser();
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
