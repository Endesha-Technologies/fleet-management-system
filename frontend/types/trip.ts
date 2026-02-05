export type TripStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface RouteWaypoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface TripRoute {
  type: 'predefined' | 'custom';
  routeTemplateId?: string; // If using predefined route
  origin: RouteWaypoint;
  destination: RouteWaypoint;
  waypoints?: RouteWaypoint[]; // Intermediate stops
  polyline?: string; // Encoded polyline for the route
  distance: number; // in km
  duration: number; // in minutes
}

export interface Trip {
  id: string;
  routeId: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
  distance: string;
  estimatedDuration: string;
  vehicleId: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  turnBoyId?: string;
  turnBoyName?: string;
  turnBoyPhone?: string;
  tripRoute?: TripRoute; // The actual route configuration
  status: TripStatus;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  fuelStart?: number;
  fuelEnd?: number;
  fuelConsumed?: number;
  odometerStart?: number;
  odometerEnd?: number;
  incidents?: string[];
  routeDeviations?: string;
  maintenanceIssues?: string;
  notes?: string;
  dispatcherNotes?: string;
}
