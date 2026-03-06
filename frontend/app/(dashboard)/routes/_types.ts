import type { Route } from '@/types/route';

// Re-export domain types for convenience
export type { Route, RouteLocation, RouteStatus, RouteType } from '@/types/route';

// ---------- Shared ----------

export interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

// Note: RouteFormData is now defined in RouteFormFields.tsx for the API-aligned form
// This legacy version is kept for backward compatibility
export interface LegacyRouteFormData {
  name: string;
  origin: string;
  originLat: number | null;
  originLon: number | null;
  destination: string;
  destinationLat: number | null;
  destinationLon: number | null;
  distance: string;
  duration: string;
  deviationThreshold: string;
}

// ---------- Page props ----------

export interface RoutePageProps {
  params: Promise<{ id: string }>;
}

// ---------- Component props ----------

export interface RouteFormProps {
  initialData?: Route;
  isEditing?: boolean;
}

// Updated to match new API-aligned components
export interface CreateRouteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface EditRouteDrawerProps {
  route: Route | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface ToggleRouteStatusDialogProps {
  route: Route | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Alias for backward compatibility
export type DeleteRouteDialogProps = ToggleRouteStatusDialogProps;

export interface RouteTableProps {
  routes: Route[];
  onViewRoute?: (route: Route) => void;
  onEditRoute?: (route: Route) => void;
  onToggleStatus?: (route: Route) => void;
}

export interface RouteCardProps {
  route: Route;
  onViewRoute?: (route: Route) => void;
  onEditRoute?: (route: Route) => void;
  onToggleStatus?: (route: Route) => void;
}

export interface RouteDetailsProps {
  route: Route;
}

export interface RouteDetailsDrawerProps {
  route: Route | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (route: Route) => void;
  onToggleStatus?: (route: Route) => void;
}
