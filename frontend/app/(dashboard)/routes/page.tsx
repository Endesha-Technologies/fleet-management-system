'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RouteTable, EMPTY_FILTERS, type RouteFilterValues } from './_components/RouteTable';
import { CreateRouteDrawer } from './_components/CreateRouteDrawer';
import { EditRouteDrawer } from './_components/EditRouteDrawer';
import { ToggleRouteStatusDialog } from './_components/DeleteRouteDialog';
import { routesService } from '@/api/routes';
import type { RouteWithCount, RouteListParams } from '@/api/routes';
import type { Route } from './_types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Helpers — Transform API data to UI format
// ---------------------------------------------------------------------------

function formatDuration(minutes: number): string {
  if (!minutes || minutes === 0) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function formatDistance(km: number): string {
  if (!km || km === 0) return '—';
  return `${km.toFixed(1)} km`;
}

function mapApiRouteToUiRoute(apiRoute: RouteWithCount): Route {
  return {
    id: apiRoute.id,
    code: apiRoute.code,
    name: apiRoute.name,
    type: apiRoute.type,
    origin: {
      name: apiRoute.originName,
      lat: apiRoute.originLat,
      lon: apiRoute.originLng,
    },
    destination: {
      name: apiRoute.destinationName,
      lat: apiRoute.destinationLat,
      lon: apiRoute.destinationLng,
    },
    distance: formatDistance(apiRoute.estimatedDistanceKm),
    distanceKm: apiRoute.estimatedDistanceKm,
    estimatedDuration: formatDuration(apiRoute.estimatedDurationMin),
    estimatedDurationMin: apiRoute.estimatedDurationMin,
    deviationThresholdKm: apiRoute.deviationThresholdKm,
    speedLimitKmh: apiRoute.speedLimitKmh,
    status: apiRoute.status,
    tripCount: apiRoute._count?.trips ?? 0,
    isAdHoc: apiRoute.isAdHoc,
    notes: apiRoute.notes,
    createdAt: apiRoute.createdAt,
    updatedAt: apiRoute.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function RoutesPage() {
  const router = useRouter();

  // ---- Search (debounced) -------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ---- Pagination ---------------------------------------------------------
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // ---- Filters ------------------------------------------------------------
  const [filters, setFilters] = useState<RouteFilterValues>(EMPTY_FILTERS);

  // ---- Data ---------------------------------------------------------------
  const [routes, setRoutes] = useState<Route[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- UI state -----------------------------------------------------------
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // ---- Debounce search input → API param ----------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ---- Fetch routes from API ----------------------------------------------
  const fetchRoutes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: RouteListParams = { page, limit: pageSize };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      // Apply filters
      if (filters.status !== 'all') {
        params.status = filters.status as 'ACTIVE' | 'INACTIVE';
      }
      if (filters.type !== 'all') {
        params.type = filters.type as 'SHORT_HAUL' | 'LONG_HAUL' | 'REGIONAL' | 'INTERNATIONAL';
      }

      const result = await routesService.getRoutes(params);
      const mappedRoutes = result.data.map(mapApiRouteToUiRoute);
      setRoutes(mappedRoutes);
      setTotal(result.pagination.total);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to load routes';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, filters]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // ---- Handlers -----------------------------------------------------------

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleFiltersChange = useCallback((newFilters: RouteFilterValues) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page on page size change
  }, []);

  const handleViewRoute = (route: Route) => {
    router.push(`/routes/${route.id}`);
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setShowEditDrawer(true);
  };

  const handleToggleStatus = (route: Route) => {
    setSelectedRoute(route);
    setShowStatusDialog(true);
  };

  const handleStatusChangeSuccess = useCallback(() => {
    setShowStatusDialog(false);
    setSelectedRoute(null);
    fetchRoutes();
  }, [fetchRoutes]);

  const handleEditSuccess = useCallback(() => {
    setShowEditDrawer(false);
    setSelectedRoute(null);
    fetchRoutes();
  }, [fetchRoutes]);

  const handleCreateSuccess = useCallback(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Routes</h1>
          <p className="text-muted-foreground">
            Manage and optimize your fleet routes.
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDrawer(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Route
        </Button>
      </div>

      {/* ── Error state ──────────────────────────────────────────── */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRoutes}
              className="ml-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* ── Data table (handled by DataTable, includes mobile cards) */}
      <RouteTable 
        routes={routes}
        isLoading={isLoading}
        pagination={{ page, pageSize, total }}
        filters={filters}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onFiltersChange={handleFiltersChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onViewRoute={handleViewRoute}
        onEditRoute={handleEditRoute}
        onToggleStatus={handleToggleStatus}
      />

      {/* ── Drawers & dialogs ────────────────────────────────────── */}
      <CreateRouteDrawer
        open={showCreateDrawer}
        onOpenChange={setShowCreateDrawer}
        onSuccess={handleCreateSuccess}
      />

      <EditRouteDrawer
        route={selectedRoute}
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
        onSuccess={handleEditSuccess}
      />

      <ToggleRouteStatusDialog
        route={selectedRoute}
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        onSuccess={handleStatusChangeSuccess}
      />
    </div>
  );
}
