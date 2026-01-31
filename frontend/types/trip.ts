export type TripStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

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
