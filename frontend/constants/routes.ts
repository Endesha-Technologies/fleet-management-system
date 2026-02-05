import { Route } from '@/types/route';

export const MOCK_ROUTES: Route[] = [
  {
    id: '1',
    name: 'Kampala to Jinja Express',
    origin: {
      name: 'Kampala, Uganda',
      lat: 0.3476,
      lon: 32.5825,
    },
    destination: {
      name: 'Jinja, Uganda',
      lat: 0.4244,
      lon: 33.2041,
    },
    distance: '80 km',
    estimatedDuration: '1h 30m',
    deviationThreshold: 500,
    status: 'In Progress',
    createdAt: '2025-12-13',
  },
  {
    id: '2',
    name: 'Kampala to Entebbe Airport',
    origin: {
      name: 'Kampala Central, Uganda',
      lat: 0.3136,
      lon: 32.5811,
    },
    destination: {
      name: 'Entebbe International Airport',
      lat: 0.0424,
      lon: 32.4435,
    },
    distance: '40 km',
    estimatedDuration: '45m',
    deviationThreshold: 300,
    status: 'Scheduled',
    createdAt: '2025-12-13',
  },
  {
    id: '3',
    name: 'Kampala to Mbarara Route',
    origin: {
      name: 'Kampala, Uganda',
      lat: 0.3476,
      lon: 32.5825,
    },
    destination: {
      name: 'Mbarara, Uganda',
      lat: -0.6072,
      lon: 30.6545,
    },
    distance: '270 km',
    estimatedDuration: '4h 30m',
    deviationThreshold: 1000,
    status: 'Completed',
    createdAt: '2025-12-12',
  },
  {
    id: '4',
    name: 'Kampala to Gulu Northern',
    origin: {
      name: 'Kampala, Uganda',
      lat: 0.3476,
      lon: 32.5825,
    },
    destination: {
      name: 'Gulu, Uganda',
      lat: 2.7746,
      lon: 32.2990,
    },
    distance: '340 km',
    estimatedDuration: '5h 45m',
    deviationThreshold: 500,
    status: 'Scheduled',
    createdAt: '2025-12-14',
  },
  {
    id: '5',
    name: 'Kampala to Mbale Eastern',
    origin: {
      name: 'Kampala, Uganda',
      lat: 0.3476,
      lon: 32.5825,
    },
    destination: {
      name: 'Mbale, Uganda',
      lat: 1.0647,
      lon: 34.1797,
    },
    distance: '225 km',
    estimatedDuration: '4h',
    deviationThreshold: 500,
    status: 'Cancelled',
    createdAt: '2025-12-11',
  },
];
