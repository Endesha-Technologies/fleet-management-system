// ---------------------------------------------------------------------------
// Routes domain – public barrel
// ---------------------------------------------------------------------------

export { routesService } from './routes.service';
export type { RouteListParams } from './routes.service';

export type {
  // Enums / unions
  RouteType,
  RouteStatus,

  // Entities
  Waypoint,
  RouteStep,
  Route,
  RouteWithCount,
  RouteDetail,

  // Request DTOs
  CreateRouteRequest,
  UpdateRouteRequest,

  // Suggest Route
  ExistingRouteMatch,
  ORSSuggestion,
  SuggestRouteResponse,
  SuggestRouteParams,
} from './routes.types';
