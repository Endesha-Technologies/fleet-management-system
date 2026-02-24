'use client';

// ---------------------------------------------------------------------------
// PermissionGate
// ---------------------------------------------------------------------------
// Declaratively show/hide UI based on the current user's permissions.
//
// Usage:
//
//   <PermissionGate permission={PERMISSIONS.TRUCKS.CREATE}>
//     <CreateTruckButton />
//   </PermissionGate>
//
//   <PermissionGate permissions={[PERMISSIONS.USERS.LIST, PERMISSIONS.ROLES.LIST]} mode="any">
//     <AdminPanel />
//   </PermissionGate>
//
//   <PermissionGate permission={PERMISSIONS.FUEL.DELETE} fallback={<p>No access</p>}>
//     <DeleteFuelLogButton />
//   </PermissionGate>
// ---------------------------------------------------------------------------

import type { ReactNode } from 'react';
import { usePermissions } from '@/lib/auth/hooks';
import type { Permission } from '@/lib/permissions';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SinglePermissionProps {
  /** A single permission to check. */
  permission: Permission;
  permissions?: never;
  mode?: never;
}

interface MultiPermissionProps {
  permission?: never;
  /** Multiple permissions to check. */
  permissions: readonly Permission[];
  /**
   * How to combine multiple permissions:
   * - `'all'` (default) – user must have every listed permission.
   * - `'any'`           – user must have at least one.
   */
  mode?: 'all' | 'any';
}

type PermissionGateProps = (SinglePermissionProps | MultiPermissionProps) & {
  /** Content rendered when the user HAS the required permission(s). */
  children: ReactNode;
  /** Content rendered when the user LACKS the required permission(s). Defaults to `null`. */
  fallback?: ReactNode;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PermissionGate({
  children,
  fallback = null,
  ...rest
}: PermissionGateProps) {
  const { can, canAll, canAny } = usePermissions();

  let allowed: boolean;

  if ('permission' in rest && rest.permission) {
    allowed = can(rest.permission);
  } else if ('permissions' in rest && rest.permissions) {
    const mode = rest.mode ?? 'all';
    allowed =
      mode === 'any'
        ? canAny(rest.permissions)
        : canAll(rest.permissions);
  } else {
    // No permission specified – render children unconditionally
    allowed = true;
  }

  return <>{allowed ? children : fallback}</>;
}
