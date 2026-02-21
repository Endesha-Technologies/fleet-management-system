'use client';

import dynamic from 'next/dynamic';

const FleetTrackingPage = dynamic(
  () => import('../_components/FleetTracking'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }
);

export default function TrackingPage() {
  return (
    <div className="h-full w-full -mt-4 -mr-4 md:-mt-6 md:-mr-6 md:-mb-6 pb-16 md:pb-0">
      <FleetTrackingPage />
    </div>
  );
}
