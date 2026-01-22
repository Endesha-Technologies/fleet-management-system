import { TruckLocation } from '@/types/tracking';

// Mock GPS data for active trucks in Uganda
export const MOCK_TRUCK_LOCATIONS: TruckLocation[] = [
  {
    tripId: '1',
    vehiclePlate: 'UAH 123K',
    driverName: 'Patrick Okello',
    latitude: 0.3476,
    longitude: 32.5825,
    speed: 65,
    heading: 180, // South
    lastUpdate: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    fuelLevel: 85,
    routeName: 'Kampala → Mbarara',
    startLocation: { lat: 0.3476, lng: 32.5825, name: 'Kampala' },
    endLocation: { lat: -0.6069, lng: 30.6632, name: 'Mbarara' },
    routeWaypoints: [
      { lat: 0.3476, lng: 32.5825, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { lat: 0.1500, lng: 32.4000, timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() },
      { lat: 0.0000, lng: 31.8000, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      { lat: -0.2500, lng: 31.2000, timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString() },
      { lat: 0.3476, lng: 32.5825, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() }, // Current position
    ],
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    eta: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
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
    heading: 0, // North
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    fuelLevel: 45,
    routeName: 'Kampala → Gulu',
    startLocation: { lat: 0.3476, lng: 32.5825, name: 'Kampala' },
    endLocation: { lat: 2.7747, lng: 32.2989, name: 'Gulu' },
    routeWaypoints: [
      { lat: 0.3476, lng: 32.5825, timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() },
      { lat: 0.7000, lng: 32.4500, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      { lat: 1.0000, lng: 32.3700, timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString() },
      { lat: 1.3733, lng: 32.2903, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() }, // Current
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
  {
    tripId: '3',
    vehiclePlate: 'UBD 789P',
    driverName: 'Moses Kizza',
    latitude: 0.4241,
    longitude: 33.2039,
    speed: 0,
    heading: 90, // East
    lastUpdate: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    fuelLevel: 20,
    routeName: 'Jinja → Kampala',
    startLocation: { lat: 0.4241, lng: 33.2039, name: 'Jinja' },
    endLocation: { lat: 0.3476, lng: 32.5825, name: 'Kampala' },
    routeWaypoints: [
      { lat: 0.4241, lng: 33.2039, timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      { lat: 0.4000, lng: 33.0000, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { lat: 0.3800, lng: 32.8000, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      { lat: 0.4241, lng: 33.2039, timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() }, // Current (stopped)
    ],
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    eta: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    driverPhone: '+256 784 567 890',
    status: 'Delayed',
    currentLocation: 'Stopped at Jinja',
    distanceTraveled: 84,
    distanceRemaining: 82,
    averageSpeed: 28,
    driverHours: 3.0,
    cargoWeight: 15.5,
    cargoType: 'Food Supplies',
    odometer: 203567,
    engineTemp: 72,
    fuelConsumption: 19.8,
    alerts: ['Vehicle stopped for 15+ mins', 'Critical: Low fuel level', 'Behind schedule by 45 mins'],
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
