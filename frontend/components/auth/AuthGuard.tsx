'use client';

// ---------------------------------------------------------------------------
// AuthGuard
// ---------------------------------------------------------------------------
// Wraps page content that requires authentication. Shows a loading state
// during session hydration, then either renders children or redirects.
//
// For permission-gated pages, pass the `permission` prop to also verify
// the user has the required permission, rendering an "access denied" view
// if not.
//
// Usage in a layout or page:
//
//   <AuthGuard>
//     <DashboardContent />
//   </AuthGuard>
//
//   <AuthGuard permission={PERMISSIONS.USERS.LIST}>
//     <UserManagementPage />
//   </AuthGuard>
// ---------------------------------------------------------------------------

import type { ReactNode } from 'react';
import { useRequireAuth } from '@/lib/auth/hooks';
import { usePermissions } from '@/lib/auth/hooks';
import type { Permission } from '@/lib/permissions';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AuthGuardProps {
  children: ReactNode;
  /** Optional permission required to access this page. */
  permission?: Permission;
  /** Custom loading UI. */
  loadingFallback?: ReactNode;
  /** Custom "access denied" UI. */
  unauthorizedFallback?: ReactNode;
}

// ---------------------------------------------------------------------------
// Default fallbacks
// ---------------------------------------------------------------------------

function DefaultLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  );
}

function DefaultUnauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-gray-600">
          You do not have permission to view this page.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuthGuard({
  children,
  permission,
  loadingFallback,
  unauthorizedFallback,
}: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const { can } = usePermissions();

  // 1. Still checking session
  if (isLoading) {
    return <>{loadingFallback ?? <DefaultLoading />}</>;
  }

  // 2. Not authenticated → useRequireAuth already triggers redirect
  if (!isAuthenticated) {
    return <>{loadingFallback ?? <DefaultLoading />}</>;
  }

  // 3. Authenticated but missing required permission
  if (permission && !can(permission)) {
    return <>{unauthorizedFallback ?? <DefaultUnauthorized />}</>;
  }

  // 4. All good
  return <>{children}</>;
}
