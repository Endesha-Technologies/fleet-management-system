// ---------------------------------------------------------------------------
// Truck detail page – data-fetching hooks
// ---------------------------------------------------------------------------
// Each hook manages its own loading / error / data state and exposes a
// `refetch` function so child components can trigger a refresh.
// ---------------------------------------------------------------------------

'use client';

import { useState, useEffect, useCallback } from 'react';
import { trucksService } from '@/api/trucks/trucks.service';
import { tyresService } from '@/api/tyres/tyres.service';
import { maintenanceService } from '@/api/maintenance/maintenance.service';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { TruckDetail } from '@/api/trucks/trucks.types';
import type { TruckTyrePositionsData } from '@/api/tyres/tyres.types';
import type { TruckMaintenanceHistoryData } from '@/api/maintenance/maintenance.types';
import type {
  TruckTrip,
  TruckFuelLog,
  TruckFuelSummary,
  TruckDocument,
} from '../_types';

// ---------------------------------------------------------------------------
// Generic async-data hook (DRY helper)
// ---------------------------------------------------------------------------

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setState({ data: null, isLoading: false, error: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refetch: load };
}

// ---------------------------------------------------------------------------
// Truck detail
// ---------------------------------------------------------------------------

export function useTruckDetail(truckId: string) {
  return useAsyncData<TruckDetail>(
    () => trucksService.getTruckById(truckId),
    [truckId],
  );
}

// ---------------------------------------------------------------------------
// Tyre positions
// ---------------------------------------------------------------------------

export function useTruckTyrePositions(truckId: string) {
  return useAsyncData<TruckTyrePositionsData>(
    () => tyresService.getTruckTyrePositions(truckId),
    [truckId],
  );
}

// ---------------------------------------------------------------------------
// Maintenance history
// ---------------------------------------------------------------------------

export function useTruckMaintenanceHistory(truckId: string) {
  return useAsyncData<TruckMaintenanceHistoryData>(
    () => maintenanceService.getTruckHistory(truckId),
    [truckId],
  );
}

// ---------------------------------------------------------------------------
// Trips (backend endpoint: GET /trucks/:truckId/trips)
// ---------------------------------------------------------------------------

export function useTruckTrips(truckId: string) {
  return useAsyncData<TruckTrip[]>(
    async () => {
      const res = await apiClient.get<TruckTrip[]>(
        ENDPOINTS.TRIPS.TRUCK_TRIPS(truckId),
      );
      return res.data;
    },
    [truckId],
  );
}

// ---------------------------------------------------------------------------
// Fuel logs (backend endpoint: GET /trucks/:truckId/fuel-logs)
// ---------------------------------------------------------------------------

export function useTruckFuelLogs(truckId: string) {
  return useAsyncData<TruckFuelLog[]>(
    async () => {
      const res = await apiClient.get<TruckFuelLog[]>(
        ENDPOINTS.FUEL.TRUCK_FUEL_LOGS(truckId),
      );
      return res.data;
    },
    [truckId],
  );
}

// ---------------------------------------------------------------------------
// Fuel summary (backend endpoint: GET /trucks/:truckId/fuel-summary)
// ---------------------------------------------------------------------------

export function useTruckFuelSummary(truckId: string) {
  return useAsyncData<TruckFuelSummary>(
    async () => {
      const res = await apiClient.get<TruckFuelSummary>(
        ENDPOINTS.FUEL.TRUCK_FUEL_SUMMARY(truckId),
      );
      return res.data;
    },
    [truckId],
  );
}

// ---------------------------------------------------------------------------
// Documents (backend endpoint: GET /trucks/:truckId/documents)
// ---------------------------------------------------------------------------

export function useTruckDocuments(truckId: string) {
  return useAsyncData<TruckDocument[]>(
    async () => {
      const res = await apiClient.get<TruckDocument[]>(
        ENDPOINTS.DOCUMENTS.TRUCK_DOCUMENTS(truckId),
      );
      return res.data;
    },
    [truckId],
  );
}
