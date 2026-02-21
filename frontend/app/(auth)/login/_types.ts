// ---------------------------------------------------------------------------
// Login page types
// ---------------------------------------------------------------------------

import type { LoginRequest } from '@/api/auth/auth.types';

/** Form state for the login form. */
export interface LoginFormState extends LoginRequest {
  /** Whether the "remember me" checkbox is checked. */
  rememberMe: boolean;
}

/** Validation errors keyed by form field. */
export interface LoginFormErrors {
  email?: string;
  password?: string;
  form?: string;
}
