'use client';

import { useMemo } from 'react';
import type { TripProgressBarProps } from '../_types';

export function TripProgressBar({ trip }: TripProgressBarProps) {
  const isLive = trip.status === 'IN_PROGRESS' || trip.status === 'DELAYED';
  const isCompleted = trip.status === 'COMPLETED';

  // Calculate truck progress percentage
  const truckProgress = useMemo(() => {
    if (isCompleted) return 100;
    if (!isLive || !trip.currentPosition) return 0;
    const dist = trip.currentPosition.odometer - (trip.odometerAtStart ?? 0);
    return Math.min(100, Math.max(0, (dist / trip.route.estimatedDistanceKm) * 100));
  }, [isLive, isCompleted, trip]);

  // Collect events and position them on the timeline
  const events = useMemo(() => {
    const items: Array<{ type: 'stop' | 'incident' | 'deviation' | 'fuel'; label: string; position: number; color: string }> = [];
    const totalDist = trip.route.estimatedDistanceKm || 1;

    // Stops – place proportionally
    trip.stops.forEach((s, i) => {
      const pos = ((i + 1) / (trip.stops.length + 2)) * 80 + 10;
      items.push({ type: 'stop', label: s.locationName, position: pos, color: 'bg-orange-400' });
    });

    // Incidents
    trip.incidents.forEach((inc, i) => {
      const pos = ((i + 1) / (trip.incidents.length + 2)) * 60 + 20;
      items.push({ type: 'incident', label: inc.description, position: Math.min(95, pos), color: 'bg-yellow-500' });
    });

    // Deviations
    trip.deviations.forEach((dev, i) => {
      const pos = ((i + 1) / (trip.deviations.length + 2)) * 60 + 20;
      items.push({ type: 'deviation', label: `${dev.distanceOffRouteKm}km off`, position: Math.min(95, pos + 5), color: 'bg-red-500' });
    });

    return items;
  }, [trip]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      <div className="relative">
        {/* Track */}
        <div className="h-2 bg-gray-100 rounded-full relative overflow-visible">
          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${truckProgress}%` }}
          />

          {/* Event markers */}
          {events.map((evt, i) => (
            <div
              key={`${evt.type}-${i}`}
              className="absolute top-1/2 -translate-y-1/2 z-10 group"
              style={{ left: `${evt.position}%` }}
            >
              <div className={`h-3 w-3 rounded-full ${evt.color} border-2 border-white shadow-sm`} />
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
                <div className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-lg">
                  {evt.label}
                </div>
              </div>
            </div>
          ))}

          {/* Truck marker */}
          {(isLive || isCompleted) && (
            <div
              className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-500"
              style={{ left: `${truckProgress}%` }}
            >
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] border-2 border-white shadow-md ${
                isLive ? 'bg-blue-600 animate-pulse' : 'bg-green-600'
              }`}>
                🚛
              </div>
            </div>
          )}
        </div>

        {/* Origin / Destination labels */}
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{trip.route.originName}</span>
          </div>
          {isLive && (
            <span className="text-[10px] font-medium text-blue-600">{Math.round(truckProgress)}%</span>
          )}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{trip.route.destinationName}</span>
            <span className="h-2 w-2 rounded-full bg-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
