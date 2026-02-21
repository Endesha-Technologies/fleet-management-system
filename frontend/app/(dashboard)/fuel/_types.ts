import { Trip } from '@/types/trip';

// ─── FuelLogForm Types ───────────────────────────────────────────────

export interface FuelLogFormData {
  date: string;
  vehiclePlate: string;
  driverName: string;
  tripId: string;
  tripName: string;
  fuelStation: string;
  location: string;
  litersPurchased: string;
  pricePerLiter: string;
  odometerReading: string;
  fuelType: string;
  paymentMethod: string;
  receiptNumber: string;
  notes: string;
  fuelStart: string;
  fuelUsed: string;
  fuelEnd: string;
}

export interface FuelLogFormProps {
  selectedTrip: Trip;
  onCancel: () => void;
  onSubmit: (data: FuelLogFormData) => void;
}

// ─── FuelTable Types ─────────────────────────────────────────────────

export type DateFilterOption = 'all' | 'today' | 'yesterday' | 'thisMonth' | 'lastMonth' | 'custom';

export interface FuelTableProps {
  logs: import('@/types/fuel').FuelLog[];
}
