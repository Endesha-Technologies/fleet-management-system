// ---------------------------------------------------------------------------
// Tyres domain types
// ---------------------------------------------------------------------------
// Derived from tyre_response.json and truck_response.json (rotate_tyres).
// Covers: positions, mount, dismount, rotate, inspect, history, mileage.
// ---------------------------------------------------------------------------

import type { ApiResponse } from '../types';

// ---- Enums / union types --------------------------------------------------

export type RotationMethod = 'CUSTOM' | 'FRONT_TO_BACK' | 'CROSS' | 'SIDE_TO_SIDE';

export type TyreHistoryEvent =
  | 'MOUNTED'
  | 'DISMOUNTED'
  | 'ROTATED'
  | 'INSPECTED';

export type TyreCondition = 'good' | 'fair' | 'poor';

export type TyreAssetStatus = 'IN_INVENTORY' | 'INSTALLED' | 'DISPOSED' | 'SOLD';

export type TyreType = 'STEER' | 'DRIVE' | 'TRAILER' | 'ALL_POSITION';

export type TyrePositionSide = 'LEFT' | 'RIGHT';
export type TyrePositionSlot = 'OUTER' | 'INNER';
export type TyrePositionStatus = 'EMPTY' | 'OCCUPIED';

// ---- Shared reference shapes -----------------------------------------------

/** Abbreviated truck reference nested in tyre responses. */
export interface TruckRef {
  id: string;
  registrationNumber: string;
}

/** Abbreviated axle config reference nested in tyre responses. */
export interface AxleConfigRef {
  axleName: string;
  axleIndex?: number;
  axleType: string;
}

/** Abbreviated performer reference nested in history entries. */
export interface PerformerRef {
  id: string;
  firstName: string;
  lastName: string;
}

/** Abbreviated tyre asset as nested in position objects. */
export interface TyreAssetSummary {
  id: string;
  serialNumber: string;
  name: string;
  tyreBrand: string;
  tyreModel: string;
  tyreSize: string;
  tyreType: TyreType;
  tyreTreadDepth: number | null;
  tyreTotalMileage: number;
  status: TyreAssetStatus;
}

/** Abbreviated tyre asset nested in position history entries. */
export interface TyreAssetRef {
  id: string;
  serialNumber: string;
  name: string;
  tyreBrand: string;
  tyreModel: string;
}

// ========================================================================
// 1. GET /tyres/trucks/:truckId/positions
// ========================================================================

/** Abbreviated position in the positions-list view (no truck/axle nesting). */
export interface PositionSummary {
  id: string;
  positionCode: string;
  side: TyrePositionSide;
  slot: TyrePositionSlot;
  status: TyrePositionStatus;
  currentTyre: TyreAssetSummary | null;
}

/** Axle with its tyre positions for the positions-list view. */
export interface TyreAxlePositions {
  id: string;
  axleName: string;
  axleType: string;
  axleIndex: number;
  positionsPerSide: number;
  tyreSize: string;
  positions: PositionSummary[];
}

export interface TyrePositionsSummary {
  totalPositions: number;
  occupiedPositions: number;
  emptyPositions: number;
}

/** Payload for GET /tyres/trucks/:truckId/positions. */
export interface TruckTyrePositionsData {
  truck: TruckRef;
  summary: TyrePositionsSummary;
  axles: TyreAxlePositions[];
}

// ========================================================================
// 2. POST /tyres/mount
// ========================================================================

export interface MountInput {
  assetId: string;
  positionId: string;
  treadDepthMm?: number;
  tyreMileage?: number;
  condition?: TyreCondition;
  notes?: string;
}

export interface MountTyresRequest {
  truckId: string;
  odometerReading: number;
  mounts: MountInput[];
}

/** Full position object returned after a mount, with nested context. */
export interface MountPositionResult {
  id: string;
  truckId: string;
  axleConfigId: string;
  positionCode: string;
  side: TyrePositionSide;
  slot: TyrePositionSlot;
  status: TyrePositionStatus;
  currentTyreId: string | null;
  createdAt: string;
  updatedAt: string;
  truck: TruckRef;
  axleConfig: AxleConfigRef;
  currentTyre: TyreAssetSummary | null;
}

/** History entry created by a mount/dismount/rotate operation. */
export interface TyreOperationHistory {
  id: string;
  tyrePositionId: string;
  assetId: string;
  event: TyreHistoryEvent;
  odometerReading: number | null;
  treadDepthMm: number | null;
  mileageAccrued: number | null;
  tyreMileageAtEvent?: number | null;
  rotationMethod: RotationMethod | null;
  inspectionId: string | null;
  notes: string | null;
  performedBy: string;
  createdAt: string;
}

export interface MountResultItem {
  position: MountPositionResult;
  history: TyreOperationHistory;
}

export interface MountTyresResult {
  truckId: string;
  mountCount: number;
  mounts: MountResultItem[];
}

// ========================================================================
// 3. POST /tyres/dismount
// ========================================================================

export interface DismountInput {
  positionId: string;
  treadDepthMm?: number;
  tyreMileage?: number;
  condition?: TyreCondition;
  storageLocation?: string;
  reason?: string;
  notes?: string;
}

export interface DismountTyresRequest {
  truckId: string;
  odometerReading: number;
  dismounts: DismountInput[];
}

export interface DismountResultItem {
  position: MountPositionResult;
  history: TyreOperationHistory;
  mileageAccrued: number;
}

export interface DismountTyresResult {
  truckId: string;
  dismountCount: number;
  dismounts: DismountResultItem[];
}

// ========================================================================
// 4. POST /tyres/rotate  (already existed — kept for completeness)
// ========================================================================

export interface RotationMove {
  fromPositionId: string;
  toPositionId: string;
}

export interface RotateTyresRequest {
  truckId: string;
  odometerReading: number;
  method: RotationMethod;
  rotations: RotationMove[];
  notes?: string;
}

export interface TyrePositionRef {
  positionId: string;
  positionCode: string;
  axleName: string;
}

export interface TyreRotationMoveResult {
  assetId: string;
  from: TyrePositionRef;
  to: TyrePositionRef;
  mileageAccrued: number;
  history: TyreOperationHistory;
}

export interface RotateTyresResult {
  method: RotationMethod;
  rotationCount: number;
  moves: TyreRotationMoveResult[];
}

// ========================================================================
// 5. POST /tyres/:id/inspect
// ========================================================================

export interface InspectTyreRequest {
  inspectorName: string;
  treadDepth: number;
  pressure: number;
  visualCondition: TyreCondition;
  passed: boolean;
  notes?: string;
}

export interface TyreInspection {
  id: string;
  assetId: string;
  inspectedAt: string;
  inspectorName: string;
  treadDepth: number;
  pressure: number;
  visualCondition: TyreCondition;
  passed: boolean;
  notes: string | null;
}

// ========================================================================
// 6. GET /tyres/:id/history
// ========================================================================

/** Abbreviated tyre summary in the history header. */
export interface TyreHistorySummary {
  id: string;
  serialNumber: string;
  name: string;
  brand: string;
  model: string;
  size: string;
  type: TyreType;
  treadDepth: number | null;
  totalMileage: number;
  status: TyreAssetStatus;
}

/** Abbreviated position context nested in history entries. */
export interface HistoryPositionContext {
  id: string;
  positionCode: string;
  side: TyrePositionSide;
  slot: TyrePositionSlot;
  truck: TruckRef;
  axleConfig: AxleConfigRef;
}

/** Enriched history entry with position context and performer. */
export interface TyreHistoryEntry extends TyreOperationHistory {
  tyrePosition: HistoryPositionContext;
  performer: PerformerRef;
}

/** Full position info for the "currentPosition" in tyre history. */
export interface TyreCurrentPosition {
  id: string;
  truckId: string;
  axleConfigId: string;
  positionCode: string;
  side: TyrePositionSide;
  slot: TyrePositionSlot;
  status: TyrePositionStatus;
  currentTyreId: string | null;
  createdAt: string;
  updatedAt: string;
  truck: TruckRef;
  axleConfig: AxleConfigRef;
  currentTyre: TyreAssetSummary | null;
}

/** Payload for GET /tyres/:id/history. */
export interface TyreHistoryData {
  tyre: TyreHistorySummary;
  currentPosition: TyreCurrentPosition | null;
  history: TyreHistoryEntry[];
}

// ========================================================================
// 7. GET /tyres/:id/mileage
// ========================================================================

/** Abbreviated tyre for the mileage header. */
export interface TyreMileageSummary {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
  size: string;
  type: TyreType;
}

export interface TyreCurrentStint {
  truckId: string;
  truckRegistration: string;
  positionCode: string;
  mileageSinceMount: number;
}

export interface TyreMileageByTruck {
  truckId: string;
  truckRegistration: string;
  mileage: number;
}

export interface TyreMileageByPosition {
  positionCode: string;
  truckId: string;
  truckRegistration: string;
  mileage: number;
}

/** Payload for GET /tyres/:id/mileage. */
export interface TyreMileageData {
  tyre: TyreMileageSummary;
  totalMileage: number;
  maxMileage: number | null;
  remainingMileage: number | null;
  currentStint: TyreCurrentStint | null;
  mileageByTruck: TyreMileageByTruck[];
  mileageByPosition: TyreMileageByPosition[];
}

// ========================================================================
// 8. GET /tyres/positions/:positionId/history
// ========================================================================

/** Position context in position-history view (includes truck + axle). */
export interface PositionWithContext {
  id: string;
  truckId: string;
  axleConfigId: string;
  positionCode: string;
  side: TyrePositionSide;
  slot: TyrePositionSlot;
  status: TyrePositionStatus;
  currentTyreId: string | null;
  createdAt: string;
  updatedAt: string;
  truck: TruckRef;
  axleConfig: AxleConfigRef;
}

/** History entry enriched with asset and performer (for position history). */
export interface PositionHistoryEntry extends TyreOperationHistory {
  asset: TyreAssetRef;
  performer: PerformerRef;
}

/** Payload for GET /tyres/positions/:positionId/history. */
export interface PositionHistoryData {
  position: PositionWithContext;
  history: PositionHistoryEntry[];
}

// ========================================================================
// Response aliases
// ========================================================================

export type TruckTyrePositionsResponse = ApiResponse<TruckTyrePositionsData>;
export type MountTyresResponse = ApiResponse<MountTyresResult>;
export type DismountTyresResponse = ApiResponse<DismountTyresResult>;
export type RotateTyresResponse = ApiResponse<RotateTyresResult>;
export type InspectTyreResponse = ApiResponse<TyreInspection>;
export type TyreHistoryResponse = ApiResponse<TyreHistoryData>;
export type TyreMileageResponse = ApiResponse<TyreMileageData>;
export type PositionHistoryResponse = ApiResponse<PositionHistoryData>;
