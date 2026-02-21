// ---------------------------------------------------------------------------
// Tyres domain – public barrel
// ---------------------------------------------------------------------------

export { tyresService } from './tyres.service';

export type {
  // Enums / unions
  RotationMethod,
  TyreHistoryEvent,
  TyreCondition,
  TyreAssetStatus,
  TyreType,
  TyrePositionSide,
  TyrePositionSlot,
  TyrePositionStatus,

  // Shared references
  TruckRef,
  AxleConfigRef,
  PerformerRef,
  TyreAssetSummary,
  TyreAssetRef,

  // Truck tyre positions
  PositionSummary,
  TyreAxlePositions,
  TyrePositionsSummary,
  TruckTyrePositionsData,

  // Mount
  MountInput,
  MountTyresRequest,
  MountPositionResult,
  TyreOperationHistory,
  MountResultItem,
  MountTyresResult,

  // Dismount
  DismountInput,
  DismountTyresRequest,
  DismountResultItem,
  DismountTyresResult,

  // Rotate
  RotationMove,
  RotateTyresRequest,
  TyrePositionRef,
  TyreRotationMoveResult,
  RotateTyresResult,

  // Inspect
  InspectTyreRequest,
  TyreInspection,

  // Tyre history
  TyreHistorySummary,
  HistoryPositionContext,
  TyreHistoryEntry,
  TyreCurrentPosition,
  TyreHistoryData,

  // Tyre mileage
  TyreMileageSummary,
  TyreCurrentStint,
  TyreMileageByTruck,
  TyreMileageByPosition,
  TyreMileageData,

  // Position history
  PositionWithContext,
  PositionHistoryEntry,
  PositionHistoryData,

  // Response aliases
  TruckTyrePositionsResponse,
  MountTyresResponse,
  DismountTyresResponse,
  RotateTyresResponse,
  InspectTyreResponse,
  TyreHistoryResponse,
  TyreMileageResponse,
  PositionHistoryResponse,
} from './tyres.types';
