// ---------------------------------------------------------------------------
// Trucks domain – public barrel
// ---------------------------------------------------------------------------

export { trucksService } from './trucks.service';
export type { TruckListParams } from './trucks.service';

export type {
  // Enums / unions
  BodyType,
  FuelType,
  TransmissionType,
  DriveType,
  OwnershipType,
  TruckStatus,
  AxleType,
  TyrePositionSide,
  TyrePositionSlot,
  TyrePositionStatus,
  ComplianceAlertType,
  ComplianceAlertStatus,

  // Entities
  TyrePosition,
  TruckAxle,
  UserRef,
  TruckCounts,
  Truck,
  TruckDetail,

  // Request payloads
  AxleConfigInput,
  CreateTruckRequest,
  UpdateTruckRequest,
  UpdateTruckStatusRequest,

  // Fleet overview
  FleetMakeCount,
  FleetBodyTypeCount,
  FleetOverview,

  // Compliance alerts
  ComplianceAlert,
  ComplianceAlertsSummary,
  ComplianceAlertsData,
  ComplianceAlertsParams,

  // Response aliases
  TruckListResponse,
  TruckDetailResponse,
  CreateTruckResponse,
  UpdateTruckResponse,
  DeleteTruckResponse,
  UpdateTruckStatusResponse,
  FleetOverviewResponse,
  ComplianceAlertsResponse,
} from './trucks.types';
