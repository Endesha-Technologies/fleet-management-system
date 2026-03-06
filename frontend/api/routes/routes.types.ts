// ---------------------------------------------------------------------------
// Routes domain types
// ---------------------------------------------------------------------------
// Derived from the backend contract in routes_response.json.
// ---------------------------------------------------------------------------

// ---- Enums / union types --------------------------------------------------

export type RouteType = 'SHORT_HAUL' | 'LONG_HAUL' | 'REGIONAL' | 'INTERNATIONAL';

export type RouteStatus = 'ACTIVE' | 'INACTIVE';

// ---- Waypoint -------------------------------------------------------------

export interface Waypoint {
  lat: number;
  lng: number;
  name?: string;
}

// ---- Route Step (for suggested routes) ------------------------------------

export interface RouteStep {
  instruction: string;
  distanceKm: number;
  durationMin: number;
  wayPoints: [number, number];
}

// ---- Route ----------------------------------------------------------------

/** Route as returned by the list and create/update responses. */
export interface Route {
  id: string;
  code: string;
  name: string;
  type: RouteType;
  status: RouteStatus;
  originName: string;
  originLat: number;
  originLng: number;
  destinationName: string;
  destinationLat: number;
  destinationLng: number;
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  deviationThresholdKm: number;
  waypoints: Waypoint[] | null;
  polyline: string | null;
  speedLimitKmh: number | null;
  isAdHoc: boolean;
  notes: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Route with trip count (list response). */
export interface RouteWithCount extends Route {
  _count: {
    trips: number;
  };
}

/** Route detail with trips array. */
export interface RouteDetail extends Route {
  trips: unknown[]; // Generic until trip domain types are imported
}

// ---- Request DTOs ---------------------------------------------------------

export interface CreateRouteRequest {
  code: string;
  name: string;
  originName: string;
  originLat: number;
  originLng: number;
  destinationName: string;
  destinationLat: number;
  destinationLng: number;
  type?: RouteType;
  deviationThresholdKm?: number;
  waypoints?: Waypoint[];
  speedLimitKmh?: number;
  isAdHoc?: boolean;
  notes?: string;
}

export interface UpdateRouteRequest {
  code?: string;
  name?: string;
  originName?: string;
  originLat?: number;
  originLng?: number;
  destinationName?: string;
  destinationLat?: number;
  destinationLng?: number;
  type?: RouteType;
  status?: RouteStatus;
  deviationThresholdKm?: number;
  waypoints?: Waypoint[];
  speedLimitKmh?: number;
  isAdHoc?: boolean;
  notes?: string;
}

// ---- Suggest Route Response -----------------------------------------------

export interface ExistingRouteMatch {
  route: Route;
  originDistanceKm: number;
  destinationDistanceKm: number;
  totalScore: number;
}

export interface ORSSuggestion {
  polyline: string;
  distanceKm: number;
  durationMin: number;
  steps: RouteStep[];
}

export interface SuggestRouteResponse {
  existingRoutes: ExistingRouteMatch[];
  orsSuggestion: ORSSuggestion | null;
}

// ---- Query Params ---------------------------------------------------------

export interface SuggestRouteParams {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}
