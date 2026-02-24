// ---------------------------------------------------------------------------
// Auth module barrel export
// ---------------------------------------------------------------------------
// Import from '@/lib/auth' to access everything auth-related.
// ---------------------------------------------------------------------------

// Store
export { authStore } from './auth-store';
export type { AuthState } from './auth-store';

// Provider & actions
export { AuthProvider, useAuthActions } from './AuthProvider';
export type { AuthActions } from './AuthProvider';

// Hooks
export {
  useAuth,
  useAuthState,
  usePermissions,
  useRequireAuth,
  useRequirePermission,
} from './hooks';
export type { UseAuth, UsePermissions } from './hooks';

// Route-level permission mapping
export {
  ROUTE_PERMISSIONS,
  getRoutePermissions,
} from './route-permissions';
export type { RoutePermission } from './route-permissions';
