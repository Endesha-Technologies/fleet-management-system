'use client';

import { Fuel, MapPin } from 'lucide-react';
import type { TripFuelLogsProps } from '../_types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-UG', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatCurrency(amount: number): string {
  return `UGX ${amount.toLocaleString()}`;
}

export function TripFuelLogs({ fuelLogs, trip, onLocate }: TripFuelLogsProps) {
  const totalLiters = fuelLogs.reduce((sum, l) => sum + l.liters, 0);
  const totalCost = fuelLogs.reduce((sum, l) => sum + l.totalCost, 0);
  const fuelConsumed = (trip.fuelAtStartLiters ?? 0) - (trip.fuelAtEndLiters ?? (trip.currentPosition?.fuelLevel ?? trip.fuelAtStartLiters ?? 0));
  const efficiency = trip.distanceTraveledKm && fuelConsumed > 0
    ? (trip.distanceTraveledKm / fuelConsumed).toFixed(1)
    : null;

  return (
    <div className="space-y-4 p-4 md:p-0">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Total Fueled</p>
          <p className="text-lg font-bold text-gray-900">{totalLiters} L</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Total Cost</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(totalCost)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Fuel Consumed</p>
          <p className="text-lg font-bold text-gray-900">{fuelConsumed > 0 ? `${fuelConsumed.toFixed(1)} L` : '—'}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Efficiency</p>
          <p className="text-lg font-bold text-gray-900">{efficiency ? `${efficiency} km/L` : '—'}</p>
        </div>
      </div>

      {/* Fuel logs */}
      {fuelLogs.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Fuel className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No fuel logs recorded</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-2 md:hidden">
            {fuelLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg border border-gray-100 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-green-600 shrink-0" />
                      <p className="text-sm font-medium text-gray-900">{log.station}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                      <span>{formatDate(log.date)}</span>
                      <span className="font-medium text-gray-700">{log.liters} L</span>
                      <span>{formatCurrency(log.costPerLiter)}/L</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(log.totalCost)}</span>
                      <span>Odo: {log.odometer.toLocaleString()} km</span>
                      {log.receiptNumber && (
                        <span className="bg-gray-100 rounded-full px-2 py-0.5">{log.receiptNumber}</span>
                      )}
                    </div>
                  </div>
                  {log.stationLat && log.stationLng && (
                    <button
                      onClick={() => onLocate(log.stationLat!, log.stationLng!)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                      title="View on map"
                    >
                      <MapPin className="h-4 w-4 text-blue-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="py-2.5 pr-3 font-medium">Date</th>
                  <th className="py-2.5 pr-3 font-medium">Station</th>
                  <th className="py-2.5 pr-3 font-medium text-right">Liters</th>
                  <th className="py-2.5 pr-3 font-medium text-right">Cost/L</th>
                  <th className="py-2.5 pr-3 font-medium text-right">Total</th>
                  <th className="py-2.5 pr-3 font-medium text-right">Odometer</th>
                  <th className="py-2.5 pr-3 font-medium">Receipt</th>
                  <th className="py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fuelLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-3 whitespace-nowrap text-gray-600">{formatDate(log.date)}</td>
                    <td className="py-2.5 pr-3 font-medium text-gray-900 whitespace-nowrap">{log.station}</td>
                    <td className="py-2.5 pr-3 text-right text-gray-900 font-medium">{log.liters} L</td>
                    <td className="py-2.5 pr-3 text-right text-gray-500">{formatCurrency(log.costPerLiter)}</td>
                    <td className="py-2.5 pr-3 text-right text-gray-900 font-semibold">{formatCurrency(log.totalCost)}</td>
                    <td className="py-2.5 pr-3 text-right text-gray-500">{log.odometer.toLocaleString()}</td>
                    <td className="py-2.5 pr-3 text-gray-500">
                      {log.receiptNumber && (
                        <span className="bg-gray-100 rounded-full px-2 py-0.5 text-xs">{log.receiptNumber}</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      {log.stationLat && log.stationLng && (
                        <button
                          onClick={() => onLocate(log.stationLat!, log.stationLng!)}
                          className="p-1 rounded hover:bg-gray-100 transition-colors"
                          title="View on map"
                        >
                          <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
