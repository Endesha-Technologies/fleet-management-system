'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Power,
  PowerOff,
  RefreshCw,
  Loader,
  AlertCircle,
  Route as RouteIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { routesService } from '@/api/routes';
import type { RouteDetail } from '@/api/routes';
import type { Route, RouteStatus, RouteType } from '@/types/route';
import { OverviewTab } from './_components/OverviewTab';
import { TripsTab } from './_components/TripsTab';
import { EditRouteDrawer } from '../_components/EditRouteDrawer';
import { ToggleRouteStatusDialog } from '../_components/DeleteRouteDialog';

// ---------------------------------------------------------------------------
// Type configs
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<RouteType, { label: string; className: string }> = {
  SHORT_HAUL: { label: 'Short Haul', className: 'bg-green-100 text-green-800 border-green-200' },
  LONG_HAUL: { label: 'Long Haul', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  REGIONAL: { label: 'Regional', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  INTERNATIONAL: { label: 'International', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
};

const STATUS_CONFIG: Record<RouteStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-800 border-green-200' },
  INACTIVE: { label: 'Inactive', className: 'bg-gray-100 text-gray-800 border-gray-200' },
};

// ---------------------------------------------------------------------------
// Helpers
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

function mapApiToUiRoute(api: RouteDetail): Route {
  return {
    id: api.id,
    code: api.code,
    name: api.name,
    type: api.type,
    origin: {
      name: api.originName,
      lat: api.originLat,
      lon: api.originLng,
    },
    destination: {
      name: api.destinationName,
      lat: api.destinationLat,
      lon: api.destinationLng,
    },
    distance: formatDistance(api.estimatedDistanceKm),
    distanceKm: api.estimatedDistanceKm,
    estimatedDuration: formatDuration(api.estimatedDurationMin),
    estimatedDurationMin: api.estimatedDurationMin,
    deviationThresholdKm: api.deviationThresholdKm,
    speedLimitKmh: api.speedLimitKmh,
    status: api.status,
    tripCount: api.trips?.length ?? 0,
    isAdHoc: api.isAdHoc,
    notes: api.notes,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function RouteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const routeId = params.id as string | undefined;
  const [route, setRoute] = useState<Route | null>(null);
  const [trips, setTrips] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // UI State
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Fetch route data
  const fetchRoute = useCallback(async () => {
    if (!routeId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await routesService.getRouteById(routeId);
      setRoute(mapApiToUiRoute(data));
      setTrips(data.trips || []);
    } catch (err) {
      console.error('Failed to fetch route:', err);
      setError(err instanceof Error ? err.message : 'Failed to load route details');
    } finally {
      setIsLoading(false);
    }
  }, [routeId]);

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  // Handlers
  const handleRecalculate = async () => {
    if (!route) return;

    setIsRecalculating(true);
    try {
      await routesService.recalculateRoute(route.id);
      await fetchRoute(); // Refresh data
    } catch (err) {
      console.error('Failed to recalculate route:', err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditDrawer(false);
    fetchRoute();
  };

  const handleStatusSuccess = () => {
    setShowStatusDialog(false);
    fetchRoute();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-500 mt-3">Loading route details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-red-800">Failed to load route</h2>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button onClick={fetchRoute} className="bg-red-600 hover:bg-red-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!route) {
    return (
      <div className="max-w-xl mx-auto mt-12">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <RouteIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800">Route not found</h2>
          <p className="text-sm text-gray-500 mt-1">
            The route you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button variant="outline" onClick={() => router.push('/routes')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Routes
          </Button>
        </div>
      </div>
    );
  }

  const typeConfig = TYPE_CONFIG[route.type];
  const statusConfig = STATUS_CONFIG[route.status];

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <button
          onClick={() => router.push('/routes')}
          className="hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Routes
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">{route.code}</span>
      </nav>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{route.name}</h1>
            <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
            <Badge variant="outline" className={typeConfig.className}>
              {typeConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{route.code}</span>
            <span className="mx-2">•</span>
            {route.origin.name} → {route.destination.name}
            <span className="mx-2">•</span>
            {route.distance} • {route.estimatedDuration}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={isRecalculating}
          >
            {isRecalculating ? (
              <>
                <Loader className="h-4 w-4 mr-1.5 animate-spin" />
                Recalculating…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Recalculate
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditDrawer(true)}
          >
            <Edit className="h-4 w-4 mr-1.5" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStatusDialog(true)}
            className={
              route.status === 'ACTIVE'
                ? 'border-amber-200 text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                : 'border-green-200 text-green-600 hover:text-green-700 hover:bg-green-50'
            }
          >
            {route.status === 'ACTIVE' ? (
              <>
                <PowerOff className="h-4 w-4 mr-1.5" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-1.5" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full md:w-auto md:inline-flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm whitespace-nowrap"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="trips"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm whitespace-nowrap"
          >
            Trips
            {route.tripCount > 0 && (
              <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600">
                {route.tripCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview">
            <OverviewTab route={route} />
          </TabsContent>

          <TabsContent value="trips">
            <TripsTab trips={trips as any[]} routeId={route.id} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Dialogs */}
      <EditRouteDrawer
        route={route}
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
        onSuccess={handleEditSuccess}
      />

      <ToggleRouteStatusDialog
        route={route}
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        onSuccess={handleStatusSuccess}
      />
    </div>
  );
}
