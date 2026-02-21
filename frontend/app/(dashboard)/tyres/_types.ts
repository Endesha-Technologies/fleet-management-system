// ─── Tyre Domain Types ───────────────────────────────────────────────────────
// Co-located type re-exports and domain-specific types for the tyres module.

// Core tyre types
export type { Tyre, TyreStatus, TyreType, TyrePosition } from '@/types/tyre';

// Inspection types
export type {
  InspectionStatus,
  TyreCondition,
  DamageType,
  DamageSeverity,
  RecommendedAction,
  ActionUrgency,
  InspectionResult,
  TreadDepthReading,
  TyreDamage,
  TyreInspectionDetail,
  TyreInspection,
  InspectionSchedule,
  InspectionSummary,
} from '@/types/inspection';

// Rotation types
export type {
  RotationPattern,
  RotationSchedule,
  TyreMovement,
  RotationRecord,
  RotationStats,
  TyreWearData,
} from '@/types/rotation';

// ─── Domain-specific types ───────────────────────────────────────────────────

/** Filter state for the inspection list page */
export interface InspectionFilterState {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  inspector: string;
}

/** Form data for assigning/installing a tyre to a vehicle */
export interface AssignTyreFormData {
  vehicleId: string;
  position: string;
  installationDate: string;
  currentOdometer: string;
  treadDepthAtInstallation: string;
  installedBy: string;
  notes: string;
}

/** Form data for adding a new tyre to inventory */
export interface AddTyreFormData {
  // Basic Information
  serialNumber: string;
  autoGenerateSerial: boolean;
  brand: string;
  model: string;
  type: 'all-season' | 'summer' | 'winter' | 'all-terrain' | 'mud-terrain';

  // Specifications
  width: string;
  aspectRatio: string;
  diameter: string;
  loadIndex: string;
  speedRating: string;
  treadPattern: string;

  // Purchase Details
  supplier: string;
  purchaseDate: string;
  purchaseOrderNumber: string;
  unitCost: string;
  quantity: string;
  warrantyMonths: string;

  // Initial Status
  warehouseLocation: string;
  initialTreadDepth: string;

  // Optional
  notes: string;
}
