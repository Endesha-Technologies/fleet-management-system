'use client';

// ---------------------------------------------------------------------------
// Trucks page — Server-integrated list with filters, search & pagination
// ---------------------------------------------------------------------------
// Fetches trucks from the API using `trucksService.getTrucks()`. All filter
// and pagination state is managed here and passed down to TruckTable as
// controlled props. Search is debounced (400 ms) before hitting the API.
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trucksService } from '@/api/trucks';
import type { Truck } from '@/api/trucks';
import type { TruckListParams } from '@/api/trucks';
import { TruckTable, EMPTY_FILTERS } from './_components/TruckTable';
import type { TruckFilterValues } from './_components/TruckTable';
import { AddTruckDrawer } from './_components/AddTruckDrawer';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function TrucksPage() {
  const router = useRouter();

  // ---- UI state -----------------------------------------------------------
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);

  // ---- Search (debounced) -------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ---- Filters ------------------------------------------------------------
  const [filters, setFilters] = useState<TruckFilterValues>(EMPTY_FILTERS);

  // ---- Pagination ---------------------------------------------------------
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // ---- Data ---------------------------------------------------------------
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Debounce search input → API param ----------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ---- Fetch trucks from API ----------------------------------------------
  const fetchTrucks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: TruckListParams = { page, limit: pageSize };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.bodyType !== 'all') {
        params.bodyType = filters.bodyType;
      }
      if (filters.ownershipType !== 'all') {
        params.ownershipType = filters.ownershipType;
      }

      const result = await trucksService.getTrucks(params);
      setTrucks(result.data);
      setTotal(result.pagination.total);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to load trucks';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, filters]);

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  // ---- Handlers -----------------------------------------------------------

  const handleFiltersChange = useCallback(
    (next: TruckFilterValues) => {
      setFilters(next);
      setPage(1);
    },
    [],
  );

  const handlePageChange = useCallback((next: number) => {
    setPage(next);
  }, []);

  const handlePageSizeChange = useCallback((next: number) => {
    setPageSize(next);
    setPage(1);
  }, []);

  const handleAddComplete = useCallback(() => {
    setShowAddDrawer(false);
    setEditingTruck(null);
    fetchTrucks(); // Refresh list after creating/editing a truck
  }, [fetchTrucks]);

  const handleEdit = useCallback((truck: Truck) => {
    setEditingTruck(truck);
    setShowAddDrawer(true);
  }, []);

  const handleDrawerOpenChange = useCallback((isOpen: boolean) => {
    setShowAddDrawer(isOpen);
    if (!isOpen) setEditingTruck(null);
  }, []);

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Truck Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage fleet trucks, maintenance, and assignments
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          onClick={() => setShowAddDrawer(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Truck
        </Button>
      </div>

      {/* ── Error banner ─────────────────────────────────────────── */}
      {error && !isLoading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTrucks}
            className="shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* ── Truck table ──────────────────────────────────────────── */}
      <TruckTable
        trucks={trucks}
        isLoading={isLoading}
        pagination={{ page, pageSize, total }}
        filters={filters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFiltersChange={handleFiltersChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onView={(truck) => router.push(`/trucks/${truck.id}`)}
        onEdit={handleEdit}
      />

      {/* ── Add truck drawer ─────────────────────────────────────── */}
      <AddTruckDrawer
        open={showAddDrawer}
        onOpenChange={handleDrawerOpenChange}
        initialTruck={editingTruck}
        onAddComplete={handleAddComplete}
      />
    </div>
  );
}
