'use client';

import { MapPin, Clock, OctagonX } from 'lucide-react';
import type { TripStopsProps } from '../_types';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(min: number | null): string {
  if (min === null) return 'Still stopped';
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function TripStops({ stops, onLocate }: TripStopsProps) {
  const totalStoppedMin = stops.reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
  const currentlyStopped = stops.some(s => !s.resumedAt);

  return (
    <div className="space-y-4 p-4 md:p-0">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Total Stops</p>
          <p className="text-xl font-bold text-gray-900">{stops.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Stopped Time</p>
          <p className="text-xl font-bold text-gray-900">{formatDuration(totalStoppedMin)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Currently Stopped</p>
          <p className={`text-xl font-bold ${currentlyStopped ? 'text-orange-600' : 'text-green-600'}`}>
            {currentlyStopped ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {/* Stops list */}
      {stops.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <OctagonX className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No stops recorded</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stops.map((stop, index) => (
            <div
              key={stop.id}
              className={`bg-white rounded-lg border p-3 ${
                !stop.resumedAt ? 'border-orange-300 bg-orange-50' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-orange-100 text-orange-600 text-xs font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{stop.locationName}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(stop.stoppedAt)}
                      </span>
                      <span className={`font-medium ${!stop.resumedAt ? 'text-orange-600' : 'text-gray-700'}`}>
                        {formatDuration(stop.durationMin)}
                      </span>
                      <span className="bg-gray-100 rounded-full px-2 py-0.5">{stop.reason}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onLocate(stop.lat, stop.lng)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                  title="View on map"
                >
                  <MapPin className="h-4 w-4 text-blue-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
