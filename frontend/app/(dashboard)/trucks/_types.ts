import type { LucideIcon } from 'lucide-react';

// ─── Core Entity Types ────────────────────────────────────────────────────────

/** Re-export Truck from the shared types module for domain convenience */
export type { Truck, TruckFilters } from '@/types/truck';

import type { Truck } from '@/types/truck';

// ─── Form Types ───────────────────────────────────────────────────────────────

export type FormStep = 'basic' | 'registration' | 'technical' | 'axle-tyre';

export interface TruckFormData {
  // Basic Identity
  plateNumber: string;
  make: string;
  model: string;
  yearOfManufacture: string;
  vinNumber: string;
  color: string;

  // Registration & Compliance
  insuranceExpiryDate: string;
  roadLicenceExpiryDate: string;
  inspectionExpiryDate: string;
  registrationNumber: string;

  // Technical Specifications
  fuelType: string;
  fuelTankCapacity: string;
  engineNumber: string;
  engineCapacity: string;
  transmissionType: string;
  odometerReadingAtEntry: string;

  // Axle & Tyre Configuration
  steerAxles: string;
  driveAxles: string;
  liftAxlePresent: boolean;
  twinTyresOnDrive: boolean;
}

// ─── Tyre-Related Types ───────────────────────────────────────────────────────

export interface TyrePosition {
  id: string;
  name: string;
  row: string;
  side: string;
}

export interface TyreAssignment {
  positionId: string;
  tyreId: string;
  currentTread: string;
  condition: string;
  estKilometers: string;
  notes: string;
}

export type RotationScheme = 'Standard Cross' | 'Front-to-Rear' | 'Custom';

export interface RotationItem {
  position: string;
  serial: string;
  currentTread: number;
  mountOdometer: number;
  lastRotationOdometer: number;
  newPosition: string;
}

export interface ReplacementItem {
  position: string;
  currentSerial: string;
  currentTread: number;
  kmOnTyre: number;
  replaceWith: string;
  notes: string;
}

// ─── Component Prop Types ─────────────────────────────────────────────────────

export interface AddTruckDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTruck?: Truck | null;
  onAddComplete?: () => void;
}

export interface TruckTableProps {
  trucks: Truck[];
  onView?: (truck: Truck) => void;
  onEdit?: (truck: Truck) => void;
}

export interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtext: string;
  color: string;
}

export interface BasicIdentityStepProps {
  formData: TruckFormData;
  setFormData: (data: TruckFormData) => void;
}

export interface RegistrationComplianceStepProps {
  formData: TruckFormData;
  setFormData: (data: TruckFormData) => void;
}

export interface TechnicalSpecificationsStepProps {
  formData: TruckFormData;
  setFormData: (data: TruckFormData) => void;
}

export interface AxleTyreConfigStepProps {
  formData: TruckFormData;
  setFormData: (data: TruckFormData) => void;
}

export interface TruckOverviewProps {
  truck: Truck;
}

export interface AlertCardProps {
  severity: 'high' | 'medium' | 'low';
  title: string;
  date: string;
  description: string;
}

export interface TruckTripsProps {
  truckId: string;
}

export interface TruckFuelProps {
  truckId: string;
}

export interface TruckTyresProps {
  truck: Truck;
}

export interface RotateTyresDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truck: Truck;
}

export interface ReplaceTyreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truck: Truck;
}

export interface PostReplacementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removedTyres: any[];
  truckOdometer: string;
  onComplete: () => void;
}

export interface TyreAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: TruckFormData;
  onComplete: () => void;
}

export interface AssignLaterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignNow: () => void;
  onAssignLater: () => void;
}
