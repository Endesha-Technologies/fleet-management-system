'use client';

// ---------------------------------------------------------------------------
// Asset Inventory page — Server-integrated list with filters, search & pagination
// ---------------------------------------------------------------------------
// Fetches assets from the API using `assetsService.getAssets()`. All filter
// and pagination state is managed here and passed down to AssetTable as
// controlled props. Search is debounced (400 ms) before hitting the API.
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  ShoppingCart,
  DollarSign,
  Trash2,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { assetsService } from '@/api/assets';
import type { AssetListItem, AssetListParams } from '@/api/assets';
import AssetTable from './_components/AssetTable';
import { EMPTY_FILTERS } from './_components/AssetTable';
import type { AssetFilterValues } from './_components/AssetTable';
import {
  AddAssetDrawer,
  PurchaseStockDrawer,
  SellAssetDrawer,
  DisposeAssetDrawer,
} from './_components';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AssetInventoryPage() {
  const router = useRouter();

  // ---- UI state -----------------------------------------------------------
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetListItem | null>(null);
  const [isPurchaseStockOpen, setIsPurchaseStockOpen] = useState(false);
  const [isSellAssetOpen, setIsSellAssetOpen] = useState(false);
  const [isDisposeAssetOpen, setIsDisposeAssetOpen] = useState(false);

  // ---- Search (debounced) -------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ---- Filters ------------------------------------------------------------
  const [filters, setFilters] = useState<AssetFilterValues>(EMPTY_FILTERS);

  // ---- Pagination ---------------------------------------------------------
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // ---- Data ---------------------------------------------------------------
  const [assets, setAssets] = useState<AssetListItem[]>([]);
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

  // ---- Fetch assets from API ----------------------------------------------
  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: AssetListParams = { page, limit: pageSize };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (filters.assetType !== 'all') {
        params.assetType = filters.assetType;
      }
      if (filters.category !== 'all') {
        params.category = filters.category;
      }
      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      const result = await assetsService.getAssets(params);
      setAssets(result.data);
      setTotal(result.pagination.total);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to load assets';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, filters]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // ---- Handlers -----------------------------------------------------------

  const handleFiltersChange = useCallback(
    (next: AssetFilterValues) => {
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
    setEditingAsset(null);
    fetchAssets(); // Refresh list after creating/editing an asset
  }, [fetchAssets]);

  const handleEdit = useCallback((asset: AssetListItem) => {
    setEditingAsset(asset);
    setShowAddDrawer(true);
  }, []);

  const handleDrawerOpenChange = useCallback((isOpen: boolean) => {
    setShowAddDrawer(isOpen);
    if (!isOpen) setEditingAsset(null);
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
            Asset Inventory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all your fleet assets, spare parts, and equipment
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => setShowAddDrawer(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
          <Button
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
            onClick={() => setIsPurchaseStockOpen(true)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Purchase Stock</span>
            <span className="sm:hidden">Purchase</span>
          </Button>
          <Button
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => setIsSellAssetOpen(true)}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Sell
          </Button>
          <Button
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => setIsDisposeAssetOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Dispose
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
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
            onClick={fetchAssets}
            className="shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* ── Asset table ──────────────────────────────────────────── */}
      <AssetTable
        assets={assets}
        isLoading={isLoading}
        pagination={{ page, pageSize, total }}
        filters={filters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFiltersChange={handleFiltersChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onView={(asset) => router.push(`/inventory/${asset.id}`)}
        onEdit={handleEdit}
      />

      {/* ── Add / Edit asset drawer ──────────────────────────────── */}
      <AddAssetDrawer
        open={showAddDrawer}
        onOpenChange={handleDrawerOpenChange}
        asset={editingAsset}
        onSuccess={handleAddComplete}
      />

      {/* ── Purchase Stock drawer ────────────────────────────────── */}
      <PurchaseStockDrawer
        open={isPurchaseStockOpen}
        onOpenChange={setIsPurchaseStockOpen}
      />

      {/* ── Sell Asset drawer ────────────────────────────────────── */}
      <SellAssetDrawer
        isOpen={isSellAssetOpen}
        onClose={() => setIsSellAssetOpen(false)}
      />

      {/* ── Dispose Asset drawer ─────────────────────────────────── */}
      <DisposeAssetDrawer
        isOpen={isDisposeAssetOpen}
        onClose={() => setIsDisposeAssetOpen(false)}
      />
    </div>
  );
}
