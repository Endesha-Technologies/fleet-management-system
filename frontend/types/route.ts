export type RouteStatus = 'ACTIVE' | 'INACTIVE';

export type RouteType = 'SHORT_HAUL' | 'LONG_HAUL' | 'REGIONAL' | 'INTERNATIONAL';

export interface RouteLocation {
  name: string;
  lat: number;
  lon: number;
}

export interface Route {
  id: string;
  code: string;
  name: string;
  type: RouteType;
  origin: RouteLocation;
  destination: RouteLocation;
  distance: string;
  distanceKm: number;
  estimatedDuration: string;
  estimatedDurationMin: number;
  deviationThresholdKm: number;
  speedLimitKmh: number | null;
  status: RouteStatus;
  tripCount: number;
  isAdHoc: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
