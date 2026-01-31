export type TyreStatus = 'in-use' | 'storage' | 'maintenance' | 'disposed';
export type TyreType = 'all-season' | 'summer' | 'winter' | 'all-terrain' | 'mud-terrain';
export type TyrePosition = 'front-left' | 'front-right' | 'rear-left' | 'rear-right' | 'spare' | 'warehouse';

export interface Tyre {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
  type: TyreType;
  size: string; // e.g., "225/65R17"
  loadIndex: string;
  speedRating: string;
  status: TyreStatus;
  
  // Location
  vehicleId?: string;
  vehiclePlate?: string;
  position?: TyrePosition;
  warehouseLocation?: string;
  
  // Purchase Info
  purchaseDate: string;
  purchaseCost: number;
  supplier: string;
  warrantyMonths?: number;
  
  // Condition & Usage
  initialTreadDepth: number; // mm
  currentTreadDepth: number; // mm
  minimumTreadDepth: number; // mm (typically 1.6mm)
  totalMileage: number; // km
  conditionRating: number; // 1-5
  
  // Dates
  installedDate?: string;
  lastInspectionDate?: string;
  nextInspectionDue?: string;
  lastRotationDate?: string;
  disposalDate?: string;
}
