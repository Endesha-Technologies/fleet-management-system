import { FuelLog, FuelAlert } from '@/types/fuel';

// Mock fuel logs for the past 30 days
export const MOCK_FUEL_LOGS: FuelLog[] = [
  {
    id: '1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    vehicleId: '1',
    vehiclePlate: 'UAH 123K',
    driverName: 'Patrick Okello',
    tripId: '1',
    fuelStation: 'Shell Kampala Central',
    location: 'Kampala',
    litersPurchased: 120,
    pricePerLiter: 5200,
    totalCost: 624000,
    odometerReading: 145678,
    fuelType: 'Diesel',
    paymentMethod: 'Account',
    receiptNumber: 'SHL-2025-0456',
    notes: 'Full tank before Mbarara trip',
  },
  {
    id: '2',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    vehicleId: '2',
    vehiclePlate: 'UBB 456M',
    driverName: 'Sarah Nalwanga',
    tripId: '2',
    fuelStation: 'Total Luwero',
    location: 'Luwero',
    litersPurchased: 85,
    pricePerLiter: 5150,
    totalCost: 437750,
    odometerReading: 98432,
    fuelType: 'Diesel',
    paymentMethod: 'Card',
    receiptNumber: 'TOT-2025-1234',
    notes: 'Refuel during Gulu trip',
  },
  {
    id: '3',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    vehicleId: '3',
    vehiclePlate: 'UBD 789P',
    driverName: 'Moses Kizza',
    tripId: '3',
    fuelStation: 'Stabex Jinja',
    location: 'Jinja',
    litersPurchased: 95,
    pricePerLiter: 5100,
    totalCost: 484500,
    odometerReading: 203567,
    fuelType: 'Diesel',
    paymentMethod: 'Mobile Money',
    receiptNumber: 'STB-2025-7891',
  },
  {
    id: '4',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    vehicleId: '1',
    vehiclePlate: 'UAH 123K',
    driverName: 'Patrick Okello',
    fuelStation: 'Gapco Masaka',
    location: 'Masaka',
    litersPurchased: 110,
    pricePerLiter: 5180,
    totalCost: 569800,
    odometerReading: 145234,
    fuelType: 'Diesel',
    paymentMethod: 'Account',
    receiptNumber: 'GAP-2025-3456',
  },
  {
    id: '5',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    vehicleId: '2',
    vehiclePlate: 'UBB 456M',
    driverName: 'Sarah Nalwanga',
    fuelStation: 'Shell Kampala',
    location: 'Kampala',
    litersPurchased: 118,
    pricePerLiter: 5200,
    totalCost: 613600,
    odometerReading: 98102,
    fuelType: 'Diesel',
    paymentMethod: 'Card',
    receiptNumber: 'SHL-2025-0234',
    notes: 'Full tank',
  },
  {
    id: '6',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    vehicleId: '3',
    vehiclePlate: 'UBD 789P',
    driverName: 'Moses Kizza',
    fuelStation: 'Total Mukono',
    location: 'Mukono',
    litersPurchased: 88,
    pricePerLiter: 5120,
    totalCost: 450560,
    odometerReading: 203156,
    fuelType: 'Diesel',
    paymentMethod: 'Account',
    receiptNumber: 'TOT-2025-8901',
  },
  {
    id: '7',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    vehicleId: '1',
    vehiclePlate: 'UAH 123K',
    driverName: 'Patrick Okello',
    fuelStation: 'Gapco Kampala',
    location: 'Kampala',
    litersPurchased: 115,
    pricePerLiter: 5190,
    totalCost: 596850,
    odometerReading: 144789,
    fuelType: 'Diesel',
    paymentMethod: 'Account',
    receiptNumber: 'GAP-2025-2345',
  },
  {
    id: '8',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    vehicleId: '2',
    vehiclePlate: 'UBB 456M',
    driverName: 'Sarah Nalwanga',
    fuelStation: 'Stabex Kampala',
    location: 'Kampala',
    litersPurchased: 92,
    pricePerLiter: 5100,
    totalCost: 469200,
    odometerReading: 97764,
    fuelType: 'Diesel',
    paymentMethod: 'Card',
    receiptNumber: 'STB-2025-5678',
  },
];

// Mock fuel alerts
export const MOCK_FUEL_ALERTS: FuelAlert[] = [
  {
    id: '1',
    type: 'low_efficiency',
    severity: 'medium',
    vehiclePlate: 'UBD 789P',
    message: 'Fuel efficiency dropped to 3.8 km/L (below 4 km/L threshold)',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'refuel_needed',
    severity: 'high',
    vehiclePlate: 'UBB 456M',
    message: 'Fuel level at 20L - refuel recommended before next trip',
    date: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'high_consumption',
    severity: 'low',
    vehiclePlate: 'UAH 123K',
    message: '15% increase in fuel consumption compared to last month',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper function to calculate fuel efficiency
export function calculateFuelEfficiency(logs: FuelLog[]) {
  const vehicleMap = new Map<string, {
    plate: string;
    totalLiters: number;
    totalDistance: number;
    totalCost: number;
    logs: FuelLog[];
  }>();

  // Group logs by vehicle
  logs.forEach(log => {
    if (!vehicleMap.has(log.vehicleId)) {
      vehicleMap.set(log.vehicleId, {
        plate: log.vehiclePlate,
        totalLiters: 0,
        totalDistance: 0,
        totalCost: 0,
        logs: [],
      });
    }
    const vehicle = vehicleMap.get(log.vehicleId)!;
    vehicle.totalLiters += log.litersPurchased;
    vehicle.totalCost += log.totalCost;
    vehicle.logs.push(log);
  });

  // Calculate efficiency for each vehicle
  return Array.from(vehicleMap.values()).map(vehicle => {
    // Sort logs by odometer reading
    const sortedLogs = vehicle.logs.sort((a, b) => a.odometerReading - b.odometerReading);
    const totalDistance = sortedLogs[sortedLogs.length - 1].odometerReading - sortedLogs[0].odometerReading;
    
    return {
      vehicleId: vehicle.logs[0].vehicleId,
      vehiclePlate: vehicle.plate,
      totalDistance,
      totalFuelUsed: vehicle.totalLiters,
      efficiency: totalDistance > 0 ? totalDistance / vehicle.totalLiters : 0,
      totalCost: vehicle.totalCost,
      costPerKm: totalDistance > 0 ? vehicle.totalCost / totalDistance : 0,
    };
  });
}

// Helper function to get summary statistics
export function getFuelSummary(logs: FuelLog[]) {
  const totalLiters = logs.reduce((sum, log) => sum + log.litersPurchased, 0);
  const totalCost = logs.reduce((sum, log) => sum + log.totalCost, 0);
  const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
  
  const efficiencyData = calculateFuelEfficiency(logs);
  const totalDistance = efficiencyData.reduce((sum, e) => sum + e.totalDistance, 0);
  const avgEfficiency = efficiencyData.reduce((sum, e) => sum + e.efficiency, 0) / efficiencyData.length;
  const costPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;

  return {
    totalLiters,
    totalCost,
    avgPricePerLiter,
    avgEfficiency,
    totalDistance,
    costPerKm,
    totalRefuels: logs.length,
  };
}

// Helper to format currency (UGX)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(amount);
}
