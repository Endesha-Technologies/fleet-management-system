'use client';

import {
  MapPin,
  Navigation,
  Clock,
  AlertTriangle,
  Gauge,
  Calendar,
  Tag,
  FileText,
  Truck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RouteMap } from './RouteMap';
import type { Route, RouteType, RouteStatus } from '@/types/route';

// ---------------------------------------------------------------------------
// Badge configs
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<RouteType, { label: string; className: string }> = {
  SHORT_HAUL: {
    label: 'Short Haul',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  LONG_HAUL: {
    label: 'Long Haul',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  REGIONAL: {
    label: 'Regional',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  INTERNATIONAL: {
    label: 'International',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
};

const STATUS_CONFIG: Record<RouteStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface OverviewTabProps {
  route: Route;
}

export function OverviewTab({ route }: OverviewTabProps) {
  const typeConfig = TYPE_CONFIG[route.type];
  const statusConfig = STATUS_CONFIG[route.status];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Left Column (3/5) - Map & Route Path ──────────────────────── */}
      <div className="lg:col-span-3 space-y-4">
        {/* Map */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <RouteMap
            origin={route.origin}
            destination={route.destination}
            className="h-[300px] lg:h-[400px]"
          />
          
          {/* Route Path - Compact inline below map */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              {/* Origin */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-500 uppercase">Origin</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{route.origin.name}</p>
                </div>
              </div>

              {/* Connector */}
              <div className="flex items-center gap-1 text-gray-300 shrink-0">
                <div className="w-6 h-px bg-gray-300" />
                <Navigation className="h-3 w-3 text-gray-400 rotate-90" />
                <div className="w-6 h-px bg-gray-300" />
              </div>

              {/* Destination */}
              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-500 uppercase">Destination</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{route.destination.name}</p>
                </div>
                <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes (if any) - shown below route path on left column */}
        {route.notes && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              Notes
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{route.notes}</p>
          </div>
        )}
      </div>

      {/* ── Right Column (2/5) - Stats & Details ──────────────────────── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={Navigation}
              iconColor="text-blue-500"
              iconBg="bg-blue-100"
              label="Distance"
              value={route.distance}
            />
            <StatCard
              icon={Clock}
              iconColor="text-emerald-500"
              iconBg="bg-emerald-100"
              label="Duration"
              value={route.estimatedDuration}
            />
            <StatCard
              icon={AlertTriangle}
              iconColor="text-amber-500"
              iconBg="bg-amber-100"
              label="Deviation"
              value={`${route.deviationThresholdKm} km`}
            />
            <StatCard
              icon={Truck}
              iconColor="text-purple-500"
              iconBg="bg-purple-100"
              label="Trips"
              value={route.tripCount.toString()}
            />
          </div>
        </div>

        {/* Route Information */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Route Information</h3>
          <dl className="space-y-3">
            <DetailRow icon={Tag} label="Route Code" value={route.code} />
            <DetailRow
              icon={Tag}
              label="Type"
              value={
                <Badge variant="outline" className={typeConfig.className}>
                  {typeConfig.label}
                </Badge>
              }
            />
            <DetailRow
              icon={Tag}
              label="Status"
              value={
                <Badge className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
              }
            />
            {route.speedLimitKmh && (
              <DetailRow
                icon={Gauge}
                label="Speed Limit"
                value={`${route.speedLimitKmh} km/h`}
              />
            )}
            <DetailRow
              icon={Tag}
              label="Ad-hoc Route"
              value={route.isAdHoc ? 'Yes' : 'No'}
            />
          </dl>
        </div>

        {/* Timestamps */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Timeline</h3>
          <dl className="space-y-3">
            <DetailRow
              icon={Calendar}
              label="Created"
              value={new Date(route.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
            <DetailRow
              icon={Calendar}
              label="Updated"
              value={new Date(route.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
          </dl>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <div className={`h-7 w-7 rounded-md ${iconBg} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{label}</p>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-gray-400 shrink-0" />
      <dt className="text-sm text-gray-500 w-28 shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}
