// ---------------------------------------------------------------------------
// Public API barrel
// ---------------------------------------------------------------------------
// Import from `@/api` to access the client, shared types, endpoints, and
// domain services. Each domain also has its own entry point for focused
// imports (e.g. `@/api/auth`, `@/api/roles`, `@/api/users`).
//
// Usage examples:
//   import { apiClient, ENDPOINTS } from '@/api';
//   import { authService, type AuthUser } from '@/api/auth';
//   import { rolesService, type Role } from '@/api/roles';
//   import { usersService, type User } from '@/api/users';
//   import { trucksService, type Truck } from '@/api/trucks';
//   import { tyresService, type RotateTyresRequest } from '@/api/tyres';
//   import { assetsService, type Asset } from '@/api/assets';
//   import { maintenanceService, type MaintenanceSchedule } from '@/api/maintenance';
// ---------------------------------------------------------------------------

// Core
export { apiClient } from './client';
export type { RequestConfig } from './client';

// Shared types
export { ApiError } from './types';
export type { ApiResponse, Pagination, PaginatedData, PaginationParams } from './types';

// Endpoint registry
export { ENDPOINTS } from './endpoints';

// ---- Domain services -------------------------------------------------------

// Auth
export { authService } from './auth';
export type {
  AuthUser,
  UserType as AuthUserType,
  LoginRequest,
  LoginResponseData,
  RefreshTokenResponseData,
  LogoutResponseData,
} from './auth';

// Roles & Permissions
export { rolesService } from './roles';
export type {
  Permission,
  RolePermission,
  Role,
  RoleSummary,
  RoleDetail,
  CreateRoleRequest,
  UpdateRoleRequest,
} from './roles';

// Users
export { usersService } from './users';
export type {
  User,
  UserRole,
  UserStatus,
  DriverProfile,
  UserUpdateResult,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
} from './users';

// Trucks & Fleet
export { trucksService } from './trucks';
export type {
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
  TyrePosition,
  TruckAxle,
  UserRef,
  TruckCounts,
  Truck,
  TruckDetail,
  AxleConfigInput,
  CreateTruckRequest,
  UpdateTruckRequest,
  UpdateTruckStatusRequest,
  FleetOverview,
  ComplianceAlert,
  ComplianceAlertsData,
  ComplianceAlertsParams,
  TruckListParams,
} from './trucks';

// Tyres
export { tyresService } from './tyres';
export type {
  // Enums
  RotationMethod,
  TyreHistoryEvent,
  TyreCondition,
  TyreAssetStatus,
  TyreType,

  // Shared references
  TruckRef,
  AxleConfigRef,
  PerformerRef,
  TyreAssetSummary,

  // Truck tyre positions
  TruckTyrePositionsData,
  TyreAxlePositions,
  PositionSummary,
  TyrePositionsSummary,

  // Mount / Dismount
  MountTyresRequest,
  MountTyresResult,
  DismountTyresRequest,
  DismountTyresResult,
  TyreOperationHistory,

  // Rotate
  RotationMove,
  RotateTyresRequest,
  RotateTyresResult,
  TyreRotationMoveResult,
  TyrePositionRef,

  // Inspect
  InspectTyreRequest,
  TyreInspection,

  // Tyre history
  TyreHistoryData,
  TyreHistoryEntry,

  // Tyre mileage
  TyreMileageData,

  // Position history
  PositionHistoryData,
} from './tyres';

// Assets & Inventory
export { assetsService } from './assets';
export type {
  AssetListParams,
  PurchaseListParams,
  TransactionListParams,
} from './assets';
export type {
  // Enums / unions
  AssetType,
  AssetCategory,
  AssetStatus,
  SparePartCondition,
  ToolCondition,
  MovementType,
  MovementDirection,
  TransactionAction,
  PurchaseOrderStatus,
  DisposalType,
  LowStockSeverity,
  LowStockAlertType,

  // Core entities
  Asset,
  AssetCounts,
  AssetListItem,
  AssetDetail,
  AssetTransaction,
  StockMovement,

  // List summary
  AssetTypeSummary,
  AssetCategorySummary,
  AssetStatusSummary,
  AssetListSummary,
  AssetListData,

  // Suppliers
  Supplier,
  SupplierListItem,
  CreateSupplierRequest,

  // Purchases
  PurchaseItemInput,
  CreatePurchaseRequest,
  PurchaseItemAssetRef,
  PurchaseItem,
  PurchaseOrder,
  PurchaseOrderListItem,

  // Install / Remove
  InstallAssetRequest,
  AssetInstallation,
  RemoveAssetRequest,

  // Stock summary
  StockMovementSummary,
  ActiveInstallation,
  TruckHistory,
  AssetStockSummary,

  // Disposal
  DisposeAssetRequest,
  AssetDisposal,

  // Low stock
  LowStockAssetRef,
  LowStockTruckRef,
  LowStockAlert,
  LowStockByAssetType,
  LowStockSummaryData,
  LowStockAlertsData,

  // Tool checkout / return
  CheckoutToolRequest,
  ReturnToolRequest,

  // Request / Response
  CreateAssetRequest,
  UpdateAssetRequest,
} from './assets';

// Maintenance
export { maintenanceService } from './maintenance';
export type {
  // Enums
  MaintenanceTaskType,

  // Schedules
  MaintenanceSchedule,
  MaintenanceScheduleListItem,
  MaintenanceScheduleDetail,
  CreateScheduleInput,
  CreateSchedulesRequest,
  UpdateScheduleRequest,

  // Nested references
  MaintenanceTruckRef,
  MaintenanceScheduleRef,

  // Plans
  MaintenancePlan,
  MaintenancePlanWithRefs,
  MaintenancePlanListItem,
  MaintenancePlanDetail,
  AssignPlanInput,
  AssignPlansRequest,
  UpdatePlanRequest,

  // Complete
  CompletePlanRequest,
  CompletePlanData,

  // Service logs
  ServiceLog,
  ServiceLogListItem,
  ServiceLogDetail,

  // Alerts
  MaintenanceAlertsSummary,
  MaintenanceAlertItem,
  MaintenanceAlertsData,

  // Truck maintenance history
  MaintenanceTruckDetail,
  TruckHistoryPlan,
  TruckHistoryServiceLog,
  TruckMaintenanceHistoryData,
} from './maintenance';
