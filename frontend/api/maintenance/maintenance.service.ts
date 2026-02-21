// ---------------------------------------------------------------------------
// Maintenance service
// ---------------------------------------------------------------------------
// Thin, typed wrappers around apiClient for every maintenance endpoint.
// Each method returns the unwrapped `.data` from the API envelope.
// ---------------------------------------------------------------------------

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

import type {
  // Schedules
  MaintenanceSchedule,
  MaintenanceScheduleListItem,
  MaintenanceScheduleDetail,
  CreateSchedulesRequest,
  UpdateScheduleRequest,

  // Plans
  MaintenancePlanWithRefs,
  MaintenancePlanListItem,
  MaintenancePlanDetail,
  AssignPlansRequest,
  UpdatePlanRequest,

  // Complete
  CompletePlanRequest,
  CompletePlanData,

  // Logs
  ServiceLogListItem,
  ServiceLogDetail,

  // Alerts
  MaintenanceAlertsData,

  // Truck history
  TruckMaintenanceHistoryData,
} from './maintenance.types';

// ---- Service --------------------------------------------------------------

export const maintenanceService = {
  // -- Schedules (rules) ----------------------------------------------------

  /** Bulk-create maintenance schedule templates. */
  async createSchedules(
    data: CreateSchedulesRequest,
  ): Promise<MaintenanceSchedule[]> {
    const res = await apiClient.post<MaintenanceSchedule[]>(
      ENDPOINTS.MAINTENANCE.SCHEDULES_LIST,
      data,
    );
    return res.data;
  },

  /** List all maintenance schedules (non-paginated). */
  async getSchedules(): Promise<MaintenanceScheduleListItem[]> {
    const res = await apiClient.get<MaintenanceScheduleListItem[]>(
      ENDPOINTS.MAINTENANCE.SCHEDULES_LIST,
    );
    return res.data;
  },

  /** Get a single schedule by ID (includes assigned plans). */
  async getScheduleById(id: string): Promise<MaintenanceScheduleDetail> {
    const res = await apiClient.get<MaintenanceScheduleDetail>(
      ENDPOINTS.MAINTENANCE.SCHEDULES_DETAIL(id),
    );
    return res.data;
  },

  /** Update an existing maintenance schedule. */
  async updateSchedule(
    id: string,
    data: UpdateScheduleRequest,
  ): Promise<MaintenanceSchedule> {
    const res = await apiClient.put<MaintenanceSchedule>(
      ENDPOINTS.MAINTENANCE.SCHEDULES_DETAIL(id),
      data,
    );
    return res.data;
  },

  // -- Plans (schedule → truck assignments) ---------------------------------

  /** Assign one or more schedules to a truck. */
  async assignPlans(
    data: AssignPlansRequest,
  ): Promise<MaintenancePlanWithRefs[]> {
    const res = await apiClient.post<MaintenancePlanWithRefs[]>(
      ENDPOINTS.MAINTENANCE.PLANS_LIST,
      data,
    );
    return res.data;
  },

  /** List all maintenance plans (non-paginated). */
  async getPlans(): Promise<MaintenancePlanListItem[]> {
    const res = await apiClient.get<MaintenancePlanListItem[]>(
      ENDPOINTS.MAINTENANCE.PLANS_LIST,
    );
    return res.data;
  },

  /** Get a single plan by ID (includes service logs). */
  async getPlanById(id: string): Promise<MaintenancePlanDetail> {
    const res = await apiClient.get<MaintenancePlanDetail>(
      ENDPOINTS.MAINTENANCE.PLANS_DETAIL(id),
    );
    return res.data;
  },

  /** Update a plan (e.g. activate / deactivate / edit notes). */
  async updatePlan(
    id: string,
    data: UpdatePlanRequest,
  ): Promise<MaintenancePlanWithRefs> {
    const res = await apiClient.put<MaintenancePlanWithRefs>(
      ENDPOINTS.MAINTENANCE.PLANS_DETAIL(id),
      data,
    );
    return res.data;
  },

  /** Mark a maintenance plan as completed, creating a service log. */
  async completePlan(
    id: string,
    data: CompletePlanRequest,
  ): Promise<CompletePlanData> {
    const res = await apiClient.post<CompletePlanData>(
      ENDPOINTS.MAINTENANCE.PLANS_COMPLETE(id),
      data,
    );
    return res.data;
  },

  // -- Service logs ---------------------------------------------------------

  /** List all service logs (non-paginated). */
  async getServiceLogs(): Promise<ServiceLogListItem[]> {
    const res = await apiClient.get<ServiceLogListItem[]>(
      ENDPOINTS.MAINTENANCE.LOGS_LIST,
    );
    return res.data;
  },

  /** Get a single service log by ID. */
  async getServiceLogById(id: string): Promise<ServiceLogDetail> {
    const res = await apiClient.get<ServiceLogDetail>(
      ENDPOINTS.MAINTENANCE.LOGS_DETAIL(id),
    );
    return res.data;
  },

  // -- Alerts ---------------------------------------------------------------

  /** Get maintenance alerts (overdue + due-soon). */
  async getAlerts(): Promise<MaintenanceAlertsData> {
    const res = await apiClient.get<MaintenanceAlertsData>(
      ENDPOINTS.MAINTENANCE.ALERTS,
    );
    return res.data;
  },

  // -- Truck maintenance history --------------------------------------------

  /** Get full maintenance history for a specific truck. */
  async getTruckHistory(
    truckId: string,
  ): Promise<TruckMaintenanceHistoryData> {
    const res = await apiClient.get<TruckMaintenanceHistoryData>(
      ENDPOINTS.MAINTENANCE.TRUCK_HISTORY(truckId),
    );
    return res.data;
  },
} as const;
