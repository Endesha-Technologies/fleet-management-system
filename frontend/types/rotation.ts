export type TyrePosition = 'front-left' | 'front-right' | 'rear-left' | 'rear-right' | 'spare';

export type RotationPattern = 'cross' | 'front-to-back' | 'side-to-side' | 'custom';

export interface RotationSchedule {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleRegistration: string;
  nextDueDate: string;
  nextDueMileage: number;
  currentMileage: number;
  lastRotationDate?: string;
  rotationPattern: RotationPattern;
  intervalDays: number;
  intervalMileage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TyreMovement {
  tyreId: string;
  tyreName: string;
  fromPosition: TyrePosition;
  toPosition: TyrePosition;
  beforeTreadDepth: number;
  afterTreadDepth?: number;
  wearPercentage: number;
}

export interface RotationRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleRegistration: string;
  rotationDate: string;
  mileage: number;
  rotationPattern: RotationPattern;
  performedBy: string;
  tyreMovements: TyreMovement[];
  notes?: string;
  status: 'completed' | 'scheduled' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface RotationStats {
  totalRotations: number;
  lastRotationDate?: string;
  nextScheduledDate?: string;
  averageTreadDepth: number;
  wearVariation: number;
  vehiclesOverdue: number;
}

export interface TyreWearData {
  position: TyrePosition;
  treadDepth: number;
  wearPercentage: number;
  lastChecked: string;
  rotationCount: number;
}
