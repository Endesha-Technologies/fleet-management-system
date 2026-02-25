// ---------------------------------------------------------------------------
// Maintenance module – data-fetching hooks
// ---------------------------------------------------------------------------
// Each hook manages its own loading / error / data state and exposes a
// `refetch` function so child components can trigger a refresh.
// ---------------------------------------------------------------------------

'use client';

import { useState, useEffect, useCallback } from 'react';
import { maintenanceService } from '@/api/maintenance';
import type {
  MaintenanceScheduleListItem,
  MaintenanceScheduleDetail,
  MaintenancePlanListItem,
  MaintenancePlanDetail,
  ServiceLogListItem,
  ServiceLogDetail,
  MaintenanceAlertsData,
} from '@/api/maintenance';

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
// Schedules
// ---------------------------------------------------------------------------

export function useSchedules() {
  return useAsyncData<MaintenanceScheduleListItem[]>(
    () => maintenanceService.getSchedules(),
    [],
  );
}

export function useScheduleDetail(id: string) {
  return useAsyncData<MaintenanceScheduleDetail>(
    () => maintenanceService.getScheduleById(id),
    [id],
  );
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export function usePlans() {
  return useAsyncData<MaintenancePlanListItem[]>(
    () => maintenanceService.getPlans(),
    [],
  );
}

export function usePlanDetail(id: string) {
  return useAsyncData<MaintenancePlanDetail>(
    () => maintenanceService.getPlanById(id),
    [id],
  );
}

// ---------------------------------------------------------------------------
// Service logs
// ---------------------------------------------------------------------------

export function useServiceLogs() {
  return useAsyncData<ServiceLogListItem[]>(
    () => maintenanceService.getServiceLogs(),
    [],
  );
}

export function useServiceLogDetail(id: string) {
  return useAsyncData<ServiceLogDetail>(
    () => maintenanceService.getServiceLogById(id),
    [id],
  );
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export function useAlerts() {
  return useAsyncData<MaintenanceAlertsData>(
    () => maintenanceService.getAlerts(),
    [],
  );
}
