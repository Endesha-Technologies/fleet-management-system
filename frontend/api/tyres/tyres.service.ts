// ---------------------------------------------------------------------------
// Tyres service
// ---------------------------------------------------------------------------

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  // Positions
  TruckTyrePositionsData,
  // Mount
  MountTyresRequest,
  MountTyresResult,
  // Dismount
  DismountTyresRequest,
  DismountTyresResult,
  // Rotate
  RotateTyresRequest,
  RotateTyresResult,
  // Inspect
  InspectTyreRequest,
  TyreInspection,
  // History
  TyreHistoryData,
  // Mileage
  TyreMileageData,
  // Position history
  PositionHistoryData,
} from './tyres.types';

// ---------------------------------------------------------------------------
// Service methods
// ---------------------------------------------------------------------------

/** Get all tyre positions for a truck (organised by axle). */
async function getTruckTyrePositions(
  truckId: string,
): Promise<TruckTyrePositionsData> {
  const res = await apiClient.get<TruckTyrePositionsData>(
    ENDPOINTS.TYRES.TRUCK_POSITIONS(truckId),
  );
  return res.data;
}

/** Mount one or more tyres onto a truck's positions. */
async function mountTyres(data: MountTyresRequest): Promise<MountTyresResult> {
  const res = await apiClient.post<MountTyresResult>(
    ENDPOINTS.TYRES.MOUNT,
    data,
  );
  return res.data;
}

/** Dismount one or more tyres from a truck's positions. */
async function dismountTyres(
  data: DismountTyresRequest,
): Promise<DismountTyresResult> {
  const res = await apiClient.post<DismountTyresResult>(
    ENDPOINTS.TYRES.DISMOUNT,
    data,
  );
  return res.data;
}

/** Rotate tyres between positions on a truck. */
async function rotateTyres(
  data: RotateTyresRequest,
): Promise<RotateTyresResult> {
  const res = await apiClient.post<RotateTyresResult>(
    ENDPOINTS.TYRES.ROTATE,
    data,
  );
  return res.data;
}

/** Record a tyre inspection. */
async function inspectTyre(
  tyreId: string,
  data: InspectTyreRequest,
): Promise<TyreInspection> {
  const res = await apiClient.post<TyreInspection>(
    ENDPOINTS.TYRES.INSPECT(tyreId),
    data,
  );
  return res.data;
}

/** Get full lifecycle history for a specific tyre. */
async function getTyreHistory(tyreId: string): Promise<TyreHistoryData> {
  const res = await apiClient.get<TyreHistoryData>(
    ENDPOINTS.TYRES.HISTORY(tyreId),
  );
  return res.data;
}

/** Get mileage breakdown for a specific tyre. */
async function getTyreMileage(tyreId: string): Promise<TyreMileageData> {
  const res = await apiClient.get<TyreMileageData>(
    ENDPOINTS.TYRES.MILEAGE(tyreId),
  );
  return res.data;
}

/** Get installation history for a specific tyre position. */
async function getPositionHistory(
  positionId: string,
): Promise<PositionHistoryData> {
  const res = await apiClient.get<PositionHistoryData>(
    ENDPOINTS.TYRES.POSITION_HISTORY(positionId),
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const tyresService = {
  getTruckTyrePositions,
  mountTyres,
  dismountTyres,
  rotateTyres,
  inspectTyre,
  getTyreHistory,
  getTyreMileage,
  getPositionHistory,
} as const;
