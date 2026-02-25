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
  TyreActivityEvent,
  TyreConditionLevel,

  // Shared references
  TruckRef,
  AxleConfigRef,
  PerformerRef,
  TyreAssetSummary,
  TyreAssetRef,

  // Tyre list / detail
  TyreListParams,
  TyreListItem,
  TyreListData,
  TyreDetail,

  // Truck tyre positions
  PositionSummary,
  TyreAxlePositions,
  TyrePositionsSummary,
  TruckTyrePositionsData,

  // Truck tyre activity
  TyreActivityEntry,
  TyreActivitySummary,
  TruckTyreActivityData,

  // Truck tyre events (grouped by date)
  TyreEventFilterType,
  TyreEventPosition,
  TyreEventPreviousPosition,
  TyreEventInspection,
  TyreEvent,
  TyreEventGroup,
  TruckTyreEventsData,

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
  TyreListResponse,
  TyreDetailResponse,
  TruckTyreActivityResponse,
  TruckTyreEventsResponse,
} from './tyres.types';
