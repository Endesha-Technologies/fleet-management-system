export { maintenanceService } from './maintenance.service';

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

  // Response aliases
  CreateSchedulesResponse,
  ScheduleListResponse,
  ScheduleDetailResponse,
  UpdateScheduleResponse,
  AssignPlansResponse,
  PlanListResponse,
  PlanDetailResponse,
  UpdatePlanResponse,
  CompletePlanResponse,
  ServiceLogListResponse,
  ServiceLogDetailResponse,
  MaintenanceAlertsResponse,
  TruckMaintenanceHistoryResponse,
} from './maintenance.types';
