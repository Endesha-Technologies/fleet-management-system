'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { TripsTable, AssignRouteDrawer, NewTripDrawer, NewTripPanel, StartTripModal, EndTripModal, EMPTY_FILTERS } from './_components';
import type { TripFilterValues, NewTripFormData, SuggestedRoute } from './_components';
import { MOCK_TRIPS } from '@/constants/trips';
import type { Trip } from '@/types/trip';
import { useIsDesktop } from '@/hooks/useMediaQuery';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function TripsPage() {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  // ---- Search (debounced locally for mock data) ---------------------------
  const [searchQuery, setSearchQuery] = useState('');
  
  // ---- Pagination ---------------------------------------------------------
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // ---- Filters ------------------------------------------------------------
  const [filters, setFilters] = useState<TripFilterValues>(EMPTY_FILTERS);

  // ---- UI state -----------------------------------------------------------
  const [assignRouteDrawerOpen, setAssignRouteDrawerOpen] = useState(false);
  const [newTripDrawerOpen, setNewTripDrawerOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // ---- Stats --------------------------------------------------------------
  const stats = useMemo(() => ({
    active: MOCK_TRIPS.filter(t => t.status === 'In Progress').length,
    scheduled: MOCK_TRIPS.filter(t => t.status === 'Scheduled').length,
    completed: MOCK_TRIPS.filter(t => t.status === 'Completed').length,
    cancelled: MOCK_TRIPS.filter(t => t.status === 'Cancelled').length,
  }), []);

  // ---- Filtered & paginated data (client-side for mock data) --------------
  const filteredTrips = useMemo(() => {
    let result = [...MOCK_TRIPS];

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(trip => trip.status === filters.status);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trip =>
        trip.routeName.toLowerCase().includes(query) ||
        trip.vehiclePlate.toLowerCase().includes(query) ||
        trip.driverName.toLowerCase().includes(query) ||
        trip.startLocation.toLowerCase().includes(query) ||
        trip.endLocation.toLowerCase().includes(query)
      );
    }

    return result;
  }, [filters, searchQuery]);

  const paginatedTrips = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTrips.slice(start, start + pageSize);
  }, [filteredTrips, page, pageSize]);

  const total = filteredTrips.length;

  // ---- Handlers -----------------------------------------------------------
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handleFiltersChange = useCallback((newFilters: TripFilterValues) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  const handleViewTrip = useCallback((trip: Trip) => {
    router.push(`/trips/${trip.id}`);
  }, [router]);

  const handleAssignRoute = useCallback((trip: Trip) => {
    setSelectedTrip(trip);
    setAssignRouteDrawerOpen(true);
  }, []);

  const handleStartTrip = useCallback((trip: Trip) => {
    setSelectedTrip(trip);
    setShowStartModal(true);
  }, []);

  const handleEndTrip = useCallback((trip: Trip) => {
    setSelectedTrip(trip);
    setShowEndModal(true);
  }, []);

  const handleRouteAssigned = useCallback((tripId: string, data: Parameters<typeof AssignRouteDrawer>[0]['onAssign'] extends (id: string, data: infer D) => void ? D : never) => {
    console.log('Route assigned to trip:', tripId, data);
    alert(`Route assigned to Trip #${tripId}\nDriver: ${data.driverName}\nTurn Boy: ${data.turnBoyName || 'None'}\nDistance: ${data.tripRoute.distance} km`);
    setAssignRouteDrawerOpen(false);
    setSelectedTrip(null);
  }, []);

  const handleStartConfirm = useCallback((actualStartTime: string, reason?: string) => {
    console.log('Trip started:', selectedTrip?.id, actualStartTime, reason);
    alert(`Trip #${selectedTrip?.id} started at ${actualStartTime}`);
    setShowStartModal(false);
    setSelectedTrip(null);
  }, [selectedTrip]);

  const handleEndConfirm = useCallback((actualEndTime: string, reason?: string) => {
    console.log('Trip ended:', selectedTrip?.id, actualEndTime, reason);
    alert(`Trip #${selectedTrip?.id} ended at ${actualEndTime}`);
    setShowEndModal(false);
    setSelectedTrip(null);
  }, [selectedTrip]);

  const handleCreateTrip = useCallback((data: NewTripFormData, suggestedRoute?: SuggestedRoute) => {
    console.log('New trip created:', data, suggestedRoute);
    
    // In a real app, this would call an API to create the trip
    const routeInfo = data.routeMode === 'existing' 
      ? `Route: ${data.selectedRouteId}` 
      : `${data.originName} → ${data.destinationName} (${suggestedRoute?.distance || 0} km)`;
    
    alert(`Trip Created!\n${routeInfo}\nVehicle: ${data.vehicleId}\nDriver: ${data.driverId}\nScheduled: ${data.scheduledStartTime} - ${data.scheduledEndTime}`);
    setNewTripDrawerOpen(false);
  }, []);

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className={`transition-all duration-300 ${isDesktop && newTripDrawerOpen ? 'grid grid-cols-[1fr_480px] gap-6 items-start' : ''}`}>
      {/* ── Main Content Column ──────────────────────────────────── */}
      <div className="space-y-6 min-w-0">
        {/* ── Page header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Trip Dispatch Center</h1>
            <p className="text-muted-foreground">
              Assign, track, and manage all fleet trips
            </p>
          </div>
          {!newTripDrawerOpen && (
            <Button
              onClick={() => setNewTripDrawerOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Trip
            </Button>
          )}
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────── */}
        <div className={`grid gap-4 ${isDesktop && newTripDrawerOpen ? 'grid-cols-2 xl:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4'}`}>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Trips</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.active}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.scheduled}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Data table ───────────────────────────────────────────── */}
        <TripsTable
          trips={paginatedTrips}
          isLoading={false}
          pagination={{ page, pageSize, total }}
          filters={filters}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onFiltersChange={handleFiltersChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onViewTrip={handleViewTrip}
          onStartTrip={handleStartTrip}
          onEndTrip={handleEndTrip}
          onAssignRoute={handleAssignRoute}
        />
      </div>

      {/* ── Right Column: New Trip Panel (Desktop only) ──────────── */}
      {isDesktop && newTripDrawerOpen && (
        <NewTripPanel
          open={newTripDrawerOpen}
          onClose={() => setNewTripDrawerOpen(false)}
          onCreateTrip={handleCreateTrip}
        />
      )}

      {/* ── Drawer for Mobile/Tablet ─────────────────────────────── */}
      {!isDesktop && (
        <NewTripDrawer
          open={newTripDrawerOpen}
          onClose={() => setNewTripDrawerOpen(false)}
          onCreateTrip={handleCreateTrip}
        />
      )}

      {/* ── Other Modals & drawers ───────────────────────────────── */}
      <AssignRouteDrawer
        open={assignRouteDrawerOpen}
        onClose={() => {
          setAssignRouteDrawerOpen(false);
          setSelectedTrip(null);
        }}
        trip={selectedTrip}
        onAssign={handleRouteAssigned}
      />

      {selectedTrip && (
        <>
          <StartTripModal
            trip={selectedTrip}
            isOpen={showStartModal}
            onClose={() => {
              setShowStartModal(false);
              setSelectedTrip(null);
            }}
            onConfirm={handleStartConfirm}
          />

          <EndTripModal
            trip={selectedTrip}
            isOpen={showEndModal}
            onClose={() => {
              setShowEndModal(false);
              setSelectedTrip(null);
            }}
            onConfirm={handleEndConfirm}
          />
        </>
      )}
    </div>
  );
}
