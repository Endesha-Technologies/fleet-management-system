export interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  type: 'Truck' | 'Van' | 'Pickup' | 'SUV';
  status: 'Active' | 'Maintenance' | 'Inactive';
  currentOdometer?: number;
}
