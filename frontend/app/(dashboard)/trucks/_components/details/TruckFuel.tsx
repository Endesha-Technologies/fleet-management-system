'use client';

import React from 'react';
import {
  Droplet,
  TrendingDown,
  DollarSign,
  Calendar,
  Fuel,
  MapPin,
  BarChart3,
} from 'lucide-react';
import { useTruckFuelLogs, useTruckFuelSummary } from '../../[id]/_hooks';
import { TabContentSkeleton } from './TruckDetailSkeleton';
import type { TruckFuelProps } from '../../_types';

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

function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TruckFuel({ truckId }: TruckFuelProps) {
  const { data: fuelLogs, isLoading: logsLoading, error: logsError } = useTruckFuelLogs(truckId);
  const { data: summary, isLoading: summaryLoading } = useTruckFuelSummary(truckId);

  const isLoading = logsLoading || summaryLoading;

  if (isLoading) return <TabContentSkeleton rows={4} />;

  if (logsError) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-600 font-medium">Failed to load fuel data</p>
        <p className="text-sm text-gray-500 mt-1">{logsError}</p>
      </div>
    );
  }

  const logs = fuelLogs ?? [];

  // Derive summary from logs if the summary endpoint isn't available
  const totalLiters = summary?.totalLiters ?? logs.reduce((s, l) => s + l.liters, 0);
  const totalCost = summary?.totalCost ?? logs.reduce((s, l) => s + l.totalCost, 0);
  const avgConsumption = summary?.avgConsumption ?? 0;
  const lastRefuelDate = summary?.lastRefuelDate ?? (logs.length > 0 ? logs[0].date : null);

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={BarChart3}
          label="Avg Consumption"
          value={avgConsumption > 0 ? `${avgConsumption.toFixed(1)} L/100km` : '—'}
          color="orange"
        />
        <KpiCard
          icon={DollarSign}
          label="Total Fuel Cost"
          value={formatCurrency(totalCost)}
          color="blue"
        />
        <KpiCard
          icon={Droplet}
          label="Total Litres"
          value={`${totalLiters.toLocaleString()} L`}
          color="cyan"
        />
        <KpiCard
          icon={Calendar}
          label="Last Refuel"
          value={lastRefuelDate ? formatDate(lastRefuelDate) : '—'}
          color="green"
        />
      </div>

      {/* Fuel log table */}
      {logs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Station</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Litres</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Cost/L</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Total Cost</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Odometer</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Driver</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {formatDate(log.date)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-gray-700 truncate">{log.station}</p>
                        {log.location && (
                          <p className="text-xs text-gray-400 truncate">{log.location}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {log.liters.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {log.costPerLiter.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(log.totalCost)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 font-mono text-xs">
                    {log.odometerReading.toLocaleString()} km
                  </td>
                  <td className="px-4 py-3 text-gray-700">{log.driverName}</td>
                </tr>
              ))}
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

function KpiCard({
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
    orange: 'text-orange-600 bg-orange-50',
    blue: 'text-blue-600 bg-blue-50',
    cyan: 'text-cyan-600 bg-cyan-50',
    green: 'text-green-600 bg-green-50',
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
      <div className="h-14 w-14 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <Fuel className="h-7 w-7" />
      </div>
      <h3 className="text-base font-medium text-gray-900 mb-1">No fuel records</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        Fuel logs for this truck will appear here once refuelling data is recorded.
      </p>
    </div>
  );
}
