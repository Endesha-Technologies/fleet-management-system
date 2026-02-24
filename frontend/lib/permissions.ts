// ---------------------------------------------------------------------------
// Permission constants registry
// ---------------------------------------------------------------------------
// Single source of truth for every permission string used across the app.
// Permissions follow the `resource:action` convention used by the backend.
//
// WHY THIS FILE EXISTS:
//   • When a permission is renamed on the backend, change it in ONE place here.
//   • Components import the constant instead of hard-coding strings.
//   • TypeScript catches typos at compile time.
//
// HOW TO UPDATE:
//   1. Add/rename the constant below.
//   2. Update any components that reference the old constant.
//   3. That's it – no grep-and-replace across 50 files.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helper type – a permission is always `resource:action`
// ---------------------------------------------------------------------------

/** A permission string in the format `resource:action`. */
export type Permission = `${string}:${string}`;

// ---------------------------------------------------------------------------
// Wildcard (super-admin)
// ---------------------------------------------------------------------------

/** Full system access – matches every resource and action. */
export const FULL_ACCESS: Permission = '*:*';

// ---------------------------------------------------------------------------
// Per-resource permissions, grouped for discoverability
// ---------------------------------------------------------------------------

export const PERMISSIONS = {
  // ---- Assets -------------------------------------------------------------
  ASSETS: {
    CREATE: 'assets:create' as Permission,
    DISPOSE: 'assets:dispose' as Permission,
    INSTALL: 'assets:install' as Permission,
    LIST: 'assets:list' as Permission,
    PURCHASE: 'assets:purchase' as Permission,
    REMOVE: 'assets:remove' as Permission,
    UPDATE: 'assets:update' as Permission,
    VIEW: 'assets:view' as Permission,
  },

  // ---- Audit --------------------------------------------------------------
  AUDIT: {
    LIST: 'audit:list' as Permission,
  },

  // ---- Fuel ---------------------------------------------------------------
  FUEL: {
    CREATE: 'fuel:create' as Permission,
    DELETE: 'fuel:delete' as Permission,
    LIST: 'fuel:list' as Permission,
    UPDATE: 'fuel:update' as Permission,
    VIEW: 'fuel:view' as Permission,
  },

  // ---- Roles --------------------------------------------------------------
  ROLES: {
    CREATE: 'roles:create' as Permission,
    DELETE: 'roles:delete' as Permission,
    LIST: 'roles:list' as Permission,
    UPDATE: 'roles:update' as Permission,
    VIEW: 'roles:view' as Permission,
  },

  // ---- Routes -------------------------------------------------------------
  ROUTES: {
    CREATE: 'routes:create' as Permission,
    LIST: 'routes:list' as Permission,
    UPDATE: 'routes:update' as Permission,
    VIEW: 'routes:view' as Permission,
  },

  // ---- Store --------------------------------------------------------------
  STORE: {
    CREATE: 'store:create' as Permission,
    LIST: 'store:list' as Permission,
    PLACE: 'store:place' as Permission,
    RETRIEVE: 'store:retrieve' as Permission,
  },

  // ---- Suppliers ----------------------------------------------------------
  SUPPLIERS: {
    CREATE: 'suppliers:create' as Permission,
    LIST: 'suppliers:list' as Permission,
    UPDATE: 'suppliers:update' as Permission,
  },

  // ---- Trips --------------------------------------------------------------
  TRIPS: {
    CANCEL: 'trips:cancel' as Permission,
    COMPLETE: 'trips:complete' as Permission,
    CREATE: 'trips:create' as Permission,
    LIST: 'trips:list' as Permission,
    START: 'trips:start' as Permission,
    UPDATE: 'trips:update' as Permission,
    VIEW: 'trips:view' as Permission,
  },

  // ---- Trucks -------------------------------------------------------------
  TRUCKS: {
    CREATE: 'trucks:create' as Permission,
    DELETE: 'trucks:delete' as Permission,
    LIST: 'trucks:list' as Permission,
    UPDATE: 'trucks:update' as Permission,
    VIEW: 'trucks:view' as Permission,
  },

  // ---- Tyres --------------------------------------------------------------
  TYRES: {
    CREATE: 'tyres:create' as Permission,
    DISPOSE: 'tyres:dispose' as Permission,
    INSPECT: 'tyres:inspect' as Permission,
    INSTALL: 'tyres:install' as Permission,
    LIST: 'tyres:list' as Permission,
    REMOVE: 'tyres:remove' as Permission,
    ROTATE: 'tyres:rotate' as Permission,
    UPDATE: 'tyres:update' as Permission,
    VIEW: 'tyres:view' as Permission,
  },

  // ---- Users --------------------------------------------------------------
  USERS: {
    CREATE: 'users:create' as Permission,
    DELETE: 'users:delete' as Permission,
    LIST: 'users:list' as Permission,
    UPDATE: 'users:update' as Permission,
    VIEW: 'users:view' as Permission,
  },

  // ---- Wialon (GPS tracking) ----------------------------------------------
  WIALON: {
    VIEW: 'wialon:view' as Permission,
  },
} as const;

// ---------------------------------------------------------------------------
// Utility: flatten all permissions into a readonly array
// ---------------------------------------------------------------------------

/** Every known permission as a flat array – useful for admin UIs. */
export const ALL_PERMISSIONS: readonly Permission[] = Object.values(
  PERMISSIONS,
).flatMap((group) => Object.values(group));

// ---------------------------------------------------------------------------
// Permission checking utilities (pure functions — no React dependency)
// ---------------------------------------------------------------------------

/**
 * Check whether a user's permission set includes a specific permission.
 *
 * Handles the wildcard `*:*` (full access) automatically.
 * Also supports wildcard matching on individual segments:
 *   - `*:*`           → matches everything
 *   - `trucks:*`      → matches any action on trucks
 *   - `*:list`        → matches the "list" action on any resource
 */
export function hasPermission(
  userPermissions: readonly string[],
  required: Permission,
): boolean {
  // Fast path – full access
  if (userPermissions.includes(FULL_ACCESS)) return true;

  // Direct match
  if (userPermissions.includes(required)) return true;

  // Wildcard matching: check `resource:*` and `*:action`
  const [resource, action] = required.split(':');

  for (const perm of userPermissions) {
    const [permResource, permAction] = perm.split(':');

    // resource:* matches any action on that resource
    if (permResource === resource && permAction === '*') return true;

    // *:action matches the action on any resource
    if (permResource === '*' && permAction === action) return true;
  }

  return false;
}

/**
 * Check whether a user has ALL of the listed permissions.
 */
export function hasAllPermissions(
  userPermissions: readonly string[],
  required: readonly Permission[],
): boolean {
  return required.every((p) => hasPermission(userPermissions, p));
}

/**
 * Check whether a user has AT LEAST ONE of the listed permissions.
 */
export function hasAnyPermission(
  userPermissions: readonly string[],
  required: readonly Permission[],
): boolean {
  return required.some((p) => hasPermission(userPermissions, p));
}
