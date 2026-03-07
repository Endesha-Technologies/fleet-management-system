import { TruckLocation } from '@/types/tracking';

// Trip colors for map visualization
export const TRIP_COLORS = [
  { trail: '#3b82f6', marker: '#2563eb' }, // Blue
  { trail: '#10b981', marker: '#059669' }, // Green
  { trail: '#f59e0b', marker: '#d97706' }, // Amber
  { trail: '#8b5cf6', marker: '#7c3aed' }, // Purple
  { trail: '#ef4444', marker: '#dc2626' }, // Red
  { trail: '#06b6d4', marker: '#0891b2' }, // Cyan
] as const;

// Mock GPS data for active trucks in Uganda
export const MOCK_TRUCK_LOCATIONS: TruckLocation[] = [
  {
    tripId: '1',
    vehiclePlate: 'UAH 123K',
    driverName: 'Patrick Okello',
    latitude: -0.2500,
    longitude: 31.2000,
    speed: 65,
    heading: 220, // Southwest towards Mbarara
    lastUpdate: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    fuelLevel: 85,
    routeName: 'Kampala → Mbarara',
    startLocation: { lat: 0.3476, lng: 32.5825, name: 'Kampala' },
    endLocation: { lat: -0.6069, lng: 30.6632, name: 'Mbarara' },
    routeWaypoints: [
      { lat: -0.4000, lng: 31.0000, timestamp: new Date(Date.now() + 30 * 60 * 1000).toISOString() },
      { lat: -0.5000, lng: 30.8500, timestamp: new Date(Date.now() + 60 * 60 * 1000).toISOString() },
    ],
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    eta: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours from now
    driverPhone: '+256 772 345 678',
    status: 'On Time',
    currentLocation: 'Near Masaka',
    distanceTraveled: 135,
    distanceRemaining: 127,
    averageSpeed: 68,
    driverHours: 2.5,
    cargoWeight: 8.5,
    cargoType: 'Electronics',
    odometer: 145678,
    engineTemp: 88,
    fuelConsumption: 18.5,
    alerts: [],
  },
  {
    tripId: '2',
    vehiclePlate: 'UBB 456M',
    driverName: 'Sarah Nalwanga',
    latitude: 1.3733,
    longitude: 32.2903,
    speed: 72,
    heading: 0, // North towards Gulu
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    fuelLevel: 45,
    routeName: 'Kampala → Gulu',
    startLocation: { lat: 0.3476, lng: 32.5825, name: 'Kampala' },
    endLocation: { lat: 2.7747, lng: 32.2989, name: 'Gulu' },
    routeWaypoints: [
      { lat: 1.8000, lng: 32.3000, timestamp: new Date(Date.now() + 45 * 60 * 1000).toISOString() },
      { lat: 2.2500, lng: 32.3000, timestamp: new Date(Date.now() + 90 * 60 * 1000).toISOString() },
    ],
    startTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    eta: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    driverPhone: '+256 701 234 567',
    status: 'On Time',
    currentLocation: 'Near Luwero',
    distanceTraveled: 108,
    distanceRemaining: 225,
    averageSpeed: 72,
    driverHours: 1.5,
    cargoWeight: 12.0,
    cargoType: 'Construction Materials',
    odometer: 98432,
    engineTemp: 92,
    fuelConsumption: 22.3,
    alerts: ['Low fuel - refuel recommended'],
  },
];

// Helper function to get heading direction name
export function getHeadingDirection(heading: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(heading / 45) % 8;
  return directions[index];
}

// Helper function to format time ago
export function getTimeAgo(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = now - then;
  
  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
