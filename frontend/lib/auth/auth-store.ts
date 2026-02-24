// ---------------------------------------------------------------------------
// Auth external store
// ---------------------------------------------------------------------------
// A lightweight, framework-agnostic store for authentication state.
// Compatible with React 18/19 `useSyncExternalStore` for tear-free reads.
//
// WHY NOT Zustand/Jotai?  The project has no state-management library.
// This store is ~80 lines and zero-dependency – keeping the bundle lean.
// ---------------------------------------------------------------------------

import type { AuthUser } from '@/api/auth/auth.types';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface AuthState {
  /** The currently authenticated user, or `null` when signed out. */
  user: AuthUser | null;
  /** `true` while the initial session check (hydration) is in progress. */
  isLoading: boolean;
  /** Convenience flag — `true` when `user` is not `null`. */
  isAuthenticated: boolean;
}

const INITIAL_STATE: AuthState = {
  user: null,
  isLoading: true, // starts true; flipped after hydration
  isAuthenticated: false,
};

// ---------------------------------------------------------------------------
// Local-storage key for persisting user data across refreshes
// ---------------------------------------------------------------------------

const USER_STORAGE_KEY = 'fleet_auth_user';

// ---------------------------------------------------------------------------
// Singleton state + subscriber set
// ---------------------------------------------------------------------------

let state: AuthState = { ...INITIAL_STATE };
const listeners = new Set<() => void>();

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

// ---------------------------------------------------------------------------
// Public API — actions
// ---------------------------------------------------------------------------

/**
 * Set the authenticated user after a successful login or token refresh.
 * Persists the user data to localStorage so it survives hard refreshes.
 */
function setUser(user: AuthUser): void {
  state = { user, isLoading: false, isAuthenticated: true };
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch {
    // localStorage may be unavailable (e.g. private browsing quota exceeded)
  }
  emitChange();
}

/**
 * Clear the authenticated user (on logout or session expiry).
 */
function clearUser(): void {
  state = { user: null, isLoading: false, isAuthenticated: false };
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch {
    // Swallow – best effort
  }
  emitChange();
}

/**
 * Hydrate the store from persisted storage on app start.
 * Should be called once in the AuthProvider on mount.
 */
function hydrate(): void {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (raw) {
        const user = JSON.parse(raw) as AuthUser;
        state = { user, isLoading: false, isAuthenticated: true };
        emitChange();
        return;
      }
    }
  } catch {
    // Corrupted data – fall through to "not authenticated"
  }

  state = { user: null, isLoading: false, isAuthenticated: false };
  emitChange();
}

/**
 * Mark loading as complete without changing user state.
 */
function setLoadingComplete(): void {
  state = { ...state, isLoading: false };
  emitChange();
}

// ---------------------------------------------------------------------------
// Public API — selectors (for useSyncExternalStore)
// ---------------------------------------------------------------------------

/** Subscribe to store changes – returns an unsubscribe function. */
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Return the current immutable snapshot. */
function getSnapshot(): AuthState {
  return state;
}

/** Server snapshot – always the initial (unauthenticated) state. */
function getServerSnapshot(): AuthState {
  return INITIAL_STATE;
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const authStore = {
  // Actions
  setUser,
  clearUser,
  hydrate,
  setLoadingComplete,
  // Selectors (for useSyncExternalStore)
  subscribe,
  getSnapshot,
  getServerSnapshot,
} as const;
