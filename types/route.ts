export type RouteStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Route {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: string;
  estimatedDuration: string;
  status: RouteStatus;
  assignedDriver?: string;
  assignedVehicle?: string;
  date: string;
}
