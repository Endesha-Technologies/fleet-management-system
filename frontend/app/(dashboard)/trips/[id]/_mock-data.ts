import type { DetailedTrip, GpsPoint } from './_types';

// ---------------------------------------------------------------------------
// Helper – generate GPS trail points between two coordinates
// ---------------------------------------------------------------------------
function interpolatePoints(
  startLat: number, startLng: number,
  endLat: number, endLng: number,
  count: number, baseSpeed: number, startOdo: number, startFuel: number,
  startTime: Date,
): GpsPoint[] {
  const points: GpsPoint[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const lat = startLat + (endLat - startLat) * t;
    const lng = startLng + (endLng - startLng) * t;
    const speed = i === 0 || i === count ? 0 : baseSpeed + (Math.random() - 0.5) * 20;
    const heading = Math.atan2(endLng - startLng, endLat - startLat) * (180 / Math.PI);
    const distStep = (Math.sqrt((endLat - startLat) ** 2 + (endLng - startLng) ** 2) * 111) / count;
    points.push({
      timestamp: new Date(startTime.getTime() + i * 30000).toISOString(), // 30s intervals
      lat: Math.round(lat * 1e6) / 1e6,
      lng: Math.round(lng * 1e6) / 1e6,
      speed: Math.round(Math.max(0, speed)),
      heading: Math.round(((heading % 360) + 360) % 360),
      odometer: Math.round(startOdo + distStep * i),
      fuelLevel: Math.round((startFuel - (i * 0.03)) * 10) / 10,
    });
  }
  return points;
}

// ---------------------------------------------------------------------------
// Dynamic dates relative to now so elapsed-time metrics always look realistic
// ---------------------------------------------------------------------------
const NOW = new Date();
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000).toISOString();
const hoursAgo = (h: number) => minutesAgo(h * 60);

// ---------------------------------------------------------------------------
// In Progress trip – Kampala → Jinja
// ---------------------------------------------------------------------------
const inProgressTrail = interpolatePoints(
  0.3136, 32.5811, // Kampala
  0.4244, 33.2041, // Jinja
  40, 72, 125430, 45.5,
  new Date(NOW.getTime() - 45 * 60_000), // started 45 min ago
);

export const MOCK_TRIP_IN_PROGRESS: DetailedTrip = {
  id: '1',
  status: 'IN_PROGRESS',
  routeId: '1',
  routeName: 'Kampala → Jinja Express',
  route: {
    originName: 'Kampala Central Depot',
    originLat: 0.3136,
    originLng: 32.5811,
    destinationName: 'Jinja Industrial Area',
    destinationLat: 0.4244,
    destinationLng: 33.2041,
    estimatedDistanceKm: 85,
    estimatedDurationMin: 90,
    speedLimitKmh: 100,
  },
  truckId: 'v1',
  truckPlate: 'UAH 123K',
  truckModel: 'Hino 500',
  driverId: 'd1',
  driverName: 'Patrick Okello',
  driverPhone: '+256 772 345 678',
  turnBoyId: 'tb1',
  turnBoyName: 'Samuel Mugisha',
  turnBoyPhone: '+256 700 111 222',
  scheduledStartTime: hoursAgo(1),
  scheduledEndTime: minutesAgo(-30), // 30 min from now
  actualStartTime: minutesAgo(45),
  odometerAtStart: 125430,
  fuelAtStartLiters: 45.5,
  dataSource: 'WIALON',
  notes: 'Priority delivery - handle with care',
  dispatcherNotes: 'Customer expects delivery by 10:00 AM',
  currentPosition: {
    lat: 0.3785,
    lng: 32.9450,
    speed: 78,
    heading: 65,
    fuelLevel: 39.2,
    odometer: 125485,
  },
  trail: inProgressTrail.slice(0, 25),
  stops: [
    {
      id: 's1',
      lat: 0.3421,
      lng: 32.7105,
      locationName: 'Mukono Fuel Station',
      stoppedAt: minutesAgo(30),
      resumedAt: minutesAgo(17),
      durationMin: 13,
      reason: 'Fuel top-up',
    },
    {
      id: 's2',
      lat: 0.3619,
      lng: 32.8510,
      locationName: 'Lugazi Town Centre',
      stoppedAt: minutesAgo(10),
      resumedAt: null,
      durationMin: null,
      reason: 'Auto-detected',
    },
  ],
  incidents: [
    {
      id: 'inc1',
      type: 'delay',
      description: 'Heavy traffic at Mukono junction',
      severity: 'MEDIUM',
      reportedAt: minutesAgo(35),
      resolvedAt: minutesAgo(22),
      source: 'MANUAL',
      lat: 0.3380,
      lng: 32.6900,
      locationName: 'Mukono Junction',
    },
  ],
  deviations: [
    {
      id: 'dev1',
      distanceOffRouteKm: 1.2,
      detectedAt: minutesAgo(15),
      lat: 0.3550,
      lng: 32.8200,
      acknowledged: false,
    },
  ],
  fuelLogs: [
    {
      id: 'fl1',
      date: minutesAgo(25),
      station: 'Shell Mukono',
      liters: 20,
      costPerLiter: 5200,
      totalCost: 104000,
      odometer: 125455,
      receiptNumber: 'REC-MK-001',
      stationLat: 0.3421,
      stationLng: 32.7105,
    },
  ],
};

// ---------------------------------------------------------------------------
// Completed trip – Kampala → Mukono
// ---------------------------------------------------------------------------
const completedTrail = interpolatePoints(
  0.3136, 32.5811,
  0.3530, 32.7555,
  30, 55, 98450, 50.0,
  new Date(NOW.getTime() - 3 * 3600_000), // completed 3h ago
);

export const MOCK_TRIP_COMPLETED: DetailedTrip = {
  id: '3',
  status: 'COMPLETED',
  routeId: '3',
  routeName: 'Kampala → Mukono Local',
  route: {
    originName: 'Kampala Central Depot',
    originLat: 0.3136,
    originLng: 32.5811,
    destinationName: 'Mukono Town Centre',
    destinationLat: 0.3530,
    destinationLng: 32.7555,
    estimatedDistanceKm: 25,
    estimatedDurationMin: 35,
    speedLimitKmh: 80,
  },
  truckId: 'v3',
  truckPlate: 'UBD 789P',
  truckModel: 'Isuzu FRR',
  driverId: 'd3',
  driverName: 'Moses Kizza',
  driverPhone: '+256 784 567 890',
  scheduledStartTime: hoursAgo(3.5),
  scheduledEndTime: hoursAgo(2.9),
  actualStartTime: hoursAgo(3),
  actualEndTime: hoursAgo(2.4),
  odometerAtStart: 98450,
  odometerAtEnd: 98475,
  fuelAtStartLiters: 50.0,
  fuelAtEndLiters: 48.5,
  distanceTraveledKm: 25,
  averageSpeedKmh: 40.5,
  durationMinutes: 37,
  dataSource: 'WIALON',
  notes: 'Delivery completed successfully. Traffic delay near Mukono.',
  trail: completedTrail,
  stops: [
    {
      id: 's3',
      lat: 0.3320,
      lng: 32.6650,
      locationName: 'Mukono Bypass Checkpoint',
      stoppedAt: hoursAgo(2.6),
      resumedAt: hoursAgo(2.5),
      durationMin: 4,
      reason: 'Police checkpoint',
    },
  ],
  incidents: [],
  deviations: [],
  fuelLogs: [],
};

// ---------------------------------------------------------------------------
// Scheduled trip – Kampala → Mbarara
// ---------------------------------------------------------------------------
export const MOCK_TRIP_SCHEDULED: DetailedTrip = {
  id: '4',
  status: 'SCHEDULED',
  routeId: '4',
  routeName: 'Kampala → Mbarara Long Haul',
  route: {
    originName: 'Kampala Central Depot',
    originLat: 0.3136,
    originLng: 32.5811,
    destinationName: 'Mbarara Distribution Hub',
    destinationLat: -0.6070,
    destinationLng: 30.6545,
    estimatedDistanceKm: 270,
    estimatedDurationMin: 270,
    speedLimitKmh: 100,
  },
  truckId: 'v4',
  truckPlate: 'UCE 321Q',
  truckModel: 'Mitsubishi Canter',
  driverId: 'd4',
  driverName: 'James Ochieng',
  driverPhone: '+256 752 678 901',
  turnBoyId: 'tb2',
  turnBoyName: 'David Ssempijja',
  turnBoyPhone: '+256 701 333 444',
  scheduledStartTime: new Date(NOW.getTime() + 2 * 3600_000).toISOString(), // 2h from now
  scheduledEndTime: new Date(NOW.getTime() + 6.5 * 3600_000).toISOString(),
  dispatcherNotes: 'Early start - ensure vehicle has full tank',
  stops: [],
  incidents: [],
  deviations: [],
  fuelLogs: [],
};

// ---------------------------------------------------------------------------
// Cancelled trip – Gulu → Kampala
// ---------------------------------------------------------------------------
export const MOCK_TRIP_CANCELLED: DetailedTrip = {
  id: '5',
  status: 'CANCELLED',
  routeId: '5',
  routeName: 'Gulu → Kampala Return',
  route: {
    originName: 'Gulu Depot',
    originLat: 2.7747,
    originLng: 32.2990,
    destinationName: 'Kampala Central Depot',
    destinationLat: 0.3136,
    destinationLng: 32.5811,
    estimatedDistanceKm: 340,
    estimatedDurationMin: 330,
    speedLimitKmh: 100,
  },
  truckId: 'v5',
  truckPlate: 'UDF 654R',
  truckModel: 'MAN TGS',
  driverId: 'd5',
  driverName: 'Grace Akello',
  driverPhone: '+256 750 987 654',
  scheduledStartTime: hoursAgo(6),
  scheduledEndTime: hoursAgo(0.5),
  cancellationReason: 'Cancelled due to road maintenance on Karuma Highway',
  notes: 'Cancelled due to road maintenance on Karuma Highway',
  stops: [],
  incidents: [],
  deviations: [],
  fuelLogs: [],
};

// ---------------------------------------------------------------------------
// Lookup helper
// ---------------------------------------------------------------------------
export const MOCK_DETAILED_TRIPS: Record<string, DetailedTrip> = {
  '1': MOCK_TRIP_IN_PROGRESS,
  '3': MOCK_TRIP_COMPLETED,
  '4': MOCK_TRIP_SCHEDULED,
  '5': MOCK_TRIP_CANCELLED,
};
