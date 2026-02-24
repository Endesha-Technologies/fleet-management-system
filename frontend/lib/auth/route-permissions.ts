// ---------------------------------------------------------------------------
// Route ↔ Permission mapping
// ---------------------------------------------------------------------------
// Maps application routes to the permissions required to access them.
// Used by the AuthGuard or page components to enforce permission-based
// access at the page level.
//
// When you add a new route, add its permission mapping here.
// When a permission name changes, update the PERMISSIONS constant in
// `lib/permissions.ts` — the references here will update automatically.
// ---------------------------------------------------------------------------

import { PERMISSIONS, type Permission } from '@/lib/permissions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RoutePermission {
  /** One or more permissions required to access this route. */
  permissions: Permission[];
  /** How to combine when multiple permissions are listed. Default: 'any'. */
  mode?: 'all' | 'any';
}

// ---------------------------------------------------------------------------
// Route → Permission map
// ---------------------------------------------------------------------------

/**
 * Maps route path patterns to their required permissions.
 *
 * Path patterns support:
 *   - Exact matches: `/dashboard/settings`
 *   - Prefix matches: `/maintenance` matches `/maintenance/work-orders/123`
 *
 * The lookup function `getRoutePermissions` checks longest-prefix first.
 */
export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  // ---- Dashboard (no special permission – just authentication) ---------------
  // '/dashboard' — accessible to all authenticated users

  // ---- Trucks ----------------------------------------------------------------
  '/trucks': {
    permissions: [PERMISSIONS.TRUCKS.LIST],
  },

  // ---- Fuel ------------------------------------------------------------------
  '/fuel': {
    permissions: [PERMISSIONS.FUEL.LIST],
  },
  '/fuel/create': {
    permissions: [PERMISSIONS.FUEL.CREATE],
  },

  // ---- Inventory / Assets ---------------------------------------------------
  '/inventory': {
    permissions: [PERMISSIONS.ASSETS.LIST],
  },
  '/inventory/add': {
    permissions: [PERMISSIONS.ASSETS.CREATE],
  },

  // ---- Maintenance ----------------------------------------------------------
  '/maintenance': {
    permissions: [PERMISSIONS.TRUCKS.VIEW], // broad access – view truck data
  },
  '/maintenance/work-orders/create': {
    permissions: [PERMISSIONS.TRUCKS.UPDATE],
  },

  // ---- Routes ---------------------------------------------------------------
  '/routes': {
    permissions: [PERMISSIONS.ROUTES.LIST],
  },
  '/routes/create': {
    permissions: [PERMISSIONS.ROUTES.CREATE],
  },

  // ---- Settings (admin) -----------------------------------------------------
  '/settings': {
    permissions: [PERMISSIONS.USERS.LIST, PERMISSIONS.ROLES.LIST],
    mode: 'any',
  },
} as const;

// ---------------------------------------------------------------------------
// Lookup helper
// ---------------------------------------------------------------------------

/**
 * Find the permission requirements for a given pathname.
 * Returns `undefined` when no specific permission is mapped (the route only
 * requires authentication).
 *
 * Uses longest-prefix matching so `/fuel/create` is preferred over `/fuel`.
 */
export function getRoutePermissions(
  pathname: string,
): RoutePermission | undefined {
  // Sort keys by length (longest first) so we match the most specific route
  const sorted = Object.keys(ROUTE_PERMISSIONS).sort(
    (a, b) => b.length - a.length,
  );

  for (const pattern of sorted) {
    if (pathname === pattern || pathname.startsWith(`${pattern}/`)) {
      return ROUTE_PERMISSIONS[pattern];
    }
  }

  return undefined;
}
