'use client';

import { MapPin, Clock, Truck, User, Users, FileText, Fuel, Gauge, CheckCircle } from 'lucide-react';
import type { TripOverviewProps } from '../_types';

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-UG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
}

export function TripOverview({ trip }: TripOverviewProps) {
  const isCompleted = trip.status === 'COMPLETED';
  const fuelUsed = (trip.fuelAtStartLiters ?? 0) - (trip.fuelAtEndLiters ?? 0);
  const efficiency = trip.distanceTraveledKm && fuelUsed > 0
    ? (trip.distanceTraveledKm / fuelUsed).toFixed(2)
    : null;

  return (
    <div className="space-y-6 p-4 md:p-0">
      {/* Completed Trip Summary */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Trip Completed</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-green-600">Duration</p>
              <p className="text-sm font-bold text-green-800">
                {trip.durationMinutes ? `${Math.floor(trip.durationMinutes / 60)}h ${trip.durationMinutes % 60}m` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-green-600">Distance</p>
              <p className="text-sm font-bold text-green-800">{trip.distanceTraveledKm ?? '—'} km</p>
            </div>
            <div>
              <p className="text-xs text-green-600">Avg Speed</p>
              <p className="text-sm font-bold text-green-800">{trip.averageSpeedKmh ?? '—'} km/h</p>
            </div>
            <div>
              <p className="text-xs text-green-600">Fuel Used</p>
              <p className="text-sm font-bold text-green-800">{fuelUsed > 0 ? `${fuelUsed.toFixed(1)} L` : '—'}</p>
            </div>
            {efficiency && (
              <div>
                <p className="text-xs text-green-600">Efficiency</p>
                <p className="text-sm font-bold text-green-800">{efficiency} km/L</p>
              </div>
            )}
            <div>
              <p className="text-xs text-green-600">Stops</p>
              <p className="text-sm font-bold text-green-800">{trip.stops.length}</p>
            </div>
            <div>
              <p className="text-xs text-green-600">Incidents</p>
              <p className="text-sm font-bold text-green-800">{trip.incidents.length}</p>
            </div>
            <div>
              <p className="text-xs text-green-600">Deviations</p>
              <p className="text-sm font-bold text-green-800">{trip.deviations.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cancelled reason */}
      {trip.status === 'CANCELLED' && trip.cancellationReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-1">Cancellation Reason</h3>
          <p className="text-sm text-red-700">{trip.cancellationReason}</p>
        </div>
      )}

      {/* Trip Information */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Trip Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0">
          <div className="space-y-0.5">
            <InfoRow icon={MapPin} label="Route" value={trip.routeName} />
            <InfoRow icon={MapPin} label="Origin" value={trip.route.originName} />
            <InfoRow icon={MapPin} label="Destination" value={trip.route.destinationName} />
          </div>
          <div className="space-y-0.5 pt-2 sm:pt-0">
            <InfoRow icon={Clock} label="Scheduled Start" value={formatDate(trip.scheduledStartTime)} />
            <InfoRow icon={Clock} label={trip.actualStartTime ? 'Actual Start' : 'Scheduled End'} value={formatDate(trip.actualStartTime ?? trip.scheduledEndTime)} />
            {trip.actualEndTime && <InfoRow icon={Clock} label="Actual End" value={formatDate(trip.actualEndTime)} />}
            <InfoRow icon={MapPin} label="Est. Distance" value={`${trip.route.estimatedDistanceKm} km`} />
            <InfoRow icon={Clock} label="Est. Duration" value={`${Math.floor(trip.route.estimatedDurationMin / 60)}h ${trip.route.estimatedDurationMin % 60}m`} />
          </div>
        </div>
      </div>

      {/* Vehicle & Crew */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Vehicle & Crew</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <div className="space-y-0.5">
            <InfoRow icon={Truck} label="Truck" value={`${trip.truckPlate}${trip.truckModel ? ` (${trip.truckModel})` : ''}`} />
            <InfoRow icon={User} label="Driver" value={`${trip.driverName}${trip.driverPhone ? ` — ${trip.driverPhone}` : ''}`} />
          </div>
          <div className="space-y-0.5">
            {trip.turnBoyName && (
              <InfoRow icon={Users} label="Turn Boy" value={`${trip.turnBoyName}${trip.turnBoyPhone ? ` — ${trip.turnBoyPhone}` : ''}`} />
            )}
          </div>
        </div>
      </div>

      {/* Readings */}
      {(trip.odometerAtStart || trip.fuelAtStartLiters) && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            {isCompleted ? 'Readings' : 'Readings at Start'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <div className="space-y-0.5">
              {trip.odometerAtStart && (
                <InfoRow icon={Gauge} label="Odometer (Start)" value={`${trip.odometerAtStart.toLocaleString()} km`} />
              )}
              {trip.odometerAtEnd && (
                <InfoRow icon={Gauge} label="Odometer (End)" value={`${trip.odometerAtEnd.toLocaleString()} km`} />
              )}
            </div>
            <div className="space-y-0.5">
              {trip.fuelAtStartLiters && (
                <InfoRow icon={Fuel} label="Fuel (Start)" value={`${trip.fuelAtStartLiters} L`} />
              )}
              {trip.fuelAtEndLiters && (
                <InfoRow icon={Fuel} label="Fuel (End)" value={`${trip.fuelAtEndLiters} L`} />
              )}
            </div>
          </div>
          {trip.dataSource && (
            <p className="text-xs text-gray-400 mt-2">Data source: {trip.dataSource}</p>
          )}
        </div>
      )}

      {/* Notes */}
      {(trip.notes || trip.dispatcherNotes) && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Notes</h3>
          {trip.dispatcherNotes && (
            <InfoRow icon={FileText} label="Dispatcher Notes" value={trip.dispatcherNotes} />
          )}
          {trip.notes && (
            <InfoRow icon={FileText} label="Trip Notes" value={trip.notes} />
          )}
        </div>
      )}
    </div>
  );
}
