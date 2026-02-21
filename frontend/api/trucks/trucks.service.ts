// ---------------------------------------------------------------------------
// Trucks service
// ---------------------------------------------------------------------------

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { PaginatedData, PaginationParams } from '../types';
import type {
  Truck,
  TruckDetail,
  CreateTruckRequest,
  UpdateTruckRequest,
  UpdateTruckStatusRequest,
  FleetOverview,
  ComplianceAlertsData,
  ComplianceAlertsParams,
} from './trucks.types';

// ---------------------------------------------------------------------------
// Query params specific to the trucks list
// ---------------------------------------------------------------------------

export interface TruckListParams extends PaginationParams {
  status?: string;
  bodyType?: string;
  make?: string;
  ownershipType?: string;
}

// ---------------------------------------------------------------------------
// Service methods
// ---------------------------------------------------------------------------

/** Fetch a paginated list of trucks. */
async function getTrucks(
  params?: TruckListParams,
): Promise<PaginatedData<Truck>> {
  const res = await apiClient.get<PaginatedData<Truck>>(
    ENDPOINTS.TRUCKS.LIST,
    { params: params as Record<string, string | number | boolean | undefined> },
  );
  return res.data;
}

/** Fetch a single truck by ID (includes tyre positions, documents, etc.). */
async function getTruckById(id: string): Promise<TruckDetail> {
  const res = await apiClient.get<TruckDetail>(ENDPOINTS.TRUCKS.DETAIL(id));
  return res.data;
}

/** Create a new truck with optional axle configuration. */
async function createTruck(data: CreateTruckRequest): Promise<Truck> {
  const res = await apiClient.post<Truck>(ENDPOINTS.TRUCKS.CREATE, data);
  return res.data;
}

/** Update an existing truck (full or partial). */
async function updateTruck(
  id: string,
  data: UpdateTruckRequest,
): Promise<Truck> {
  const res = await apiClient.put<Truck>(ENDPOINTS.TRUCKS.UPDATE(id), data);
  return res.data;
}

/** Delete a truck by ID. */
async function deleteTruck(id: string): Promise<void> {
  await apiClient.delete<null>(ENDPOINTS.TRUCKS.DELETE(id));
}

/** Update only the status of a truck (ACTIVE → IN_MAINTENANCE, etc.). */
async function updateTruckStatus(
  id: string,
  data: UpdateTruckStatusRequest,
): Promise<Truck> {
  const res = await apiClient.patch<Truck>(
    ENDPOINTS.TRUCKS.STATUS(id),
    data,
  );
  return res.data;
}

/** Fetch fleet-wide overview statistics (totals by status, make, body type). */
async function getFleetOverview(): Promise<FleetOverview> {
  const res = await apiClient.get<FleetOverview>(ENDPOINTS.TRUCKS.FLEET_OVERVIEW);
  return res.data;
}

/** Fetch compliance alerts for expiring / expired documents. */
async function getComplianceAlerts(
  params?: ComplianceAlertsParams,
): Promise<ComplianceAlertsData> {
  const res = await apiClient.get<ComplianceAlertsData>(
    ENDPOINTS.TRUCKS.COMPLIANCE_ALERTS,
    { params: params as Record<string, string | number | boolean | undefined> },
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const trucksService = {
  getTrucks,
  getTruckById,
  createTruck,
  updateTruck,
  deleteTruck,
  updateTruckStatus,
  getFleetOverview,
  getComplianceAlerts,
} as const;
