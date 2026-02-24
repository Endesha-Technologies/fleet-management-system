'use client';

// ---------------------------------------------------------------------------
// Asset Details page — Type-aware detail view
// ---------------------------------------------------------------------------
// Fetches a single asset from the API and renders a layout tailored to the
// asset type (TYRE, SPARE_PART, CONSUMABLE, TOOL_EQUIPMENT). Each type shows
// relevant specs, stats, actions, and tabs.
// ---------------------------------------------------------------------------

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Package,
  Wrench,
  Droplets,
  Settings,
  CircleDot,
  Gauge,
  MapPin,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Hash,
  Ruler,
  Zap,
  Shield,
  Thermometer,
  ClipboardCheck,
  UserCheck,
  LogOut,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// API
import { assetsService } from '@/api/assets';
import type { AssetDetail, AssetStockSummary, AssetType } from '@/api/assets';

// Adapters
import {
  toLocalAsset,
  toLocalAssignments,
  toLocalStockUnits,
} from './_adapters';

// Local UI types
import type { Asset, StockUnit, AssetAssignment } from '@/types/asset';

// Components & Drawers
import {
  StockUnitsTab,
  MovementsTab,
  AssignmentsTab,
  PurchaseStockDrawer,
  AssignAssetDrawer,
  RemoveAssetDrawer,
  SellAssetDrawer,
  DisposeAssetDrawer,
  ToolCheckoutDrawer,
  ToolReturnDrawer,
} from '../_components';

// ===========================================================================
// Type-specific visual config
// ===========================================================================

const TYPE_CONFIG: Record<AssetType, {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
}> = {
  TYRE: {
    label: 'Tyre',
    icon: CircleDot,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    accentColor: 'bg-blue-600',
  },
  SPARE_PART: {
    label: 'Spare Part',
    icon: Wrench,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    accentColor: 'bg-amber-600',
  },
  CONSUMABLE: {
    label: 'Consumable',
    icon: Droplets,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    accentColor: 'bg-green-600',
  },
  TOOL_EQUIPMENT: {
    label: 'Tool / Equipment',
    icon: Settings,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    accentColor: 'bg-purple-600',
  },
};

// ===========================================================================
// Helper components
// ===========================================================================

function InfoRow({ label, value, icon: Icon, mono, className }: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1.5 mt-0.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
        <span className={cn('text-sm font-medium text-gray-900', mono && 'font-mono')}>{value ?? '—'}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, subtitle, alert }: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  subtitle?: string;
  alert?: boolean;
}) {
  return (
    <Card className={cn(
      'border shadow-sm overflow-hidden',
      alert ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-white',
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
            <p className={cn('text-2xl font-bold mt-1', alert ? 'text-red-600' : 'text-gray-900')}>{value}</p>
            {subtitle && <p className={cn('text-xs mt-1', alert ? 'text-red-500' : 'text-gray-500')}>{subtitle}</p>}
          </div>
          <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SpecCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-gray-200 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {children}
      </CardContent>
    </Card>
  );
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return `UGX ${amount.toLocaleString()}`;
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-UG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatNumber(num: number | null | undefined, suffix?: string): string {
  if (num == null) return '—';
  return `${num.toLocaleString()}${suffix ? ` ${suffix}` : ''}`;
}

// ===========================================================================
// Main component
// ===========================================================================

export default function AssetDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  // ---- Data state ----------------------------------------------------------
  const [apiDetail, setApiDetail] = useState<AssetDetail | null>(null);
  const [stockSummary, setStockSummary] = useState<AssetStockSummary | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [stockUnits, setStockUnits] = useState<StockUnit[]>([]);
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);

  // ---- Loading / error state -----------------------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Drawer states -------------------------------------------------------
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isDisposeOpen, setIsDisposeOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);

  // ---- Fetch data from API -------------------------------------------------
  const fetchAssetData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [detail, summary] = await Promise.all([
        assetsService.getAssetById(id),
        assetsService.getStockSummary(id).catch(() => null),
      ]);

      setApiDetail(detail);
      setStockSummary(summary);

      // Transform API data → local UI types for tab components
      setAsset(toLocalAsset(detail, summary));
      setStockUnits(toLocalStockUnits(detail));
      setAssignments(toLocalAssignments(detail.installations ?? [], id, summary));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load asset details';
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
          <h2 className="text-lg font-semibold text-gray-900">Failed to Load Asset</h2>
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

  if (!apiDetail || !asset) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-semibold text-gray-900">Asset Not Found</h2>
        <p className="text-gray-500 mt-2">The asset you are looking for does not exist.</p>
        <Link href="/inventory">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </Link>
      </div>
    );
  }

  // ---- Derived values -------------------------------------------------------
  const typeConfig = TYPE_CONFIG[apiDetail.assetType] ?? TYPE_CONFIG.SPARE_PART;
  const TypeIcon = typeConfig.icon;
  const disposedCount = stockSummary?.totalDisposed ?? 0;
  const isLowStock = asset.inStock <= asset.reorderLevel && asset.reorderLevel > 0;
  const totalValue = (asset.inStock + asset.assigned) * (apiDetail.unitCost ?? 0);

  // ===========================================================================
  // Type-specific stat cards
  // ===========================================================================

  const renderStatCards = () => {
    const common = [
      <StatCard
        key="stock"
        label="In Stock"
        value={asset.inStock}
        icon={Package}
        iconBg={isLowStock ? 'bg-red-100' : 'bg-green-100'}
        iconColor={isLowStock ? 'text-red-500' : 'text-green-600'}
        subtitle={isLowStock ? `Below minimum (${asset.reorderLevel})` : undefined}
        alert={isLowStock}
      />,
    ];

    switch (apiDetail.assetType) {
      case 'TYRE':
        return [
          ...common,
          <StatCard key="mounted" label="Mounted" value={asset.assigned} icon={Truck} iconBg="bg-blue-100" iconColor="text-blue-600" />,
          <StatCard key="mileage" label="Total Mileage" value={formatNumber(apiDetail.tyreTotalMileage, 'km')} icon={Gauge} iconBg="bg-indigo-100" iconColor="text-indigo-600" />,
          <StatCard key="tread" label="Tread Depth" value={apiDetail.tyreTreadDepth != null ? `${apiDetail.tyreTreadDepth} mm` : '—'} icon={Ruler} iconBg="bg-cyan-100" iconColor="text-cyan-600" />,
        ];

      case 'SPARE_PART':
        return [
          ...common,
          <StatCard key="installed" label="Installed" value={asset.assigned} icon={Wrench} iconBg="bg-blue-100" iconColor="text-blue-600" />,
          <StatCard key="value" label="Inventory Value" value={formatCurrency(totalValue)} icon={DollarSign} iconBg="bg-emerald-100" iconColor="text-emerald-600" />,
          <StatCard key="disposed" label="Disposed" value={disposedCount} icon={Trash2} iconBg="bg-gray-100" iconColor="text-gray-400" />,
        ];

      case 'CONSUMABLE': {
        const isExpiring = apiDetail.consumableExpiryDate
          ? new Date(apiDetail.consumableExpiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : false;
        const isExpired = apiDetail.consumableExpiryDate
          ? new Date(apiDetail.consumableExpiryDate) < new Date()
          : false;
        return [
          ...common,
          <StatCard key="value" label="Inventory Value" value={formatCurrency(totalValue)} icon={DollarSign} iconBg="bg-emerald-100" iconColor="text-emerald-600" />,
          <StatCard
            key="expiry"
            label="Expiry"
            value={apiDetail.consumableExpiryDate ? formatDate(apiDetail.consumableExpiryDate) : 'N/A'}
            icon={isExpired ? AlertTriangle : Calendar}
            iconBg={isExpired ? 'bg-red-100' : isExpiring ? 'bg-yellow-100' : 'bg-gray-100'}
            iconColor={isExpired ? 'text-red-600' : isExpiring ? 'text-yellow-600' : 'text-gray-500'}
            subtitle={isExpired ? 'Expired!' : isExpiring ? 'Expiring soon' : undefined}
            alert={isExpired}
          />,
          <StatCard key="disposed" label="Disposed" value={disposedCount} icon={Trash2} iconBg="bg-gray-100" iconColor="text-gray-400" />,
        ];
      }

      case 'TOOL_EQUIPMENT': {
        const isCheckedOut = !!apiDetail.toolCheckedOutTo;
        const needsCalibration = apiDetail.toolCalibrationDueDate
          ? new Date(apiDetail.toolCalibrationDueDate) < new Date()
          : false;
        return [
          ...common,
          <StatCard
            key="status"
            label="Checkout Status"
            value={isCheckedOut ? 'Checked Out' : 'Available'}
            icon={isCheckedOut ? LogOut : CheckCircle2}
            iconBg={isCheckedOut ? 'bg-orange-100' : 'bg-green-100'}
            iconColor={isCheckedOut ? 'text-orange-600' : 'text-green-600'}
          />,
          <StatCard
            key="calibration"
            label="Calibration"
            value={needsCalibration ? 'Overdue' : apiDetail.toolCalibrationDueDate ? formatDate(apiDetail.toolCalibrationDueDate) : 'N/A'}
            icon={needsCalibration ? AlertTriangle : ClipboardCheck}
            iconBg={needsCalibration ? 'bg-red-100' : 'bg-gray-100'}
            iconColor={needsCalibration ? 'text-red-600' : 'text-gray-500'}
            subtitle={needsCalibration ? 'Calibration overdue!' : undefined}
            alert={needsCalibration}
          />,
          <StatCard key="condition" label="Condition" value={apiDetail.toolCondition?.replace('_', ' ') ?? '—'} icon={Shield} iconBg="bg-purple-100" iconColor="text-purple-600" />,
        ];
      }

      default:
        return [
          ...common,
          <StatCard key="assigned" label="Assigned" value={asset.assigned} icon={Truck} iconBg="bg-blue-100" iconColor="text-blue-600" />,
          <StatCard key="value" label="Value" value={formatCurrency(totalValue)} icon={DollarSign} iconBg="bg-emerald-100" iconColor="text-emerald-600" />,
          <StatCard key="disposed" label="Disposed" value={disposedCount} icon={Trash2} iconBg="bg-gray-100" iconColor="text-gray-400" />,
        ];
    }
  };

  // ===========================================================================
  // Type-specific action buttons
  // ===========================================================================

  const renderActions = () => {
    const hasStock = asset.inStock > 0;
    const hasInstalled = (stockSummary?.currentlyInstalled ?? asset.assigned) > 0;
    const isCheckedOut = !!apiDetail.toolCheckedOutTo;

    const purchaseBtn = (
      <Button key="purchase" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsPurchaseOpen(true)}>
        <ShoppingCart className="w-4 h-4 mr-2" />
        Purchase Stock
      </Button>
    );
    const assignBtn = (
      <Button key="assign" variant="outline" className="text-blue-600 border-gray-200 hover:bg-blue-50" onClick={() => setIsAssignOpen(true)}>
        <Truck className="w-4 h-4 mr-2" />
        {apiDetail.assetType === 'TYRE' ? 'Mount to Truck' : 'Install on Truck'}
      </Button>
    );
    const removeBtn = (
      <Button key="remove" variant="outline" className="text-gray-700 hover:bg-gray-50" onClick={() => setIsRemoveOpen(true)}>
        <MinusCircle className="w-4 h-4 mr-2" />
        {apiDetail.assetType === 'TYRE' ? 'Dismount' : 'Remove'}
      </Button>
    );
    const sellBtn = (
      <Button key="sell" variant="outline" className="text-gray-700 border-gray-200 hover:bg-gray-50" onClick={() => setIsSellOpen(true)}>
        <DollarSign className="w-4 h-4 mr-2" />
        Sell
      </Button>
    );
    const disposeBtn = (
      <Button key="dispose" variant="outline" className="text-gray-500 border-gray-200 hover:text-red-700 hover:bg-red-50 hover:border-red-200" onClick={() => setIsDisposeOpen(true)}>
        <Trash2 className="w-4 h-4 mr-2" />
        Dispose
      </Button>
    );
    const checkoutBtn = (
      <Button key="checkout" variant="outline" className="text-orange-600 border-gray-200 hover:bg-orange-50" onClick={() => setIsCheckoutOpen(true)}>
        <LogOut className="w-4 h-4 mr-2" />
        Check Out
      </Button>
    );
    const returnBtn = (
      <Button key="return" variant="outline" className="text-green-600 border-gray-200 hover:bg-green-50" onClick={() => setIsReturnOpen(true)}>
        <LogIn className="w-4 h-4 mr-2" />
        Return
      </Button>
    );

    const actions: React.ReactNode[] = [];

    switch (apiDetail.assetType) {
      case 'TYRE':
        actions.push(purchaseBtn);
        // For serialized assets: show mount only if not mounted, dismount only if mounted
        if (!hasInstalled && hasStock) actions.push(assignBtn);
        if (hasInstalled) actions.push(removeBtn);
        if (hasStock) actions.push(sellBtn, disposeBtn);
        break;

      case 'SPARE_PART':
        actions.push(purchaseBtn);
        if (hasStock) actions.push(assignBtn);
        if (hasInstalled) actions.push(removeBtn);
        if (hasStock) actions.push(sellBtn, disposeBtn);
        break;

      case 'CONSUMABLE':
        actions.push(purchaseBtn);
        if (hasStock) actions.push(sellBtn, disposeBtn);
        break;

      case 'TOOL_EQUIPMENT':
        actions.push(purchaseBtn);
        // Show checkout only if not currently checked out, return only if checked out
        if (!isCheckedOut && hasStock) actions.push(checkoutBtn);
        if (isCheckedOut) actions.push(returnBtn);
        if (hasStock) actions.push(disposeBtn);
        break;

      default:
        actions.push(purchaseBtn);
        if (hasStock) actions.push(sellBtn, disposeBtn);
        break;
    }

    return actions;
  };

  // ===========================================================================
  // Type-specific spec cards (overview section)
  // ===========================================================================

  const renderSpecCards = () => {
    switch (apiDetail.assetType) {
      case 'TYRE':
        return (
          <>
            <SpecCard title="Tyre Specifications" icon={CircleDot}>
              <InfoRow label="Brand" value={apiDetail.tyreBrand} />
              <InfoRow label="Model" value={apiDetail.tyreModel} />
              <InfoRow label="Size" value={apiDetail.tyreSize} mono />
              <InfoRow label="Type" value={apiDetail.tyreType} />
              <InfoRow label="Load Index" value={apiDetail.tyreLoadIndex} mono />
              <InfoRow label="Speed Rating" value={apiDetail.tyreSpeedRating} mono />
              <InfoRow label="DOT Code" value={apiDetail.tyreDotCode} mono />
              <InfoRow label="Serial Number" value={apiDetail.serialNumber} mono />
            </SpecCard>
            <SpecCard title="Tread & Mileage" icon={Gauge}>
              <InfoRow label="Current Tread Depth" value={apiDetail.tyreTreadDepth != null ? `${apiDetail.tyreTreadDepth} mm` : null} />
              <InfoRow label="Max Mileage Rating" value={formatNumber(apiDetail.tyreMaxMileage, 'km')} />
              <InfoRow label="Total Mileage Accrued" value={formatNumber(apiDetail.tyreTotalMileage, 'km')} />
              {apiDetail.tyreMaxMileage && apiDetail.tyreTotalMileage != null ? (
                <div className="col-span-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Life Remaining</span>
                  <div className="mt-2">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          (apiDetail.tyreTotalMileage / apiDetail.tyreMaxMileage) > 0.8
                            ? 'bg-red-500'
                            : (apiDetail.tyreTotalMileage / apiDetail.tyreMaxMileage) > 0.5
                              ? 'bg-yellow-500'
                              : 'bg-green-500',
                        )}
                        style={{ width: `${Math.max(0, Math.min(100, 100 - (apiDetail.tyreTotalMileage / apiDetail.tyreMaxMileage) * 100))}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {Math.max(0, Math.round(100 - (apiDetail.tyreTotalMileage / apiDetail.tyreMaxMileage) * 100))}% remaining
                      ({formatNumber(Math.max(0, apiDetail.tyreMaxMileage - apiDetail.tyreTotalMileage), 'km')} left)
                    </p>
                  </div>
                </div>
              ) : null}
            </SpecCard>
          </>
        );

      case 'SPARE_PART':
        return (
          <SpecCard title="Part Specifications" icon={Wrench}>
            <InfoRow label="OEM Number" value={apiDetail.sparePartOem} mono />
            <InfoRow label="Part Number" value={apiDetail.partNumber} mono />
            <InfoRow label="Condition" value={apiDetail.sparePartCondition?.replace('_', ' ')} />
            <InfoRow label="Expected Life" value={apiDetail.sparePartLifeKm ? formatNumber(apiDetail.sparePartLifeKm, 'km') : null} />
            <InfoRow label="Compatible Models" value={apiDetail.sparePartFitsModels} className="col-span-2" />
          </SpecCard>
        );

      case 'CONSUMABLE': {
        const isExpired = apiDetail.consumableExpiryDate
          ? new Date(apiDetail.consumableExpiryDate) < new Date()
          : false;
        return (
          <SpecCard title="Consumable Details" icon={Droplets}>
            <InfoRow label="Grade / Specification" value={apiDetail.consumableGrade} />
            <InfoRow label="Volume / Size" value={apiDetail.consumableVolume} />
            <InfoRow label="Unit of Measure" value={apiDetail.unitOfMeasure} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className={cn(
                  'text-sm font-medium',
                  isExpired ? 'text-red-600' : 'text-gray-900',
                )}>
                  {formatDate(apiDetail.consumableExpiryDate)}
                </span>
                {isExpired && (
                  <Badge variant="destructive" className="text-xs ml-1">Expired</Badge>
                )}
              </div>
            </div>
          </SpecCard>
        );
      }

      case 'TOOL_EQUIPMENT': {
        const isCheckedOut = !!apiDetail.toolCheckedOutTo;
        const needsCalibration = apiDetail.toolCalibrationDueDate
          ? new Date(apiDetail.toolCalibrationDueDate) < new Date()
          : false;
        return (
          <>
            <SpecCard title="Tool Details" icon={Settings}>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</span>
                <div className="mt-0.5">
                  <Badge variant="outline" className={cn(
                    'text-xs',
                    apiDetail.toolCondition === 'GOOD' ? 'bg-green-50 text-green-700 border-green-200'
                    : apiDetail.toolCondition === 'FAIR' ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : apiDetail.toolCondition === 'POOR' ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : apiDetail.toolCondition === 'NEEDS_REPAIR' ? 'bg-red-50 text-red-700 border-red-200'
                    : '',
                  )}>
                    {apiDetail.toolCondition?.replace('_', ' ') ?? '—'}
                  </Badge>
                </div>
              </div>
              <InfoRow label="Serial Number" value={apiDetail.serialNumber} mono />
            </SpecCard>
            <SpecCard title="Calibration" icon={ClipboardCheck}>
              <InfoRow label="Last Calibrated" value={formatDate(apiDetail.toolCalibrationDate)} icon={Calendar} />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className={cn(
                    'text-sm font-medium',
                    needsCalibration ? 'text-red-600' : 'text-gray-900',
                  )}>
                    {formatDate(apiDetail.toolCalibrationDueDate)}
                  </span>
                  {needsCalibration && (
                    <Badge variant="destructive" className="text-xs ml-1">Overdue</Badge>
                  )}
                </div>
              </div>
            </SpecCard>
            {isCheckedOut && (
              <Card className="border-orange-200 shadow-sm bg-orange-50/50 col-span-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <UserCheck className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-900">Currently Checked Out</p>
                      <p className="text-xs text-orange-700 mt-0.5">
                        Checked out to <span className="font-medium">{apiDetail.toolCheckedOutTo}</span>
                        {apiDetail.toolCheckoutDate && (
                          <> on {formatDate(apiDetail.toolCheckoutDate)}</>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        );
      }

      default:
        return null;
    }
  };

  // ===========================================================================
  // Common inventory & supplier info cards
  // ===========================================================================

  const renderCommonCards = () => (
    <>
      <SpecCard title="Inventory & Pricing" icon={Package}>
        <InfoRow label="Current Stock" value={asset.inStock} />
        <InfoRow label="Minimum Stock" value={asset.reorderLevel} />
        <InfoRow label="Unit Cost" value={formatCurrency(apiDetail.unitCost)} icon={DollarSign} />
        <InfoRow label="Total Value" value={formatCurrency(totalValue)} icon={DollarSign} />
        <InfoRow label="Unit of Measure" value={apiDetail.unitOfMeasure} />
        <InfoRow label="Storage Location" value={apiDetail.storageLocation} icon={MapPin} />
      </SpecCard>
      <SpecCard title="Supplier & Provenance" icon={Building2}>
        <InfoRow label="Supplier" value={apiDetail.supplier?.name ?? 'Not specified'} />
        <InfoRow label="Purchase Date" value={formatDate(apiDetail.purchaseDate)} icon={Calendar} />
        <InfoRow label="Warranty Expiry" value={formatDate(apiDetail.warrantyExpiry)} icon={Shield} />
        <InfoRow label="Part Number" value={apiDetail.partNumber} mono />
      </SpecCard>
    </>
  );

  // ===========================================================================
  // Type-specific tabs
  // ===========================================================================

  const renderTabs = () => {
    switch (apiDetail.assetType) {
      case 'TYRE':
        return (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full md:w-[500px] grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="installations" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Installations</TabsTrigger>
              <TabsTrigger value="movements" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Movements</TabsTrigger>
              <TabsTrigger value="units" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Stock Units</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="overview">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderStatCards()}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {renderSpecCards()}
                    {renderCommonCards()}
                    {renderNotesCard()}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="installations"><AssignmentsTab assignments={assignments} /></TabsContent>
              <TabsContent value="movements"><MovementsTab assetId={id} movementSummary={stockSummary?.movementsByType} /></TabsContent>
              <TabsContent value="units"><StockUnitsTab asset={asset} stockUnits={stockUnits} /></TabsContent>
            </div>
          </Tabs>
        );

      case 'SPARE_PART':
        return (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full md:w-[500px] grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="installations" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Installations</TabsTrigger>
              <TabsTrigger value="movements" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Movements</TabsTrigger>
              <TabsTrigger value="units" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Stock</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="overview">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderStatCards()}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {renderSpecCards()}
                    {renderCommonCards()}
                    {renderNotesCard()}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="installations"><AssignmentsTab assignments={assignments} /></TabsContent>
              <TabsContent value="movements"><MovementsTab assetId={id} movementSummary={stockSummary?.movementsByType} /></TabsContent>
              <TabsContent value="units"><StockUnitsTab asset={asset} stockUnits={stockUnits} /></TabsContent>
            </div>
          </Tabs>
        );

      case 'CONSUMABLE':
        return (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="movements" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Movements</TabsTrigger>
              <TabsTrigger value="stock" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Stock</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="overview">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderStatCards()}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {renderSpecCards()}
                    {renderCommonCards()}
                    {renderNotesCard()}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="movements"><MovementsTab assetId={id} movementSummary={stockSummary?.movementsByType} /></TabsContent>
              <TabsContent value="stock"><StockUnitsTab asset={asset} stockUnits={stockUnits} /></TabsContent>
            </div>
          </Tabs>
        );

      case 'TOOL_EQUIPMENT':
        return (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="movements" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Movements</TabsTrigger>
              <TabsTrigger value="units" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Stock Units</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="overview">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderStatCards()}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {renderSpecCards()}
                    {renderCommonCards()}
                    {renderNotesCard()}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="movements"><MovementsTab assetId={id} movementSummary={stockSummary?.movementsByType} /></TabsContent>
              <TabsContent value="units"><StockUnitsTab asset={asset} stockUnits={stockUnits} /></TabsContent>
            </div>
          </Tabs>
        );

      default:
        return (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="movements" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Movements</TabsTrigger>
              <TabsTrigger value="stock" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Stock</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="overview">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderStatCards()}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {renderCommonCards()}
                    {renderNotesCard()}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="movements"><MovementsTab assetId={id} movementSummary={stockSummary?.movementsByType} /></TabsContent>
              <TabsContent value="stock"><StockUnitsTab asset={asset} stockUnits={stockUnits} /></TabsContent>
            </div>
          </Tabs>
        );
    }
  };

  // ===========================================================================
  // Notes & description card
  // ===========================================================================

  const renderNotesCard = () => (
    <Card className="border-gray-200 shadow-sm bg-white col-span-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-500" />
          Description & Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {apiDetail.description && (
          <p className="text-sm text-gray-700">{apiDetail.description}</p>
        )}
        {apiDetail.notes && (
          <p className="text-sm text-gray-600 italic">{apiDetail.notes}</p>
        )}
        {!apiDetail.description && !apiDetail.notes && (
          <p className="text-sm text-gray-400 italic">No description or notes recorded.</p>
        )}
        <div className="flex items-center gap-4 pt-2 text-xs text-gray-400">
          <span>Created {formatDate(apiDetail.createdAt)}</span>
          <span>•</span>
          <span>Updated {formatDate(apiDetail.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/inventory" className="text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', typeConfig.bgColor)}>
              <TypeIcon className={cn('h-5 w-5', typeConfig.color)} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className={cn('text-xs', typeConfig.bgColor, typeConfig.color, typeConfig.borderColor)}>
                  {typeConfig.label}
                </Badge>
                {apiDetail.serialNumber && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {apiDetail.serialNumber}
                  </Badge>
                )}
                {apiDetail.partNumber && !apiDetail.serialNumber && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {apiDetail.partNumber}
                  </Badge>
                )}
                <Badge className={cn(
                  'text-xs',
                  isLowStock
                    ? 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
                )}>
                  {asset.stockStatus}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {renderActions()}
        </div>
      </div>

      {/* ── Tabs & Content ────────────────────────────────────────────── */}
      {renderTabs()}

      {/* ── Drawers ───────────────────────────────────────────────────── */}
      <PurchaseStockDrawer
        open={isPurchaseOpen}
        onOpenChange={setIsPurchaseOpen}
        initialAssetId={asset.id}
        onSuccess={fetchAssetData}
      />

      <AssignAssetDrawer
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        initialAssetId={asset.id}
        onSuccess={fetchAssetData}
      />

      <RemoveAssetDrawer
        open={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        initialAssetId={asset.id}
        onSuccess={fetchAssetData}
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

      {apiDetail.assetType === 'TOOL_EQUIPMENT' && (
        <>
          <ToolCheckoutDrawer
            open={isCheckoutOpen}
            onOpenChange={setIsCheckoutOpen}
            assetId={asset.id}
            assetName={apiDetail.name}
            onSuccess={fetchAssetData}
          />
          <ToolReturnDrawer
            open={isReturnOpen}
            onOpenChange={setIsReturnOpen}
            assetId={asset.id}
            assetName={apiDetail.name}
            onSuccess={fetchAssetData}
          />
        </>
      )}
    </div>
  );
}
