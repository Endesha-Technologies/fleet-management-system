'use client';

// ---------------------------------------------------------------------------
// Asset Details page — Server-integrated detail view
// ---------------------------------------------------------------------------
// Fetches a single asset from the API using `assetsService.getAssetById()` and
// `assetsService.getStockSummary()`. Adapter functions in `./_adapters.ts`
// transform API types into the local UI types consumed by tab components.
// ---------------------------------------------------------------------------

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  ShoppingCart,
  Truck,
  DollarSign,
  Trash2,
  MinusCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

// API
import { assetsService } from '@/api/assets';
import type { AssetDetail, AssetStockSummary } from '@/api/assets';

// Adapters
import {
  toLocalAsset,
  toLocalMovements,
  toLocalAssignments,
  toLocalStockUnits,
} from './_adapters';

// Local UI types
import type { Asset, StockUnit, AssetMovement, AssetAssignment } from '@/types/asset';

// Components & Drawers
import {
  OverviewTab,
  StockUnitsTab,
  MovementsTab,
  AssignmentsTab,
  PurchaseStockDrawer,
  AssignAssetDrawer,
  RemoveAssetDrawer,
  SellAssetDrawer,
  DisposeAssetDrawer,
} from '../_components';

export default function AssetDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  // ---- Data state ----------------------------------------------------------
  const [asset, setAsset] = useState<Asset | null>(null);
  const [stockUnits, setStockUnits] = useState<StockUnit[]>([]);
  const [movements, setMovements] = useState<AssetMovement[]>([]);
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [disposedCount, setDisposedCount] = useState(0);

  // ---- Loading / error state -----------------------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Drawer states -------------------------------------------------------
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isDisposeOpen, setIsDisposeOpen] = useState(false);

  // ---- Fetch data from API -------------------------------------------------
  const fetchAssetData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch asset detail and stock summary in parallel
      const [detail, stockSummary] = await Promise.all([
        assetsService.getAssetById(id),
        assetsService.getStockSummary(id).catch(() => null), // Non-critical
      ]);

      // Transform API data → local UI types using adapters
      const localAsset = toLocalAsset(detail, stockSummary);
      const localStockUnits = toLocalStockUnits(detail);
      const localMovements = toLocalMovements(detail.stockMovements ?? []);
      const localAssignments = toLocalAssignments(
        detail.installations ?? [],
        id,
        stockSummary,
      );

      setAsset(localAsset);
      setStockUnits(localStockUnits);
      setMovements(localMovements);
      setAssignments(localAssignments);
      setDisposedCount(stockSummary?.totalDisposed ?? 0);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to load asset details';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssetData();
  }, [fetchAssetData]);

  // ---- Loading state -------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500">Loading asset details…</p>
      </div>
    );
  }

  // ---- Error state ---------------------------------------------------------
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="rounded-full bg-red-100 p-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Failed to Load Asset
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-md">{error}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/inventory">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Inventory
            </Button>
          </Link>
          <Button onClick={fetchAssetData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ---- Asset not found (shouldn't happen if API threw, but just in case) ---
  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-semibold text-gray-900">
          Asset Not Found
        </h2>
        <p className="text-gray-500 mt-2">
          The asset you are looking for does not exist.
        </p>
        <Link href="/inventory">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/inventory"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
          </div>
          <div className="flex items-center gap-2 ml-7">
            <Badge variant="outline" className="text-xs">
              {asset.sku}
            </Badge>
            <Badge
              className={
                asset.inStock > asset.reorderLevel
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200'
                  : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'
              }
            >
              {asset.stockStatus}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsPurchaseOpen(true)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Purchase Stock
          </Button>
          <Button
            variant="outline"
            className="text-blue-600 border-gray-200 hover:bg-blue-50"
            onClick={() => setIsAssignOpen(true)}
          >
            <Truck className="w-4 h-4 mr-2" />
            Assign to Truck
          </Button>
          <Button
            variant="outline"
            className="text-gray-700 hover:bg-gray-50"
            onClick={() => setIsRemoveOpen(true)}
          >
            <MinusCircle className="w-4 h-4 mr-2" />
            Remove from Truck
          </Button>
          <Button
            variant="outline"
            className="text-gray-700 border-gray-200 hover:bg-gray-50"
            onClick={() => setIsSellOpen(true)}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Sell
          </Button>
          <Button
            variant="outline"
            className="text-gray-500 border-gray-200 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
            onClick={() => setIsDisposeOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Dispose
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Units
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {asset.inStock + asset.assigned}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            In Stock
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              asset.inStock <= asset.reorderLevel
                ? 'text-red-600'
                : 'text-gray-900'
            }`}
          >
            {asset.inStock}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Assigned
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {asset.assigned}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Disposed
          </p>
          <p className="text-2xl font-bold text-gray-400 mt-1">
            {disposedCount}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="units"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Stock Units
          </TabsTrigger>
          <TabsTrigger
            value="movements"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Movements
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Assignments
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview">
            <OverviewTab asset={asset} disposedCount={disposedCount} />
          </TabsContent>

          <TabsContent value="units">
            <StockUnitsTab asset={asset} stockUnits={stockUnits} />
          </TabsContent>

          <TabsContent value="movements">
            <MovementsTab movements={movements} />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentsTab assignments={assignments} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Drawers */}
      <PurchaseStockDrawer
        open={isPurchaseOpen}
        onOpenChange={setIsPurchaseOpen}
        initialAssetId={asset.id}
        onSuccess={fetchAssetData}
      />

      <AssignAssetDrawer
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        asset={asset}
      />

      <RemoveAssetDrawer
        open={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        asset={asset}
      />

      <SellAssetDrawer
        open={isSellOpen}
        onOpenChange={setIsSellOpen}
        initialAssetId={asset.id}
        onSuccess={fetchAssetData}
      />

      <DisposeAssetDrawer
        open={isDisposeOpen}
        onOpenChange={setIsDisposeOpen}
        initialAssetId={asset.id}
        onSuccess={fetchAssetData}
      />
    </div>
  );
}
