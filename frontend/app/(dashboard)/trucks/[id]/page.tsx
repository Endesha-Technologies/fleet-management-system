'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Map,
  Edit2,
  RefreshCw,
  Gauge,
  Clock,
  Droplet,
  Wrench,
  MoreVertical,
  Power,
  Trash2,
  FileText,
  Truck as TruckIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '../_components/StatsCard';
import { TruckDetailSkeleton } from '../_components/details/TruckDetailSkeleton';
import { TruckOverview } from '../_components/details/TruckOverview';
import { TruckTrips } from '../_components/details/TruckTrips';
import { TruckFuel } from '../_components/details/TruckFuel';
import { TruckTyres } from '../_components/details/TruckTyres';
import { TruckMaintenance } from '../_components/details/TruckMaintenance';
import { TruckDocuments } from '../_components/details/TruckDocuments';
import { AddTruckDrawer } from '../_components/AddTruckDrawer';
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
  const [showActionsMenu, setShowActionsMenu] = useState(false);

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

          {/* More actions dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => setShowActionsMenu((v) => !v)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showActionsMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActionsMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                  <MenuAction
                    icon={RefreshCw}
                    label="Rotate Tyres"
                    onClick={() => {
                      setShowActionsMenu(false);
                      setActiveTab('tyres');
                    }}
                  />
                  <MenuAction
                    icon={Wrench}
                    label="Log Maintenance"
                    onClick={() => {
                      setShowActionsMenu(false);
                      setActiveTab('maintenance');
                    }}
                  />
                  <MenuAction
                    icon={FileText}
                    label="Upload Document"
                    onClick={() => {
                      setShowActionsMenu(false);
                      setActiveTab('documents');
                    }}
                  />
                  <hr className="my-1 border-gray-100" />
                  <MenuAction
                    icon={Power}
                    label="Change Status"
                    onClick={() => setShowActionsMenu(false)}
                  />
                  <MenuAction
                    icon={Trash2}
                    label="Delete Truck"
                    onClick={() => setShowActionsMenu(false)}
                    danger
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Overview ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Gauge}
          label="Odometer"
          value={`${truck.currentOdometer.toLocaleString()} km`}
          subtext={`Updated ${new Date(truck.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
          color="blue"
        />
        <StatsCard
          icon={Clock}
          label="Engine Hours"
          value={`${truck.engineHours.toLocaleString()} hrs`}
          subtext="Total run time"
          color="green"
        />
        <StatsCard
          icon={Map}
          label="Total Trips"
          value={String(truck._count.trips)}
          subtext={`${truck._count.fuelLogs} fuel logs`}
          color="purple"
        />
        <StatsCard
          icon={Droplet}
          label="Fuel Tank"
          value={truck.tankCapacityLiters ? `${truck.tankCapacityLiters} L` : '—'}
          subtext={truck.fuelType}
          color="orange"
        />
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
          <TabsTrigger
            value="documents"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm whitespace-nowrap"
          >
            Documents
            {truck._count.documents > 0 && (
              <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {truck._count.documents}
              </span>
            )}
          </TabsTrigger>
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
            />
          </TabsContent>

          <TabsContent value="maintenance">
            <TruckMaintenance
              truckId={truck.id}
              maintenanceData={maintenanceData}
              isLoading={maintenanceLoading}
              onRefresh={refetchMaintenance}
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function MenuAction({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
        ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}
      `}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
