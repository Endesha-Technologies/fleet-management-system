// ---------------------------------------------------------------------------
// Routes service
// ---------------------------------------------------------------------------

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { PaginatedData, PaginationParams } from '../types';
import type {
  Route,
  RouteWithCount,
  RouteDetail,
  CreateRouteRequest,
  UpdateRouteRequest,
  SuggestRouteResponse,
  SuggestRouteParams,
} from './routes.types';

// ---------------------------------------------------------------------------
// Query params specific to the routes list
// ---------------------------------------------------------------------------

export interface RouteListParams extends PaginationParams {
  status?: string;
  type?: string;
}

// ---------------------------------------------------------------------------
// Service methods
// ---------------------------------------------------------------------------

/** Fetch a paginated list of routes. */
async function getRoutes(
  params?: RouteListParams,
): Promise<PaginatedData<RouteWithCount>> {
  const res = await apiClient.get<PaginatedData<RouteWithCount>>(
    ENDPOINTS.ROUTES.LIST,
    { params: params as Record<string, string | number | boolean | undefined> },
  );
  return res.data;
}

/** Fetch a single route by ID (includes trips). */
async function getRouteById(id: string): Promise<RouteDetail> {
  const res = await apiClient.get<RouteDetail>(ENDPOINTS.ROUTES.DETAIL(id));
  return res.data;
}

/** Create a new route. */
async function createRoute(data: CreateRouteRequest): Promise<Route> {
  const res = await apiClient.post<Route>(ENDPOINTS.ROUTES.CREATE, data);
  return res.data;
}

/** Update an existing route (full or partial). */
async function updateRoute(
  id: string,
  data: UpdateRouteRequest,
): Promise<Route> {
  const res = await apiClient.put<Route>(ENDPOINTS.ROUTES.UPDATE(id), data);
  return res.data;
}

/** Deactivate a route (set status to INACTIVE). */
async function deactivateRoute(id: string): Promise<Route> {
  const res = await apiClient.patch<Route>(ENDPOINTS.ROUTES.DEACTIVATE(id));
  return res.data;
}

/** Activate a route (set status to ACTIVE). */
async function activateRoute(id: string): Promise<Route> {
  const res = await apiClient.patch<Route>(ENDPOINTS.ROUTES.ACTIVATE(id));
  return res.data;
}

/** Suggest routes based on origin and destination coordinates. */
async function suggestRoute(
  params: SuggestRouteParams,
): Promise<SuggestRouteResponse> {
  const res = await apiClient.get<SuggestRouteResponse>(
    ENDPOINTS.ROUTES.SUGGEST,
    { params: params as unknown as Record<string, string | number | boolean | undefined> },
  );
  return res.data;
}

/** Recalculate route polyline and distance/duration estimates. */
async function recalculateRoute(id: string): Promise<Route> {
  const res = await apiClient.post<Route>(ENDPOINTS.ROUTES.RECALCULATE(id));
  return res.data;
}

// ---------------------------------------------------------------------------
// Export service object
// ---------------------------------------------------------------------------

export const routesService = {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deactivateRoute,
  activateRoute,
  suggestRoute,
  recalculateRoute,
};
