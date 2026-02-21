// ---------------------------------------------------------------------------
// Generic API types shared across every service
// ---------------------------------------------------------------------------

/**
 * Standard response envelope returned by every backend endpoint.
 *
 * ```json
 * { "success": true, "message": "...", "data": { … } }
 * ```
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/** Pagination metadata returned by list endpoints. */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Paginated list payload: `data` array + `pagination` metadata. */
export interface PaginatedData<T> {
  data: T[];
  pagination: Pagination;
}

/** Common query parameters accepted by paginated list endpoints. */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

/**
 * Structured error thrown by the API client for non-2xx responses and
 * network failures. Extends `Error` so it can be caught with normal
 * `try / catch` semantics.
 */
export class ApiError extends Error {
  /** HTTP status code (e.g. 401, 500). `0` for network-level errors. */
  public readonly status: number;

  /** Raw response body when the server returned one. */
  public readonly body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}
