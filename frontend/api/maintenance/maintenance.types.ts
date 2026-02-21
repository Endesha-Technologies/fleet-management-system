// ---------------------------------------------------------------------------
// Maintenance domain types
// ---------------------------------------------------------------------------
// Derived from maintenance_response.json.
// Covers: schedules (rules), plans (truck assignments), service logs,
//         alerts, and truck maintenance history.
// ---------------------------------------------------------------------------

import type { ApiResponse } from '../types';

// ---- Enums / union types --------------------------------------------------

export type MaintenanceTaskType = 'PREVENTIVE' | 'INSPECTION';

// ---- Schedules (maintenance rules) ----------------------------------------

/** A maintenance schedule template (rule). */
export interface MaintenanceSchedule {
  id: string;
  name: string;
  description: string;
  taskType: MaintenanceTaskType;
  intervalKm: number | null;
  intervalDays: number | null;
  estimatedDurationHours: number;
  applicableTruckMakes: string;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Schedule as returned in list — includes plan count. */
export interface MaintenanceScheduleListItem extends MaintenanceSchedule {
  _count: {
    plans: number;
  };
}

/** Schedule detail — includes assigned plans. */
export interface MaintenanceScheduleDetail extends MaintenanceSchedule {
  plans: MaintenancePlan[];
}

// ---- Create / Update schedule requests ------------------------------------

export interface CreateScheduleInput {
  name: string;
  description?: string;
  taskType: MaintenanceTaskType;
  intervalKm?: number;
  intervalDays?: number;
  estimatedDurationHours?: number;
  applicableTruckMakes?: string;
  notes?: string;
}

export interface CreateSchedulesRequest {
  schedules: CreateScheduleInput[];
}

export interface UpdateScheduleRequest {
  name?: string;
  description?: string;
  taskType?: MaintenanceTaskType;
  intervalKm?: number;
  intervalDays?: number;
  estimatedDurationHours?: number;
  applicableTruckMakes?: string;
  isActive?: boolean;
  notes?: string;
}

// ---- Nested references (shared by plans & logs) ---------------------------

/** Truck summary embedded inside plan / log responses. */
export interface MaintenanceTruckRef {
  id: string;
  registrationNumber: string;
  make?: string;
  model?: string;
  currentOdometer?: number;
}

/** Schedule summary embedded inside plan / log responses. */
export interface MaintenanceScheduleRef {
  id: string;
  name: string;
  description?: string;
  taskType?: MaintenanceTaskType;
  intervalKm?: number | null;
  intervalDays?: number | null;
  estimatedDurationHours?: number;
  applicableTruckMakes?: string;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ---- Plans (schedule → truck assignments) ---------------------------------

/** A maintenance plan linking a schedule to a truck. */
export interface MaintenancePlan {
  id: string;
  truckId: string;
  scheduleId: string;
  lastServiceDate: string | null;
  lastServiceOdometer: number | null;
  nextServiceDate: string | null;
  nextServiceOdometer: number | null;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Plan as returned in assign response — includes truck + schedule refs. */
export interface MaintenancePlanWithRefs extends MaintenancePlan {
  truck: MaintenanceTruckRef;
  schedule: MaintenanceScheduleRef;
}

/** Plan as returned in list — includes truck + schedule refs + service log count. */
export interface MaintenancePlanListItem extends MaintenancePlanWithRefs {
  _count: {
    serviceLogs: number;
  };
}

/** Plan detail — includes truck + schedule refs + service logs array. */
export interface MaintenancePlanDetail extends MaintenancePlanWithRefs {
  serviceLogs: ServiceLog[];
}

// ---- Assign plans request -------------------------------------------------

export interface AssignPlanInput {
  scheduleId: string;
  lastServiceDate?: string;
  lastServiceOdometer?: number;
  notes?: string;
}

export interface AssignPlansRequest {
  truckId: string;
  plans: AssignPlanInput[];
}

/** Update a plan (activate / deactivate / edit notes). */
export interface UpdatePlanRequest {
  isActive?: boolean;
  notes?: string;
}

// ---- Complete maintenance request -----------------------------------------

export interface CompletePlanRequest {
  serviceDate: string;
  odometerAtService: number;
  cost?: number;
  serviceProviderName?: string;
  summary?: string;
  notes?: string;
}

/** Response data for completing maintenance. */
export interface CompletePlanData {
  serviceLog: ServiceLog;
  plan: MaintenancePlanWithRefs;
}

// ---- Service logs ---------------------------------------------------------

/** A service log entry recording completed maintenance. */
export interface ServiceLog {
  id: string;
  planId: string;
  truckId: string;
  serviceDate: string;
  odometerAtService: number;
  cost: number;
  serviceProviderName: string;
  summary: string;
  notes: string;
  performedBy: string;
  createdAt: string;
}

/** Service log as returned in list — includes nested plan + truck refs. */
export interface ServiceLogListItem extends ServiceLog {
  plan: MaintenancePlan & {
    schedule: Pick<MaintenanceScheduleRef, 'id' | 'name' | 'taskType'>;
  };
  truck: MaintenanceTruckRef;
}

/** Service log detail — includes full plan (with full schedule) + truck. */
export interface ServiceLogDetail extends ServiceLog {
  plan: MaintenancePlan & {
    schedule: MaintenanceScheduleRef;
  };
  truck: MaintenanceTruckRef;
}

// ---- Alerts ---------------------------------------------------------------

export interface MaintenanceAlertsSummary {
  overdueCount: number;
  dueSoonCount: number;
  totalAlerts: number;
}

/** Overdue and dueSoon items share the same shape as plan list items. */
export type MaintenanceAlertItem = MaintenancePlanListItem;

export interface MaintenanceAlertsData {
  summary: MaintenanceAlertsSummary;
  overdue: MaintenanceAlertItem[];
  dueSoon: MaintenanceAlertItem[];
}

// ---- Truck maintenance history --------------------------------------------

/** Full truck entity as returned in the history endpoint. */
export interface MaintenanceTruckDetail {
  id: string;
  fleetNumber: string;
  make: string;
  model: string;
  year: number;
  color: string;
  bodyType: string;
  registrationNumber: string;
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
  fuelType: string;
  engineCapacityCc: number;
  horsepower: number;
  transmissionType: string;
  numberOfGears: number;
  driveType: string;
  grossVehicleMass: number;
  tareWeight: number;
  payloadCapacity: number;
  tankCapacityLiters: number;
  adBlueTankLiters: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  wheelbaseMm: number;
  fifthWheelHeight: number;
  currentOdometer: number;
  engineHours: number;
  status: string;
  homeDepot: string;
  assignedDriverId: string | null;
  wialonUnitId: string | null;
  purchaseDate: string;
  purchasePrice: number;
  purchasedFrom: string;
  ownershipType: string;
  notes: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Plan item inside truck maintenance history. */
export interface TruckHistoryPlan extends MaintenancePlan {
  schedule: MaintenanceScheduleRef;
  _count: {
    serviceLogs: number;
  };
}

/** Service log item inside truck maintenance history. */
export interface TruckHistoryServiceLog extends ServiceLog {
  plan: MaintenancePlan & {
    schedule: Pick<MaintenanceScheduleRef, 'id' | 'name' | 'taskType'>;
  };
}

export interface TruckMaintenanceHistoryData {
  truck: MaintenanceTruckDetail;
  plans: TruckHistoryPlan[];
  serviceLogs: TruckHistoryServiceLog[];
}

// ---- Response aliases -----------------------------------------------------

export type CreateSchedulesResponse = ApiResponse<MaintenanceSchedule[]>;
export type ScheduleListResponse = ApiResponse<MaintenanceScheduleListItem[]>;
export type ScheduleDetailResponse = ApiResponse<MaintenanceScheduleDetail>;
export type UpdateScheduleResponse = ApiResponse<MaintenanceSchedule>;
export type AssignPlansResponse = ApiResponse<MaintenancePlanWithRefs[]>;
export type PlanListResponse = ApiResponse<MaintenancePlanListItem[]>;
export type PlanDetailResponse = ApiResponse<MaintenancePlanDetail>;
export type UpdatePlanResponse = ApiResponse<MaintenancePlanWithRefs>;
export type CompletePlanResponse = ApiResponse<CompletePlanData>;
export type ServiceLogListResponse = ApiResponse<ServiceLogListItem[]>;
export type ServiceLogDetailResponse = ApiResponse<ServiceLogDetail>;
export type MaintenanceAlertsResponse = ApiResponse<MaintenanceAlertsData>;
export type TruckMaintenanceHistoryResponse = ApiResponse<TruckMaintenanceHistoryData>;
