'use client';

import dynamic from 'next/dynamic';
import type { TripMapProps } from '../_types';

/**
 * Dynamic wrapper for TripMap – disables SSR because Leaflet
 * accesses `window` / `document` at import-time.
 */
const LazyTripMap = dynamic(
  () => import('./TripMap').then((mod) => ({ default: mod.TripMap })),
  {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-gray-400">
        <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm">Loading map…</span>
      </div>
    </div>
  ),
});

export default function TripMapWrapper(props: TripMapProps) {
  return <LazyTripMap {...props} />;
}
