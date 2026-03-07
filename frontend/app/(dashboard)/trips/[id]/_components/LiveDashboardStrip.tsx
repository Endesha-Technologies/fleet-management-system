'use client';

import { useMemo } from 'react';
import { Gauge, Fuel, MapPin, Clock, Navigation, Activity } from 'lucide-react';
import type { LiveDashboardStripProps } from '../_types';

// ---------------------------------------------------------------------------
// Helper: format duration
// ---------------------------------------------------------------------------
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function LiveDashboardStrip({ trip }: LiveDashboardStripProps) {
  const isLive = trip.status === 'IN_PROGRESS' || trip.status === 'DELAYED';
  const isCompleted = trip.status === 'COMPLETED';

  const metrics = useMemo(() => {
    if (isLive && trip.currentPosition) {
      const cp = trip.currentPosition;
      const startTime = trip.actualStartTime ? new Date(trip.actualStartTime).getTime() : Date.now();
      const elapsed = (Date.now() - startTime) / 60000; // minutes
      const distTraveled = cp.odometer - (trip.odometerAtStart ?? cp.odometer);
      const progress = trip.route.estimatedDistanceKm > 0
        ? Math.min(100, Math.round((distTraveled / trip.route.estimatedDistanceKm) * 100))
        : 0;
      const etaMin = Math.max(0, trip.route.estimatedDurationMin - elapsed);

      return {
        speed: { value: `${cp.speed}`, unit: 'km/h', isOverLimit: (trip.route.speedLimitKmh ?? 999) < cp.speed },
        fuel: { value: `${cp.fuelLevel}`, unit: 'L', startValue: trip.fuelAtStartLiters },
        distance: { value: `${distTraveled}`, unit: 'km traveled' },
        duration: { value: formatDuration(elapsed), unit: 'elapsed' },
        eta: { value: formatDuration(etaMin), unit: 'remaining' },
        odometer: { value: cp.odometer.toLocaleString(), unit: 'km' },
      };
    }

    if (isCompleted) {
      const fuelUsed = (trip.fuelAtStartLiters ?? 0) - (trip.fuelAtEndLiters ?? 0);
      return {
        speed: { value: `${trip.averageSpeedKmh ?? 0}`, unit: 'km/h avg', isOverLimit: false },
        fuel: { value: `${fuelUsed.toFixed(1)}`, unit: 'L used', startValue: trip.fuelAtStartLiters },
        distance: { value: `${trip.distanceTraveledKm ?? 0}`, unit: 'km total' },
        duration: { value: formatDuration(trip.durationMinutes ?? 0), unit: 'total' },
        eta: { value: '—', unit: 'complete' },
        odometer: { value: (trip.odometerAtEnd ?? 0).toLocaleString(), unit: 'km' },
      };
    }

    // Scheduled / Cancelled
    return {
      speed: { value: '—', unit: 'km/h', isOverLimit: false },
      fuel: { value: '—', unit: 'L' },
      distance: { value: `${trip.route.estimatedDistanceKm}`, unit: 'km est.' },
      duration: { value: formatDuration(trip.route.estimatedDurationMin), unit: 'est.' },
      eta: { value: '—', unit: '' },
      odometer: { value: trip.odometerAtStart?.toLocaleString() ?? '—', unit: 'km' },
    };
  }, [trip, isLive, isCompleted]);

  const cards: Array<{ icon: React.ElementType; label: string; value: string; unit: string; highlight?: boolean }> = [
    { icon: Gauge, label: 'Speed', ...metrics.speed, highlight: metrics.speed.isOverLimit },
    { icon: Fuel, label: 'Fuel', value: metrics.fuel.value, unit: metrics.fuel.unit },
    { icon: MapPin, label: 'Distance', value: metrics.distance.value, unit: metrics.distance.unit },
    { icon: Clock, label: 'Duration', value: metrics.duration.value, unit: metrics.duration.unit },
    { icon: Navigation, label: 'ETA', value: metrics.eta.value, unit: metrics.eta.unit },
    { icon: Activity, label: 'Odometer', value: metrics.odometer.value, unit: metrics.odometer.unit },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-lg border p-2.5 md:p-3 ${
            card.highlight ? 'border-red-300 bg-red-50' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <card.icon className={`h-3.5 w-3.5 ${card.highlight ? 'text-red-500' : 'text-gray-400'}`} />
            <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide">{card.label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg md:text-xl font-bold ${card.highlight ? 'text-red-600' : 'text-gray-900'}`}>
              {card.value}
            </span>
            <span className="text-[10px] md:text-xs text-gray-400">{card.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
