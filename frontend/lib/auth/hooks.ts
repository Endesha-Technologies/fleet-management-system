'use client';

// ---------------------------------------------------------------------------
// Auth hooks
// ---------------------------------------------------------------------------
// React hooks that connect to the auth store and permission utilities.
// All hooks are client-only (`'use client'` directive).
// ---------------------------------------------------------------------------

import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authStore } from './auth-store';
import type { AuthState } from './auth-store';
import type { AuthUser } from '@/api/auth/auth.types';
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  type Permission,
} from '@/lib/permissions';

// ---------------------------------------------------------------------------
// useAuthState — raw store subscription
// ---------------------------------------------------------------------------

/**
 * Subscribe to the auth store with `useSyncExternalStore`.
 * Returns the full `AuthState` snapshot.
 */
export function useAuthState(): AuthState {
  return useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot,
  );
}

// ---------------------------------------------------------------------------
// useAuth — primary hook for components
// ---------------------------------------------------------------------------

export interface UseAuth {
  /** Current user or `null`. */
  user: AuthUser | null;
  /** `true` while the initial session check is in progress. */
  isLoading: boolean;
  /** `true` when a user is authenticated. */
  isAuthenticated: boolean;
}

/**
 * Primary auth hook. Returns the current user, loading state, and auth flag.
 *
 * ```tsx
 * const { user, isAuthenticated, isLoading } = useAuth();
 * ```
 */
export function useAuth(): UseAuth {
  const { user, isLoading, isAuthenticated } = useAuthState();
  return useMemo(
    () => ({ user, isLoading, isAuthenticated }),
    [user, isLoading, isAuthenticated],
  );
}

// ---------------------------------------------------------------------------
// usePermissions — permission checking hook
// ---------------------------------------------------------------------------

export interface UsePermissions {
  /** Check a single permission. */
  can: (permission: Permission) => boolean;
  /** Check that the user has ALL listed permissions. */
  canAll: (permissions: readonly Permission[]) => boolean;
  /** Check that the user has AT LEAST ONE of the listed permissions. */
  canAny: (permissions: readonly Permission[]) => boolean;
  /** The raw permission strings from the user's profile. */
  permissions: readonly string[];
}

/**
 * Provides convenience methods for checking the current user's permissions.
 *
 * ```tsx
 * const { can, canAny } = usePermissions();
 *
 * if (can(PERMISSIONS.TRUCKS.CREATE)) { … }
 * if (canAny([PERMISSIONS.USERS.LIST, PERMISSIONS.USERS.VIEW])) { … }
 * ```
 */
export function usePermissions(): UsePermissions {
  const { user } = useAuthState();

  const permissions: readonly string[] = user?.permissions ?? [];

  const can = useCallback(
    (permission: Permission) => hasPermission(permissions, permission),
    [permissions],
  );

  const canAll = useCallback(
    (required: readonly Permission[]) =>
      hasAllPermissions(permissions, required),
    [permissions],
  );

  const canAny = useCallback(
    (required: readonly Permission[]) =>
      hasAnyPermission(permissions, required),
    [permissions],
  );

  return useMemo(
    () => ({ can, canAll, canAny, permissions }),
    [can, canAll, canAny, permissions],
  );
}

// ---------------------------------------------------------------------------
// useRequireAuth — redirect guard
// ---------------------------------------------------------------------------

/**
 * Redirects to `/login` if the user is not authenticated.
 * Returns the auth state so the caller can render a loading spinner during
 * hydration.
 *
 * Use this at the top of page components that require authentication:
 *
 * ```tsx
 * export default function DashboardPage() {
 *   const { user, isLoading } = useRequireAuth();
 *   if (isLoading) return <Spinner />;
 *   // user is guaranteed non-null here
 * }
 * ```
 */
export function useRequireAuth(): UseAuth {
  const router = useRouter();
  const auth = useAuth();

  // Redirect once loading completes and user is absent
  if (!auth.isLoading && !auth.isAuthenticated) {
    router.replace('/login');
  }

  return auth;
}

// ---------------------------------------------------------------------------
// useRequirePermission — redirect + permission guard
// ---------------------------------------------------------------------------

/**
 * Like `useRequireAuth`, but also checks for a specific permission.
 * Redirects to `/login` if unauthenticated, or returns `{ authorized: false }`
 * if the user lacks the required permission.
 */
export function useRequirePermission(permission: Permission): UseAuth & {
  authorized: boolean;
} {
  const auth = useRequireAuth();
  const { can } = usePermissions();

  const authorized = auth.isAuthenticated && can(permission);

  return { ...auth, authorized };
}
