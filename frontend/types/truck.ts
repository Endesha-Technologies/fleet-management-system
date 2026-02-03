export interface Truck {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  vinNumber: string;
  color: string;
  axleConfig: string;
  currentOdometer: number;
  engineHours: number;
  fuelType: string;
  fuelTankCapacity: number;
  engineNumber: string;
  engineCapacity: number;
  transmissionType: string;
  driver: {
    id: string;
    name: string;
    licenseNumber: string;
  } | null;
  status: 'Active' | 'Maintenance' | 'Inactive';
  alerts: number;
  assignedTyres: number;
  insuranceExpiryDate?: string;
  roadLicenceExpiryDate?: string;
  inspectionExpiryDate?: string;
  registrationNumber?: string;
  odometerReadingAtEntry?: number;
}

export interface TruckFilters {
  status?: 'Active' | 'Maintenance' | 'Inactive' | 'All';
  truckType?: string;
  searchTerm?: string;
}
