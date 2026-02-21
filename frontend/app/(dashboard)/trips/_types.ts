import type { Trip, TripRoute } from '@/types/trip';
import type { TruckLocation } from '@/types/tracking';

// Re-export shared types for convenience
export type { Trip, TripStatus, TripRoute, RouteWaypoint } from '@/types/trip';
export type { TruckLocation, TelemetryData } from '@/types/tracking';

// --- Layout ---

export interface TripsLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

// --- Page params ---

export interface TripPageProps {
  params: Promise<{ id: string }>;
}

// --- TripForm ---

export interface TripFormProps {
  initialData?: Trip;
  isEditing?: boolean;
}

// --- TripFormDrawer ---

export interface TripFormDrawerProps {
  open: boolean;
  onClose: () => void;
}

// --- TripDetails ---

export interface TripDetailsProps {
  trip: Trip;
}

// --- TripTable ---

export interface TripTableProps {
  trips: Trip[];
  onAssignRoute?: (trip: Trip) => void;
}

// --- AssignRouteDrawer ---

export interface AssignRouteDrawerProps {
  open: boolean;
  onClose: () => void;
  trip: Trip | null;
  onAssign: (tripId: string, data: AssignRouteData) => void;
}

export interface AssignRouteData {
  routeType: 'predefined' | 'custom';
  routeTemplateId?: string;
  tripRoute: TripRoute;
  vehicleId: string;
  vehiclePlate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  turnBoyId?: string;
  turnBoyName?: string;
  turnBoyPhone?: string;
}

// --- StartTripModal ---

export interface StartTripModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (actualStartTime: string, reason?: string) => void;
}

// --- EndTripModal ---

export interface EndTripModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (actualEndTime: string, reason?: string) => void;
}

// --- FleetTracking / TrackingMap ---

export interface TrackingMapProps {
  trucks: TruckLocation[];
  selectedTruck: TruckLocation | null;
  onTruckSelect: (truck: TruckLocation) => void;
}

export interface TruckDetailsProps {
  truck: TruckLocation;
  onClose: () => void;
}

export interface MapUpdaterProps {
  center: [number, number];
}
