// ---------------------------------------------------------------------------
// Core HTTP client
// ---------------------------------------------------------------------------
// Thin fetch wrapper that every service uses. Responsibilities:
//   • Build full URLs from relative endpoint paths
//   • Attach `Authorization: Bearer …` when a token is available
//   • On 401 – silently refresh tokens then retry the original request once
//   • Surface failures as typed `ApiError` instances
//
// No third-party HTTP libraries – only the native Fetch API.
// ---------------------------------------------------------------------------

import { ApiError } from './types';
import type { ApiResponse } from './types';
import { ENDPOINTS } from './endpoints';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '@/lib/auth-tokens';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3000/api/v1';

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

export interface RequestConfig extends Omit<RequestInit, 'body'> {
  /** When `true` the `Authorization` header will **not** be attached. */
  skipAuth?: boolean;
  /** Query-string parameters – appended to the URL automatically. */
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

// ---------------------------------------------------------------------------
// Silent-refresh mutex
// ---------------------------------------------------------------------------
// When a 401 arrives we attempt a single token refresh. While the refresh is
// in-flight every other request that also encounters a 401 waits for the same
// promise – preventing N parallel refresh calls.
// ---------------------------------------------------------------------------

let refreshPromise: Promise<boolean> | null = null;

async function attemptSilentRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return false;
    }

    const json: ApiResponse<{ accessToken: string; refreshToken: string }> =
      await res.json();

    if (json.success && json.data) {
      setTokens(json.data.accessToken, json.data.refreshToken);
      return true;
    }

    clearTokens();
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

// ---------------------------------------------------------------------------
// Core request
// ---------------------------------------------------------------------------

async function request<T>(
  endpoint: string,
  body?: unknown,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const { skipAuth = false, params, headers: extraHeaders, ...fetchInit } = config;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  };

  // Attach auth header when available and not explicitly skipped
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = buildUrl(endpoint, params);

  const init: RequestInit = {
    ...fetchInit,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  let response: Response;

  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiError(
      `Network error: unable to reach ${BASE_URL}. Is the backend running?`,
      0,
    );
  }

  // ---- Handle 401 with silent token refresh --------------------------------
  if (response.status === 401 && !skipAuth) {
    if (!refreshPromise) {
      refreshPromise = attemptSilentRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed) {
      // Retry the original request with the fresh token
      const retryToken = getAccessToken();
      if (retryToken) {
        headers['Authorization'] = `Bearer ${retryToken}`;
      }

      try {
        response = await fetch(url, { ...init, headers });
      } catch {
        throw new ApiError(
          `Network error on retry: unable to reach ${BASE_URL}.`,
          0,
        );
      }

      if (response.ok) {
        return (await response.json()) as ApiResponse<T>;
      }
    }

    // Refresh failed or retry still returned non-2xx
    clearTokens();

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    throw new ApiError('Session expired. Please log in again.', 401);
  }

  // ---- Handle other non-2xx responses --------------------------------------
  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text().catch(() => null);
    }

    const message =
      (errorBody as { message?: string })?.message ??
      `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, errorBody);
  }

  return (await response.json()) as ApiResponse<T>;
}

// ---------------------------------------------------------------------------
// Public convenience methods
// ---------------------------------------------------------------------------

function get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
  return request<T>(endpoint, undefined, { ...config, method: 'GET' });
}

function post<T>(
  endpoint: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, body, { ...config, method: 'POST' });
}

function put<T>(
  endpoint: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, body, { ...config, method: 'PUT' });
}

function patch<T>(
  endpoint: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, body, { ...config, method: 'PATCH' });
}

function del<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
  return request<T>(endpoint, undefined, { ...config, method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Exported singleton
// ---------------------------------------------------------------------------

export const apiClient = {
  get,
  post,
  put,
  patch,
  delete: del,
} as const;
