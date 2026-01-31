import { Vehicle } from '@/types/vehicle';

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    plateNumber: 'KBA 123A',
    make: 'Isuzu',
    model: 'FRR',
    year: 2022,
    type: 'Truck',
    status: 'Active',
    currentOdometer: 125430,
  },
  {
    id: 'v2',
    plateNumber: 'KBC 456B',
    make: 'Toyota',
    model: 'Hilux',
    year: 2021,
    type: 'Pickup',
    status: 'Active',
    currentOdometer: 87650,
  },
  {
    id: 'v3',
    plateNumber: 'KBD 789C',
    make: 'Mercedes-Benz',
    model: 'Sprinter',
    year: 2023,
    type: 'Van',
    status: 'Active',
    currentOdometer: 98458,
  },
  {
    id: 'v4',
    plateNumber: 'KBE 234D',
    make: 'Scania',
    model: 'R450',
    year: 2022,
    type: 'Truck',
    status: 'Active',
    currentOdometer: 156780,
  },
  {
    id: 'v5',
    plateNumber: 'KBF 567E',
    make: 'Nissan',
    model: 'Navara',
    year: 2020,
    type: 'Pickup',
    status: 'Active',
    currentOdometer: 134560,
  },
  {
    id: 'v6',
    plateNumber: 'KBG 890F',
    make: 'MAN',
    model: 'TGX',
    year: 2021,
    type: 'Truck',
    status: 'Maintenance',
    currentOdometer: 178900,
  },
];

// Export alias for backward compatibility
export const VEHICLES = MOCK_VEHICLES;
