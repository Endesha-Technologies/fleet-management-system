'use client';

import { MapPin, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TripDeviationsProps } from '../_types';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-UG', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function TripDeviations({ deviations, onAcknowledge, onLocate }: TripDeviationsProps) {
  const unacknowledged = deviations.filter(d => !d.acknowledged);
  const maxDist = deviations.length > 0 ? Math.max(...deviations.map(d => d.distanceOffRouteKm)) : 0;

  return (
    <div className="space-y-4 p-4 md:p-0">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">{deviations.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Unacknowledged</p>
          <p className={`text-xl font-bold ${unacknowledged.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {unacknowledged.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Max Distance</p>
          <p className="text-xl font-bold text-gray-900">{maxDist.toFixed(1)} km</p>
        </div>
      </div>

      {/* List */}
      {deviations.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No deviations detected</p>
        </div>
      ) : (
        <div className="space-y-2">
          {deviations.map((dev, index) => (
            <div
              key={dev.id}
              className={`rounded-lg border p-3 ${
                !dev.acknowledged ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold shrink-0 mt-0.5 ${
                    !dev.acknowledged ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {dev.distanceOffRouteKm.toFixed(1)} km off route
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Detected at {formatTime(dev.detectedAt)}
                    </p>
                    {dev.acknowledged && (
                      <span className="flex items-center gap-1 text-xs text-green-600 mt-1">
                        <Check className="h-3 w-3" /> Acknowledged
                        {dev.acknowledgedBy && ` by ${dev.acknowledgedBy}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!dev.acknowledged && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => onAcknowledge(dev.id)}>
                      Acknowledge
                    </Button>
                  )}
                  <button
                    onClick={() => onLocate(dev.lat, dev.lng)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="View on map"
                  >
                    <MapPin className="h-4 w-4 text-blue-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
