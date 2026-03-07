import type { LucideIcon } from 'lucide-react';
import type {
  Truck as ApiTruck,
  TruckDetail,
  CreateTruckRequest,
  UpdateTruckRequest,
  AxleConfigInput,
  BodyType,
  FuelType,
  TransmissionType,
  DriveType,
  OwnershipType,
} from '@/api/trucks/trucks.types';
import type { TruckTyrePositionsData } from '@/api/tyres/tyres.types';
import type { TruckMaintenanceHistoryData } from '@/api/maintenance/maintenance.types';

// ─── Core Entity Types ────────────────────────────────────────────────────────

/** Re-export the API Truck type for convenience within this domain. */
export type { Truck, TruckDetail } from '@/api/trucks/trucks.types';

// ─── Form Types ───────────────────────────────────────────────────────────────

export type FormStep = 'identity' | 'compliance' | 'technical' | 'axle-tyre';

export const FORM_STEPS: { key: FormStep; label: string }[] = [
  { key: 'identity', label: 'Vehicle Identity' },
  { key: 'compliance', label: 'Registration & Compliance' },
  { key: 'technical', label: 'Technical & Operational' },
  { key: 'axle-tyre', label: 'Axle & Tyre Configuration' },
];

// ─── Dropdown Options ─────────────────────────────────────────────────────────

export const BODY_TYPE_OPTIONS: { value: BodyType; label: string }[] = [
  { value: 'TRACTOR', label: 'Tractor' },
  { value: 'RIGID', label: 'Rigid' },
  { value: 'TRAILER', label: 'Trailer' },
  { value: 'TANKER', label: 'Tanker' },
  { value: 'FLATBED', label: 'Flatbed' },
  { value: 'TIPPER', label: 'Tipper' },
  { value: 'REFRIGERATED', label: 'Refrigerated' },
  { value: 'CURTAIN_SIDE', label: 'Curtain Side' },
  { value: 'BOX_BODY', label: 'Box Body' },
  { value: 'LOW_LOADER', label: 'Low Loader' },
];

export const FUEL_TYPE_OPTIONS: { value: FuelType; label: string }[] = [
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'PETROL', label: 'Petrol' },
  { value: 'CNG', label: 'CNG' },
  { value: 'LNG', label: 'LNG' },
];

export const TRANSMISSION_OPTIONS: { value: TransmissionType; label: string }[] = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'AUTOMATIC', label: 'Automatic' },
  { value: 'AMT', label: 'AMT (Automated Manual)' },
];

export const DRIVE_TYPE_OPTIONS: { value: DriveType; label: string }[] = [
  { value: 'FOUR_BY_TWO', label: '4×2' },
  { value: 'SIX_BY_TWO', label: '6×2' },
  { value: 'SIX_BY_FOUR', label: '6×4' },
  { value: 'EIGHT_BY_FOUR', label: '8×4' },
];

export const OWNERSHIP_OPTIONS: { value: OwnershipType; label: string }[] = [
  { value: 'OWNED', label: 'Owned' },
  { value: 'LEASED', label: 'Leased' },
  { value: 'RENTED', label: 'Rented' },
];

// ─── Axle Configuration ───────────────────────────────────────────────────────

export type AxleType = 'STEER' | 'DRIVE';

export const AXLE_TYPE_OPTIONS: { value: AxleType; label: string }[] = [
  { value: 'STEER', label: 'Steer' },
  { value: 'DRIVE', label: 'Drive' },
];

export const POSITIONS_PER_SIDE_OPTIONS = [
  { value: '1', label: '1 (Single)' },
  { value: '2', label: '2 (Dual)' },
];

export interface AxleConfig {
  /** Client-side unique key for React list rendering. */
  key: string;
  /** Human-readable name, e.g. "Front Steer", "Rear Drive 1". */
  name: string;
  /** Axle type determines position naming conventions. String (not AxleType) so form starts empty. */
  type: string;
  /** Number of tyre positions per side (left/right). Total = positionsPerSide × 2. */
  positionsPerSide: string;
  /** Tyre size spec, e.g. "295/80R22.5". */
  tyreSize: string;
  /** Maximum load in kilograms. */
  maxLoad: string;
}

/** Creates a blank axle with a unique key. All fields start empty so the user fills them in. */
export function createDefaultAxle(): AxleConfig {
  return {
    key: crypto.randomUUID(),
    name: '',
    type: '',
    positionsPerSide: '',
    tyreSize: '',
    maxLoad: '',
  };
}

// ─── Truck Form Data ──────────────────────────────────────────────────────────
// All fields are strings so they bind directly to HTML inputs.
// Converted to the API's CreateTruckRequest via buildCreateTruckRequest().
// ─────────────────────────────────────────────────────────────────────────────

export interface TruckFormData {
  // Step 1: Vehicle Identity
  make: string;
  model: string;
  year: string;
  registrationNumber: string;
  fleetNumber: string;
  color: string;
  bodyType: string;

  // Step 2: Registration & Compliance
  vin: string;
  engineNumber: string;
  registrationDate: string;
  registrationExpiry: string;
  insurancePolicyNumber: string;
  insuranceProvider: string;
  insuranceExpiry: string;
  inspectionExpiry: string;
  operatingLicenseNumber: string;
  operatingLicenseExpiry: string;

  // Step 3: Technical & Operational
  wialonUnitId: string;
  fuelType: string;
  tankCapacityLiters: string;
  engineCapacityCc: string;
  horsepower: string;
  transmissionType: string;
  numberOfGears: string;
  driveType: string;
  grossVehicleMass: string;
  tareWeight: string;
  payloadCapacity: string;
  currentOdometer: string;
  engineHours: string;
  ownershipType: string;
  purchaseDate: string;
  purchasePrice: string;
  purchasedFrom: string;
  notes: string;

  // Step 4: Axle Configuration
  axles: AxleConfig[];
}

export const EMPTY_TRUCK_FORM: TruckFormData = {
  make: '',
  model: '',
  year: '',
  registrationNumber: '',
  fleetNumber: '',
  color: '',
  bodyType: '',
  vin: '',
  engineNumber: '',
  registrationDate: '',
  registrationExpiry: '',
  insurancePolicyNumber: '',
  insuranceProvider: '',
  insuranceExpiry: '',
  inspectionExpiry: '',
  operatingLicenseNumber: '',
  operatingLicenseExpiry: '',
  wialonUnitId: '',
  fuelType: 'DIESEL',
  tankCapacityLiters: '',
  engineCapacityCc: '',
  horsepower: '',
  transmissionType: '',
  numberOfGears: '',
  driveType: '',
  grossVehicleMass: '',
  tareWeight: '',
  payloadCapacity: '',
  currentOdometer: '',
  engineHours: '',
  ownershipType: '',
  purchaseDate: '',
  purchasePrice: '',
  purchasedFrom: '',
  notes: '',
  axles: [createDefaultAxle()],
};

// ─── Form → API Conversion ──────────────────────────────────────────────────

function optionalStr(v: string): string | undefined {
  return v.trim() || undefined;
}

function optionalInt(v: string): number | undefined {
  const n = parseInt(v, 10);
  return isNaN(n) ? undefined : n;
}

function optionalFloat(v: string): number | undefined {
  const n = parseFloat(v);
  return isNaN(n) ? undefined : n;
}

/** Convert the client-side form data into the API request payload. */
export function buildCreateTruckRequest(form: TruckFormData): CreateTruckRequest {
  const req: CreateTruckRequest = {
    // Required fields
    make: form.make.trim(),
    model: form.model.trim(),
    year: parseInt(form.year, 10),
    registrationNumber: form.registrationNumber.trim(),
  };

  // Identity (optional)
  if (form.fleetNumber.trim()) req.fleetNumber = form.fleetNumber.trim();
  if (form.color.trim()) req.color = form.color.trim();
  if (form.bodyType) req.bodyType = form.bodyType as BodyType;

  // Registration & Compliance
  if (form.vin.trim()) req.vin = form.vin.trim();
  if (form.engineNumber.trim()) req.engineNumber = form.engineNumber.trim();
  req.registrationDate = optionalStr(form.registrationDate);
  req.registrationExpiry = optionalStr(form.registrationExpiry);
  req.insurancePolicyNumber = optionalStr(form.insurancePolicyNumber);
  req.insuranceProvider = optionalStr(form.insuranceProvider);
  req.insuranceExpiry = optionalStr(form.insuranceExpiry);
  req.inspectionExpiry = optionalStr(form.inspectionExpiry);
  req.operatingLicenseNumber = optionalStr(form.operatingLicenseNumber);
  req.operatingLicenseExpiry = optionalStr(form.operatingLicenseExpiry);

  // Wialon tracking
  req.wialonUnitId = optionalStr(form.wialonUnitId);

  // Technical
  if (form.fuelType) req.fuelType = form.fuelType as FuelType;
  req.tankCapacityLiters = optionalInt(form.tankCapacityLiters);
  req.engineCapacityCc = optionalInt(form.engineCapacityCc);
  req.horsepower = optionalInt(form.horsepower);
  if (form.transmissionType) req.transmissionType = form.transmissionType as TransmissionType;
  req.numberOfGears = optionalInt(form.numberOfGears);
  if (form.driveType) req.driveType = form.driveType as DriveType;
  req.grossVehicleMass = optionalFloat(form.grossVehicleMass);
  req.tareWeight = optionalFloat(form.tareWeight);
  req.payloadCapacity = optionalFloat(form.payloadCapacity);
  req.currentOdometer = optionalInt(form.currentOdometer);
  req.engineHours = optionalInt(form.engineHours);
  if (form.ownershipType) req.ownershipType = form.ownershipType as OwnershipType;
  req.purchaseDate = optionalStr(form.purchaseDate);
  req.purchasePrice = optionalFloat(form.purchasePrice);
  req.purchasedFrom = optionalStr(form.purchasedFrom);
  req.notes = optionalStr(form.notes);

  // Axle configuration
  if (form.axles.length > 0) {
    req.axleConfig = form.axles.map<AxleConfigInput>((axle, index) => ({
      axleName: axle.name.trim() || `Axle ${index + 1}`,
      axleIndex: index,
      axleType: axle.type as AxleType,
      positionsPerSide: parseInt(axle.positionsPerSide, 10) || 1,
      tyreSize: optionalStr(axle.tyreSize),
      maxLoadKg: optionalInt(axle.maxLoad),
    }));
  }

  return req;
}

/**
 * Compare two TruckFormData snapshots and return only the fields that changed,
 * converted to the API's UpdateTruckRequest format (Partial<CreateTruckRequest>).
 * Returns an empty object when nothing has changed.
 */
export function buildUpdateTruckRequest(
  original: TruckFormData,
  current: TruckFormData,
): UpdateTruckRequest {
  const req: UpdateTruckRequest = {};

  // Helper: include a field only when the raw form string has changed
  function ifChanged<K extends keyof UpdateTruckRequest>(
    field: keyof TruckFormData,
    apiKey: K,
    convert: (v: string) => UpdateTruckRequest[K],
  ) {
    if ((original[field] as string) !== (current[field] as string)) {
      req[apiKey] = convert(current[field] as string);
    }
  }

  // ── Required string fields (use .trim()) ────────────────────────────────
  ifChanged('make', 'make', (v) => v.trim());
  ifChanged('model', 'model', (v) => v.trim());
  ifChanged('registrationNumber', 'registrationNumber', (v) => v.trim());

  // ── Required number field ───────────────────────────────────────────────
  ifChanged('year', 'year', (v) => parseInt(v, 10));

  // ── Optional string fields (use optionalStr) ───────────────────────────
  ifChanged('fleetNumber', 'fleetNumber', optionalStr);
  ifChanged('color', 'color', optionalStr);
  ifChanged('vin', 'vin', optionalStr);
  ifChanged('engineNumber', 'engineNumber', optionalStr);
  ifChanged('registrationDate', 'registrationDate', optionalStr);
  ifChanged('registrationExpiry', 'registrationExpiry', optionalStr);
  ifChanged('insurancePolicyNumber', 'insurancePolicyNumber', optionalStr);
  ifChanged('insuranceProvider', 'insuranceProvider', optionalStr);
  ifChanged('insuranceExpiry', 'insuranceExpiry', optionalStr);
  ifChanged('inspectionExpiry', 'inspectionExpiry', optionalStr);
  ifChanged('operatingLicenseNumber', 'operatingLicenseNumber', optionalStr);
  ifChanged('operatingLicenseExpiry', 'operatingLicenseExpiry', optionalStr);
  ifChanged('purchaseDate', 'purchaseDate', optionalStr);
  ifChanged('purchasedFrom', 'purchasedFrom', optionalStr);
  ifChanged('notes', 'notes', optionalStr);

  // ── Wialon unit ─────────────────────────────────────────────────────────
  ifChanged('wialonUnitId', 'wialonUnitId', optionalStr);

  // ── Enum fields ─────────────────────────────────────────────────────────
  ifChanged('bodyType', 'bodyType', (v) => v as BodyType);
  ifChanged('fuelType', 'fuelType', (v) => v as FuelType);
  ifChanged('transmissionType', 'transmissionType', (v) => v as TransmissionType);
  ifChanged('driveType', 'driveType', (v) => v as DriveType);
  ifChanged('ownershipType', 'ownershipType', (v) => v as OwnershipType);

  // ── Optional integer fields ─────────────────────────────────────────────
  ifChanged('tankCapacityLiters', 'tankCapacityLiters', optionalInt);
  ifChanged('engineCapacityCc', 'engineCapacityCc', optionalInt);
  ifChanged('horsepower', 'horsepower', optionalInt);
  ifChanged('numberOfGears', 'numberOfGears', optionalInt);
  ifChanged('currentOdometer', 'currentOdometer', optionalInt);
  ifChanged('engineHours', 'engineHours', optionalInt);

  // ── Optional float fields ───────────────────────────────────────────────
  ifChanged('grossVehicleMass', 'grossVehicleMass', optionalFloat);
  ifChanged('tareWeight', 'tareWeight', optionalFloat);
  ifChanged('payloadCapacity', 'payloadCapacity', optionalFloat);
  ifChanged('purchasePrice', 'purchasePrice', optionalFloat);

  // ── Axles: deep-compare by JSON; include full array if changed ──────────
  const originalAxles = original.axles.map(({ key: _k, ...rest }) => rest);
  const currentAxles = current.axles.map(({ key: _k, ...rest }) => rest);
  if (JSON.stringify(originalAxles) !== JSON.stringify(currentAxles)) {
    req.axleConfig = current.axles.map<AxleConfigInput>((axle, index) => ({
      axleName: axle.name.trim() || `Axle ${index + 1}`,
      axleIndex: index,
      axleType: axle.type as AxleType,
      positionsPerSide: parseInt(axle.positionsPerSide, 10) || 1,
      tyreSize: optionalStr(axle.tyreSize),
      maxLoadKg: optionalInt(axle.maxLoad),
    }));
  }

  return req;
}

/** Populate form from an existing API Truck (for edit mode). */
export function truckToFormData(truck: ApiTruck): TruckFormData {
  return {
    make: truck.make,
    model: truck.model,
    year: String(truck.year),
    registrationNumber: truck.registrationNumber,
    fleetNumber: truck.fleetNumber ?? '',
    color: truck.color ?? '',
    bodyType: truck.bodyType ?? '',
    vin: truck.vin ?? '',
    engineNumber: truck.engineNumber ?? '',
    registrationDate: truck.registrationDate ?? '',
    registrationExpiry: truck.registrationExpiry ?? '',
    insurancePolicyNumber: truck.insurancePolicyNumber ?? '',
    insuranceProvider: truck.insuranceProvider ?? '',
    insuranceExpiry: truck.insuranceExpiry ?? '',
    inspectionExpiry: truck.inspectionExpiry ?? '',
    operatingLicenseNumber: truck.operatingLicenseNumber ?? '',
    operatingLicenseExpiry: truck.operatingLicenseExpiry ?? '',
    wialonUnitId: truck.wialonUnitId ?? '',
    fuelType: truck.fuelType ?? 'DIESEL',
    tankCapacityLiters: truck.tankCapacityLiters != null ? String(truck.tankCapacityLiters) : '',
    engineCapacityCc: truck.engineCapacityCc != null ? String(truck.engineCapacityCc) : '',
    horsepower: truck.horsepower != null ? String(truck.horsepower) : '',
    transmissionType: truck.transmissionType ?? '',
    numberOfGears: truck.numberOfGears != null ? String(truck.numberOfGears) : '',
    driveType: truck.driveType ?? '',
    grossVehicleMass: truck.grossVehicleMass != null ? String(truck.grossVehicleMass) : '',
    tareWeight: truck.tareWeight != null ? String(truck.tareWeight) : '',
    payloadCapacity: truck.payloadCapacity != null ? String(truck.payloadCapacity) : '',
    currentOdometer: truck.currentOdometer != null ? String(truck.currentOdometer) : '',
    engineHours: truck.engineHours != null ? String(truck.engineHours) : '',
    ownershipType: truck.ownershipType ?? '',
    purchaseDate: truck.purchaseDate ?? '',
    purchasePrice: truck.purchasePrice != null ? String(truck.purchasePrice) : '',
    purchasedFrom: truck.purchasedFrom ?? '',
    notes: truck.notes ?? '',
    axles: truck.truckAxles?.length
      ? truck.truckAxles.map((a) => ({
          key: crypto.randomUUID(),
          name: a.axleName,
          type: a.axleType as AxleType,
          positionsPerSide: String(a.positionsPerSide),
          tyreSize: a.tyreSize ?? '',
          maxLoad: a.maxLoadKg != null ? String(a.maxLoadKg) : '',
        }))
      : [createDefaultAxle()],
  };
}

// ─── Tyre-Related Types ───────────────────────────────────────────────────────

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
  initialTruck?: ApiTruck | null;
  onAddComplete?: () => void;
}

export interface TruckTableProps {
  onView?: (truck: ApiTruck) => void;
  onEdit?: (truck: ApiTruck) => void;
}

export interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtext: string;
  color: string;
}

export interface FormStepProps {
  formData: TruckFormData;
  setFormData: (data: TruckFormData) => void;
}

// ─── Trip Types (backend: GET /trucks/:id/trips) ─────────────────────────────

export type TripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TruckTrip {
  id: string;
  tripNumber: string;
  truckId: string;
  routeName: string;
  origin: string;
  destination: string;
  distanceKm: number;
  fuelUsedLiters: number;
  driverName: string;
  turnBoyName: string | null;
  departureDate: string;
  arrivalDate: string | null;
  status: TripStatus;
  startOdometer: number;
  endOdometer: number | null;
  notes: string | null;
  createdAt: string;
}

// ─── Fuel Log Types (backend: GET /trucks/:id/fuel-logs) ─────────────────────

export interface TruckFuelLog {
  id: string;
  truckId: string;
  date: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometerReading: number;
  fuelType: string;
  station: string;
  location: string | null;
  receiptNumber: string | null;
  driverName: string;
  notes: string | null;
  createdAt: string;
}

export interface TruckFuelSummary {
  totalLiters: number;
  totalCost: number;
  avgConsumption: number; // L/100km
  avgCostPerLiter: number;
  lastRefuelDate: string | null;
  totalDistance: number;
  fuelLogCount: number;
}

// ─── Document Types (backend: GET /trucks/:id/documents) ─────────────────────

export type DocumentType =
  | 'REGISTRATION'
  | 'INSURANCE'
  | 'INSPECTION'
  | 'OPERATING_LICENSE'
  | 'SERVICE_RECORD'
  | 'PHOTO'
  | 'OTHER';

export interface TruckDocument {
  id: string;
  truckId: string;
  name: string;
  type: DocumentType;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  expiryDate: string | null;
  uploadedBy: string;
  uploaderName: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Tyre Activity Types (re-exported from API layer) ────────────────────────

export type {
  TyreActivityEvent,
  TyreConditionLevel,
  TyreActivityEntry,
  TyreActivitySummary,
  TruckTyreActivityData,
  TyreEventFilterType,
  TyreEventPosition,
  TyreEventPreviousPosition,
  TyreEventInspection,
  TyreEvent,
  TyreEventGroup,
  TruckTyreEventsData,
} from '@/api/tyres/tyres.types';

// ─── Detail Page Component Props ─────────────────────────────────────────────

export interface TruckOverviewProps {
  truck: TruckDetail;
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
  truckId: string;
  truck: TruckDetail;
  tyrePositions: TruckTyrePositionsData | null;
  isLoading: boolean;
  onRefresh: () => void;
  readOnly?: boolean;
}

export interface TruckMaintenanceProps {
  truckId: string;
  maintenanceData: TruckMaintenanceHistoryData | null;
  isLoading: boolean;
  onRefresh: () => void;
  readOnly?: boolean;
}

export interface TruckDocumentsProps {
  truckId: string;
}

export interface RotateTyresDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truckId: string;
  registrationNumber: string;
  currentOdometer: number;
  tyrePositions: TruckTyrePositionsData | null;
  onComplete: () => void;
}

export interface ReplaceTyreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truckId: string;
  registrationNumber: string;
  currentOdometer: number;
  tyrePositions: TruckTyrePositionsData | null;
  onComplete: () => void;
}

export interface PostReplacementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removedTyres: any[];
  truckOdometer: string;
  onComplete: () => void;
}

export interface InspectTyresDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truckId: string;
  registrationNumber: string;
  tyrePositions: TruckTyrePositionsData | null;
  onComplete: () => void;
}

export interface DismountTyresDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truckId: string;
  registrationNumber: string;
  currentOdometer: number;
  tyrePositions: TruckTyrePositionsData | null;
  onComplete: () => void;
}

export interface TyreAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truckId: string;
  onComplete: () => void;
}

export interface AssignLaterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignNow: () => void;
  onAssignLater: () => void;
}


