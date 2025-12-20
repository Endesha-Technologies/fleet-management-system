export interface TruckLocation {
  tripId: string;
  vehiclePlate: string;
  driverName: string;
  latitude: number;
  longitude: number;
  speed: number; // km/h
  heading: number; // degrees (0-360, 0=North, 90=East, 180=South, 270=West)
  lastUpdate: string; // ISO timestamp
  fuelLevel?: number; // liters
  routeName: string;
  startLocation: { lat: number; lng: number; name: string };
  endLocation: { lat: number; lng: number; name: string };
  routeWaypoints: Array<{ lat: number; lng: number; timestamp: string }>; // GPS coordinates captured along the route
  startTime: string;
  eta: string;
  driverPhone?: string;
  status: 'In Progress' | 'Delayed' | 'On Time';
  currentLocation: string;
  distanceTraveled: number; // km
  distanceRemaining: number; // km
  averageSpeed: number; // km/h
  driverHours: number; // hours driven today
  cargoWeight?: number; // tons
  cargoType?: string;
  odometer: number; // total km
  engineTemp?: number; // celsius
  fuelConsumption?: number; // L/100km
  alerts?: string[];
}

export interface TelemetryData {
  speed: number;
  heading: number;
  lastUpdate: string;
}
