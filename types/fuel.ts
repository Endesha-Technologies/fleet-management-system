export interface FuelLog {
  id: string;
  date: string; // ISO timestamp
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  tripId?: string;
  fuelStation: string;
  location: string;
  litersPurchased: number;
  pricePerLiter: number;
  totalCost: number;
  odometerReading: number;
  fuelType: 'Petrol' | 'Diesel';
  paymentMethod: 'Cash' | 'Card' | 'Mobile Money' | 'Account';
  receiptNumber?: string;
  notes?: string;
}

export interface FuelEfficiency {
  vehicleId: string;
  vehiclePlate: string;
  totalDistance: number; // km
  totalFuelUsed: number; // liters
  efficiency: number; // km per liter
  totalCost: number;
  costPerKm: number;
}

export interface FuelReport {
  period: string; // e.g., "December 2025"
  totalLiters: number;
  totalCost: number;
  averageEfficiency: number;
  totalDistance: number;
  costPerKm: number;
  topConsumers: Array<{
    vehiclePlate: string;
    liters: number;
    cost: number;
  }>;
}

export interface FuelAlert {
  id: string;
  type: 'low_efficiency' | 'high_consumption' | 'unusual_cost' | 'refuel_needed';
  severity: 'low' | 'medium' | 'high';
  vehiclePlate: string;
  message: string;
  date: string;
}
