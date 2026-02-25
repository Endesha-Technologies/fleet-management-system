'use client';

import React from 'react';
import {
  Eye,
  MapPin,
  TrendingUp,
  Calendar,
  Truck,
  Fuel,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTruckTrips } from '../../[id]/_hooks';
import { TabContentSkeleton } from './TruckDetailSkeleton';
import type { TruckTripsProps, TripStatus } from '../../_types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const statusConfig: Record<TripStatus, { variant: 'success' | 'info' | 'warning' | 'secondary'; label: string }> = {
  COMPLETED: { variant: 'success', label: 'Completed' },
  IN_PROGRESS: { variant: 'info', label: 'In Progress' },
  SCHEDULED: { variant: 'warning', label: 'Scheduled' },
  CANCELLED: { variant: 'secondary', label: 'Cancelled' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TruckTrips({ truckId }: TruckTripsProps) {
  const { data: trips, isLoading, error } = useTruckTrips(truckId);

  if (isLoading) return <TabContentSkeleton rows={5} />;

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-600 font-medium">Failed to load trips</p>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
      </div>
    );
  }

  const tripList = trips ?? [];

  // Compute summary stats from real data
  const totalDistance = tripList.reduce((sum, t) => sum + (t.distanceKm ?? 0), 0);
  const totalFuel = tripList.reduce((sum, t) => sum + (t.fuelUsedLiters ?? 0), 0);
  const completedTrips = tripList.filter((t) => t.status === 'COMPLETED').length;
  const avgConsumption =
    totalDistance > 0 ? ((totalFuel / totalDistance) * 100).toFixed(1) : '—';

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          icon={Truck}
          label="Total Trips"
          value={String(tripList.length)}
          color="blue"
        />
        <SummaryCard
          icon={MapPin}
          label="Total Distance"
          value={`${totalDistance.toLocaleString()} km`}
          color="green"
        />
        <SummaryCard
          icon={Fuel}
          label="Total Fuel"
          value={`${totalFuel.toLocaleString()} L`}
          color="orange"
        />
        <SummaryCard
          icon={BarChart3}
          label="Avg Consumption"
          value={avgConsumption === '—' ? '—' : `${avgConsumption} L/100km`}
          color="purple"
        />
      </div>

      {/* Trip table */}
      {tripList.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-600">Trip #</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Route</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Distance</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Fuel</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Driver</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {tripList.map((trip) => {
                const cfg = statusConfig[trip.status] ?? statusConfig.COMPLETED;
                return (
                  <tr
                    key={trip.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-blue-600">{trip.tripNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(trip.departureDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 truncate max-w-[200px]">
                          {trip.origin} → {trip.destination}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                      {trip.distanceKm.toLocaleString()} km
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {trip.fuelUsedLiters > 0 ? `${trip.fuelUsedLiters} L` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{trip.driverName}</td>
                    <td className="px-4 py-3">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4 text-gray-500" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-gray-200 border-dashed rounded-lg p-12 text-center">
      <div className="h-14 w-14 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <TrendingUp className="h-7 w-7" />
      </div>
      <h3 className="text-base font-medium text-gray-900 mb-1">No trips recorded</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        Trips for this truck will appear here once they are created. Start a new trip to begin tracking.
      </p>
    </div>
  );
}
