import type { Route } from '@/types/route';

// Re-export domain types for convenience
export type { Route, RouteLocation, RouteStatus } from '@/types/route';

// ---------- Shared ----------

export interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

export interface RouteFormData {
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

export interface CreateRouteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (routeData: RouteFormData) => void;
}

export interface EditRouteDrawerProps {
  route: Route | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (routeData: Route) => void;
}

export interface DeleteRouteDialogProps {
  route: Route | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (route: Route) => void;
}

export interface RouteTableProps {
  routes: Route[];
  onViewRoute?: (route: Route) => void;
  onEditRoute?: (route: Route) => void;
  onDeleteRoute?: (route: Route) => void;
}

export interface RouteCardProps {
  route: Route;
  onViewRoute?: (route: Route) => void;
  onEditRoute?: (route: Route) => void;
  onDeleteRoute?: (route: Route) => void;
}

export interface RouteDetailsProps {
  route: Route;
}

export interface RouteDetailsDrawerProps {
  route: Route | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (route: Route) => void;
  onDelete?: (route: Route) => void;
}
