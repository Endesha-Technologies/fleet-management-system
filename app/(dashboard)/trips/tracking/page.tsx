'use client';

import dynamic from 'next/dynamic';

const FleetTrackingPage = dynamic(
  () => import('@/components/features/trips/FleetTracking'),
  { ssr: false }
);

export default function TrackingPage() {
  return <FleetTrackingPage />;
}
