// ---------------------------------------------------------------------------
// Trip Details Page – Types
// ---------------------------------------------------------------------------

export type DetailedTripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'DELAYED' | 'COMPLETED' | 'CANCELLED';

export interface TripStop {
  id: string;
  lat: number;
  lng: number;
  locationName: string;
  stoppedAt: string; // ISO
  resumedAt: string | null; // null = still stopped
  durationMin: number | null;
  reason: string;
}

export interface TripIncident {
  id: string;
  type: 'accident' | 'breakdown' | 'weather' | 'road_closure' | 'theft' | 'delay' | 'resume' | 'other';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reportedAt: string; // ISO
  resolvedAt: string | null;
  source: 'MANUAL' | 'SYSTEM' | 'WIALON';
  lat?: number;
  lng?: number;
  locationName?: string;
  notes?: string;
}

export interface TripDeviation {
  id: string;
  distanceOffRouteKm: number;
  detectedAt: string; // ISO
  lat: number;
  lng: number;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  notes?: string;
}

export interface TripFuelLog {
  id: string;
  date: string; // ISO
  station: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometer: number;
  receiptNumber?: string;
  stationLat?: number;
  stationLng?: number;
}

export interface GpsPoint {
  timestamp: string; // ISO
  lat: number;
  lng: number;
  speed: number; // km/h
  heading: number; // degrees
  odometer: number;
  fuelLevel: number; // liters
}

export interface TripRoute {
  originName: string;
  originLat: number;
  originLng: number;
  destinationName: string;
  destinationLat: number;
  destinationLng: number;
  polyline?: string; // encoded polyline
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  speedLimitKmh?: number;
}

export interface DetailedTrip {
  id: string;
  status: DetailedTripStatus;
  routeId?: string;
  routeName: string;
  route: TripRoute;

  // Vehicle
  truckId: string;
  truckPlate: string;
  truckModel?: string;

  // Crew
  driverId: string;
  driverName: string;
  driverPhone?: string;
  turnBoyId?: string;
  turnBoyName?: string;
  turnBoyPhone?: string;

  // Schedule
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;

  // Readings
  odometerAtStart?: number;
  odometerAtEnd?: number;
  fuelAtStartLiters?: number;
  fuelAtEndLiters?: number;
  dataSource?: string;

  // Computed (for completed trips)
  distanceTraveledKm?: number;
  averageSpeedKmh?: number;
  durationMinutes?: number;

  // Notes
  notes?: string;
  dispatcherNotes?: string;
  cancellationReason?: string;

  // Related data
  stops: TripStop[];
  incidents: TripIncident[];
  deviations: TripDeviation[];
  fuelLogs: TripFuelLog[];

  // Live tracking (active trips)
  currentPosition?: { lat: number; lng: number; speed: number; heading: number; fuelLevel: number; odometer: number };
  trail?: GpsPoint[];
}

// ---------------------------------------------------------------------------
// Component Props
// ---------------------------------------------------------------------------

export interface TripHeaderProps {
  trip: DetailedTrip;
  onBack: () => void;
  onAction: (action: string) => void;
}

export interface LiveDashboardStripProps {
  trip: DetailedTrip;
}

export interface TripMapProps {
  trip: DetailedTrip;
  highlightedPoint?: { lat: number; lng: number } | null;
}

export interface TripOverviewProps {
  trip: DetailedTrip;
}

export interface TripStopsProps {
  stops: TripStop[];
  onLocate: (lat: number, lng: number) => void;
}

export interface TripIncidentsProps {
  tripId: string;
  incidents: TripIncident[];
  onReport: () => void;
  onResolve: (incidentId: string) => void;
}

export interface TripDeviationsProps {
  deviations: TripDeviation[];
  onAcknowledge: (deviationId: string) => void;
  onLocate: (lat: number, lng: number) => void;
}

export interface TripFuelLogsProps {
  fuelLogs: TripFuelLog[];
  trip: DetailedTrip;
  onLocate: (lat: number, lng: number) => void;
}

export interface TripGpsTrailProps {
  gpsPoints: GpsPoint[];
  speedLimit?: number;
}

export interface TripProgressBarProps {
  trip: DetailedTrip;
}
