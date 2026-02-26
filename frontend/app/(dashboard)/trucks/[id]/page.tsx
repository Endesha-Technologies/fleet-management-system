'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Map,
  Edit2,
  RefreshCw,
  Power,
  Loader2,
  Truck as TruckIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { TruckDetailSkeleton } from '../_components/details/TruckDetailSkeleton';
import { TruckOverview } from '../_components/details/TruckOverview';
import { TruckTrips } from '../_components/details/TruckTrips';
import { TruckFuel } from '../_components/details/TruckFuel';
import { TruckTyres } from '../_components/details/TruckTyres';
import { TruckMaintenance } from '../_components/details/TruckMaintenance';
import { TruckDocuments } from '../_components/details/TruckDocuments';
import { AddTruckDrawer } from '../_components/AddTruckDrawer';
import { trucksService } from '@/api/trucks/trucks.service';
import type { TruckStatus } from '@/api/trucks/trucks.types';
import {
  useTruckDetail,
  useTruckTyrePositions,
  useTruckMaintenanceHistory,
} from './_hooks';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'secondary' | 'destructive'; label: string }> = {
  ACTIVE: { variant: 'success', label: 'Active' },
  IN_MAINTENANCE: { variant: 'warning', label: 'In Maintenance' },
  INACTIVE: { variant: 'secondary', label: 'Inactive' },
  DECOMMISSIONED: { variant: 'destructive', label: 'Decommissioned' },
};

function formatBodyType(bt: string): string {
  return bt
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// ChangeStatusDialog
// ---------------------------------------------------------------------------

function ChangeStatusDialog({
  open,
  onOpenChange,
  truckId,
  currentStatus,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truckId: string;
  currentStatus: string;
  onComplete: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
      setError(null);
    }
  }, [open, currentStatus]);

  const statuses = [
    { value: 'ACTIVE', label: 'Active', description: 'Truck is operational and available for trips', color: 'bg-green-500' },
    { value: 'INACTIVE', label: 'Inactive', description: 'Truck is temporarily out of service', color: 'bg-gray-400' },
    { value: 'IN_MAINTENANCE', label: 'In Maintenance', description: 'Truck is undergoing maintenance or repairs', color: 'bg-yellow-500' },
    { value: 'DECOMMISSIONED', label: 'Decommissioned', description: 'Truck has been permanently retired', color: 'bg-red-500' },
  ];

  async function handleSubmit() {
    if (selectedStatus === currentStatus) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await trucksService.updateTruckStatus(truckId, { status: selectedStatus as TruckStatus });
      onOpenChange(false);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Change Truck Status</SheetTitle>
          <SheetDescription>Select the new status for this truck.</SheetDescription>
        </SheetHeader>

        {error && (
          <div className="mx-0 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedStatus(s.value)}
              disabled={s.value === currentStatus}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedStatus === s.value
                  ? 'border-blue-500 bg-blue-50'
                  : s.value === currentStatus
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${s.color}`} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.description}</p>
                </div>
                {s.value === currentStatus && (
                  <Badge variant="outline" className="ml-auto text-xs">Current</Badge>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedStatus === currentStatus}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating…
              </>
            ) : (
              'Confirm Status Change'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function TruckDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const truckId = params.id as string;

  // ---- Data fetching (real API) ----
  const { data: truck, isLoading, error, refetch: refetchTruck } = useTruckDetail(truckId);
  const {
    data: tyrePositions,
    isLoading: tyresLoading,
    refetch: refetchTyres,
  } = useTruckTyrePositions(truckId);
  const {
    data: maintenanceData,
    isLoading: maintenanceLoading,
    refetch: refetchMaintenance,
  } = useTruckMaintenanceHistory(truckId);

  // ---- Local UI state ----
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // ---- Loading state ----
  if (isLoading) return <TruckDetailSkeleton />;

  // ---- Error state ----
  if (error || !truck) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <div className="h-16 w-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-4">
          <TruckIcon className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {error ? 'Failed to load truck' : 'Truck not found'}
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
          {error ?? 'The truck you are looking for does not exist or has been removed.'}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          {error && (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={refetchTruck}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ---- Derived values ----
  const status = statusConfig[truck.status] ?? statusConfig.INACTIVE;
  const isOperational = truck.status === 'ACTIVE' || truck.status === 'IN_MAINTENANCE';

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <button
          onClick={() => router.push('/trucks')}
          className="hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Trucks
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">{truck.registrationNumber}</span>
      </nav>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {truck.registrationNumber}
            </h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {truck.make} {truck.model} • {truck.year} • {formatBodyType(truck.bodyType)}
            {truck.fleetNumber && ` • Fleet #${truck.fleetNumber}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isOperational && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Map className="h-4 w-4 mr-1.5" />
                Start Trip
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDrawer(true)}
              >
                <Edit2 className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            </>
          )}
          {truck.status !== 'DECOMMISSIONED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStatusDialog(true)}
            >
              <Power className="h-4 w-4 mr-1.5" />
              Change Status
            </Button>
          )}
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
            {truck._count.trips > 0 && (
              <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600">
                {truck._count.trips}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="fuel"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm whitespace-nowrap"
          >
            Fuel
            {truck._count.fuelLogs > 0 && (
              <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {truck._count.fuelLogs}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="tyres"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm whitespace-nowrap"
          >
            Tyres
          </TabsTrigger>
          <TabsTrigger
            value="maintenance"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm whitespace-nowrap"
          >
            Maintenance
            {truck._count.maintenancePlans > 0 && (
              <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {truck._count.maintenancePlans}
              </span>
            )}
          </TabsTrigger>
          {/* <TabsTrigger
            value="documents"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm whitespace-nowrap"
          >
            Documents
            {truck._count.documents > 0 && (
              <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {truck._count.documents}
              </span>
            )}
          </TabsTrigger> */}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview">
            <TruckOverview truck={truck} />
          </TabsContent>

          <TabsContent value="trips">
            <TruckTrips truckId={truck.id} />
          </TabsContent>

          <TabsContent value="fuel">
            <TruckFuel truckId={truck.id} />
          </TabsContent>

          <TabsContent value="tyres">
            <TruckTyres
              truckId={truck.id}
              truck={truck}
              tyrePositions={tyrePositions}
              isLoading={tyresLoading}
              onRefresh={refetchTyres}
              readOnly={!isOperational}
            />
          </TabsContent>

          <TabsContent value="maintenance">
            <TruckMaintenance
              truckId={truck.id}
              maintenanceData={maintenanceData}
              isLoading={maintenanceLoading}
              onRefresh={refetchMaintenance}
              readOnly={!isOperational}
            />
          </TabsContent>

          <TabsContent value="documents">
            <TruckDocuments truckId={truck.id} />
          </TabsContent>
        </div>
      </Tabs>

      {/* ── Edit Drawer ──────────────────────────────────────────────── */}
      <AddTruckDrawer
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
        initialTruck={truck}
        onAddComplete={() => {
          setShowEditDrawer(false);
          refetchTruck();
        }}
      />

      {/* ── Change Status Dialog ─────────────────────────────────────── */}
      <ChangeStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        truckId={truck.id}
        currentStatus={truck.status}
        onComplete={refetchTruck}
      />
    </div>
  );
}
