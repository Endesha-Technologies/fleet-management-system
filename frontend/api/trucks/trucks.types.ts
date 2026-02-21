// ---------------------------------------------------------------------------
// Trucks domain types
// ---------------------------------------------------------------------------
// Derived from the backend contract in truck_response.json.
// ---------------------------------------------------------------------------

import type { ApiResponse, PaginatedData } from '../types';

// ---- Enums / union types --------------------------------------------------

export type BodyType =
  | 'RIGID'
  | 'TRACTOR'
  | 'TRAILER'
  | 'TANKER'
  | 'FLATBED'
  | 'TIPPER'
  | 'REFRIGERATED'
  | 'CURTAIN_SIDE'
  | 'BOX_BODY'
  | 'LOW_LOADER';

export type FuelType = 'DIESEL' | 'PETROL' | 'CNG' | 'LNG';

export type TransmissionType = 'MANUAL' | 'AUTOMATIC' | 'AMT';

export type DriveType =
  | 'FOUR_BY_TWO'
  | 'SIX_BY_TWO'
  | 'SIX_BY_FOUR'
  | 'EIGHT_BY_FOUR';

export type OwnershipType = 'OWNED' | 'LEASED' | 'RENTED';

export type TruckStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'IN_MAINTENANCE'
  | 'DECOMMISSIONED';

export type AxleType = 'STEER' | 'DRIVE';

export type TyrePositionSide = 'LEFT' | 'RIGHT';

export type TyrePositionSlot = 'OUTER' | 'INNER';

export type TyrePositionStatus = 'EMPTY' | 'OCCUPIED';

// ---- Nested entities ------------------------------------------------------

/** Tyre position within an axle (returned in detail view). */
export interface TyrePosition {
  id: string;
  truckId: string;
  axleConfigId: string;
  positionCode: string;
  side: TyrePositionSide;
  slot: TyrePositionSlot;
  status: TyrePositionStatus;
  currentTyreId: string | null;
  currentTyre: unknown | null; // Generic until tyre domain types are defined
  createdAt: string;
  updatedAt: string;
}

/** Axle configuration. In list responses `tyrePositions` is omitted. */
export interface TruckAxle {
  id: string;
  truckId: string;
  axleName: string;
  axleType: AxleType;
  axleIndex: number;
  positionsPerSide: number;
  tyreSize: string;
  maxLoadKg: number;
  tyrePositions?: TyrePosition[];
}

/** Abbreviated user reference (creator / updater). */
export interface UserRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/** Relation counts attached to the truck via `_count`. */
export interface TruckCounts {
  assetInstallations: number;
  trips: number;
  fuelLogs: number;
  maintenancePlans: number;
  serviceLogs: number;
  documents: number;
}

// ---- Truck ----------------------------------------------------------------

/** Truck as returned by the list and create/update responses. */
export interface Truck {
  id: string;

  // Identity
  fleetNumber: string | null;
  make: string;
  model: string;
  year: number;
  color: string | null;
  bodyType: BodyType;

  // Registration & compliance
  registrationNumber: string;
  vin: string | null;
  engineNumber: string | null;
  registrationDate: string | null;
  registrationExpiry: string | null;
  insurancePolicyNumber: string | null;
  insuranceProvider: string | null;
  insuranceExpiry: string | null;
  inspectionExpiry: string | null;
  operatingLicenseNumber: string | null;
  operatingLicenseExpiry: string | null;

  // Technical
  fuelType: FuelType;
  engineCapacityCc: number | null;
  horsepower: number | null;
  transmissionType: TransmissionType | null;
  numberOfGears: number | null;
  driveType: DriveType | null;
  grossVehicleMass: number | null;
  tareWeight: number | null;
  payloadCapacity: number | null;
  tankCapacityLiters: number | null;
  adBlueTankLiters: number | null;

  // Dimensions (mm)
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  wheelbaseMm: number | null;
  fifthWheelHeight: number | null;

  // Operational
  currentOdometer: number;
  engineHours: number;
  status: TruckStatus;
  homeDepot: string | null;
  assignedDriverId: string | null;
  wialonUnitId: string | null;

  // Purchase
  purchaseDate: string | null;
  purchasePrice: number | null;
  purchasedFrom: string | null;
  ownershipType: OwnershipType | null;

  // Misc
  notes: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  truckAxles: TruckAxle[];
  creator: UserRef;
  updater: UserRef;
  _count: TruckCounts;
}

/**
 * Truck detail returns additional nested relations not present in list views:
 * `documents`, `assetInstallations`, `maintenancePlans`, plus a reduced `_count`.
 */
export interface TruckDetail extends Truck {
  documents: unknown[];
  assetInstallations: unknown[];
  maintenancePlans: unknown[];
}

// ---- Axle config input (for create / update) ------------------------------

export interface AxleConfigInput {
  axleName: string;
  axleIndex: number;
  axleType: AxleType;
  positionsPerSide?: number;
  tyreSize?: string;
  maxLoadKg?: number;
}

// ---- Request payloads -----------------------------------------------------

export interface CreateTruckRequest {
  // Identity
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  fleetNumber?: string;
  color?: string;
  bodyType?: BodyType;

  // Registration & compliance
  vin?: string;
  engineNumber?: string;
  registrationDate?: string;
  registrationExpiry?: string;
  insurancePolicyNumber?: string;
  insuranceProvider?: string;
  insuranceExpiry?: string;
  inspectionExpiry?: string;
  operatingLicenseNumber?: string;
  operatingLicenseExpiry?: string;

  // Technical
  fuelType?: FuelType;
  engineCapacityCc?: number;
  horsepower?: number;
  transmissionType?: TransmissionType;
  numberOfGears?: number;
  driveType?: DriveType;
  grossVehicleMass?: number;
  tareWeight?: number;
  payloadCapacity?: number;
  tankCapacityLiters?: number;
  adBlueTankLiters?: number;

  // Dimensions (mm)
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  fifthWheelHeight?: number;

  // Operational
  currentOdometer?: number;
  engineHours?: number;
  homeDepot?: string;
  assignedDriverId?: string;
  wialonUnitId?: string;

  // Purchase
  purchaseDate?: string;
  purchasePrice?: number;
  purchasedFrom?: string;
  ownershipType?: OwnershipType;

  // Notes
  notes?: string;

  // Axle configuration
  axleConfig?: AxleConfigInput[];
}

/** All fields optional — send only what changes. */
export type UpdateTruckRequest = Partial<CreateTruckRequest>;

export interface UpdateTruckStatusRequest {
  status: TruckStatus;
}

// ---- Fleet overview -------------------------------------------------------

export interface FleetMakeCount {
  make: string;
  count: number;
}

export interface FleetBodyTypeCount {
  bodyType: BodyType;
  count: number;
}

export interface FleetOverview {
  totalTrucks: number;
  byStatus: Record<TruckStatus, number>;
  byMake: FleetMakeCount[];
  byBodyType: FleetBodyTypeCount[];
}

// ---- Compliance alerts ----------------------------------------------------

export type ComplianceAlertType =
  | 'registration'
  | 'insurance'
  | 'inspection'
  | 'operatingLicense';

export type ComplianceAlertStatus = 'expired' | 'expiring_soon';

export interface ComplianceAlert {
  truckId: string;
  registrationNumber: string;
  fleetNumber: string | null;
  type: ComplianceAlertType;
  expiryDate: string;
  status: ComplianceAlertStatus;
  daysRemaining: number;
}

export interface ComplianceAlertsSummary {
  expiredCount: number;
  expiringSoonCount: number;
  totalAlerts: number;
}

export interface ComplianceAlertsData {
  summary: ComplianceAlertsSummary;
  expired: ComplianceAlert[];
  expiringSoon: ComplianceAlert[];
}

export interface ComplianceAlertsParams {
  warningDays?: number;
}

// ---- Response aliases -----------------------------------------------------

export type TruckListResponse = ApiResponse<PaginatedData<Truck>>;
export type TruckDetailResponse = ApiResponse<TruckDetail>;
export type CreateTruckResponse = ApiResponse<Truck>;
export type UpdateTruckResponse = ApiResponse<Truck>;
export type DeleteTruckResponse = ApiResponse<null>;
export type UpdateTruckStatusResponse = ApiResponse<Truck>;
export type FleetOverviewResponse = ApiResponse<FleetOverview>;
export type ComplianceAlertsResponse = ApiResponse<ComplianceAlertsData>;
