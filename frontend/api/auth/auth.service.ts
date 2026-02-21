// ---------------------------------------------------------------------------
// Auth service
// ---------------------------------------------------------------------------
// Thin, type-safe wrapper around the API client for authentication endpoints.
// All endpoint paths come from the central ENDPOINTS registry.
// ---------------------------------------------------------------------------

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { setTokens, clearTokens, getRefreshToken } from '@/lib/auth-tokens';
import type { ApiResponse } from '../types';
import type {
  LoginRequest,
  LoginResponseData,
  RefreshTokenResponseData,
  LogoutResponseData,
  AuthUser,
} from './auth.types';

// ---------------------------------------------------------------------------
// Service methods
// ---------------------------------------------------------------------------

/**
 * Authenticate with email + password.
 *
 * On success the access & refresh tokens are persisted automatically and the
 * full user profile is returned so the caller can hydrate auth state.
 */
async function login(credentials: LoginRequest): Promise<{
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}> {
  const response: ApiResponse<LoginResponseData> = await apiClient.post(
    ENDPOINTS.AUTH.LOGIN,
    credentials,
    { skipAuth: true }, // login doesn't require an existing token
  );

  const { accessToken, refreshToken, user } = response.data;

  // Persist tokens for subsequent requests
  setTokens(accessToken, refreshToken);

  return { user, accessToken, refreshToken };
}

/**
 * Exchange the current refresh token for a fresh pair of tokens.
 *
 * The API client already handles automatic silent refresh on 401, but this
 * method is exposed for proactive refresh (e.g. before known expiry).
 */
async function refreshToken(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const currentRefreshToken = getRefreshToken();

  if (!currentRefreshToken) {
    throw new Error('No refresh token available. User must log in again.');
  }

  const response: ApiResponse<RefreshTokenResponseData> = await apiClient.post(
    ENDPOINTS.AUTH.REFRESH,
    { refreshToken: currentRefreshToken },
    { skipAuth: true }, // uses the body token, not the Bearer header
  );

  const { accessToken, refreshToken: newRefreshToken } = response.data;

  setTokens(accessToken, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
}

/**
 * Log the current user out.
 *
 * Sends the refresh token to the backend so it can invalidate the session,
 * then clears local storage regardless of outcome.
 */
async function logout(): Promise<void> {
  const currentRefreshToken = getRefreshToken();

  try {
    if (currentRefreshToken) {
      await apiClient.post<LogoutResponseData>(ENDPOINTS.AUTH.LOGOUT, {
        refreshToken: currentRefreshToken,
      });
    }
  } finally {
    // Always clear – even if the API call fails the user expects to be signed out.
    clearTokens();
  }
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const authService = {
  login,
  refreshToken,
  logout,
} as const;
