// ---------------------------------------------------------------------------
// Auth domain types
// ---------------------------------------------------------------------------
// Derived from the backend contract defined in auth_responses.json.
// ---------------------------------------------------------------------------

import type { ApiResponse } from '../types';

/** User type discriminator returned by the backend. */
export type UserType = 'SYSTEM' | 'ADMIN' | 'DRIVER' | 'MANAGER';

/** Authenticated user profile. */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  type: UserType;
  roles: string[];
  permissions: string[];
}

// ---- Request payloads -------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// ---- Response data payloads -------------------------------------------------

/** Data returned on successful login. */
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/** Data returned on successful token refresh. */
export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

/** Data returned on successful logout (always `null`). */
export type LogoutResponseData = null;

// ---- Full API response aliases (convenience) --------------------------------

export type LoginResponse = ApiResponse<LoginResponseData>;
export type RefreshTokenResponse = ApiResponse<RefreshTokenResponseData>;
export type LogoutResponse = ApiResponse<LogoutResponseData>;
