export type RouteStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface RouteLocation {
  name: string;
  lat: number;
  lon: number;
}

export interface Route {
  id: string;
  name: string;
  origin: RouteLocation;
  destination: RouteLocation;
  distance: string;
  estimatedDuration: string;
  deviationThreshold: number; // in meters
  status: RouteStatus;
  assignedDriver?: string;
  assignedVehicle?: string;
  createdAt: string;
}
