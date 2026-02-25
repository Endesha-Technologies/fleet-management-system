import React from 'react';

/** Pulsing placeholder block. */
function Bone({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

/**
 * Full-page skeleton displayed while the truck detail API call is in-flight.
 * Mirrors the layout of the real page so there's no layout shift on load.
 */
export function TruckDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Bone className="h-4 w-20" />
        <Bone className="h-4 w-4" />
        <Bone className="h-4 w-28" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Bone className="h-8 w-48" />
          <Bone className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-10 w-28 rounded-md" />
          <Bone className="h-10 w-28 rounded-md" />
          <Bone className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-lg border border-gray-200 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Bone className="h-3 w-20" />
                <Bone className="h-6 w-32" />
              </div>
              <Bone className="h-10 w-10 rounded-lg" />
            </div>
            <Bone className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Tabs placeholder */}
      <div className="space-y-6">
        <Bone className="h-10 w-full max-w-[700px] rounded-lg" />

        {/* Content area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <Bone className="h-5 w-40" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Bone className="h-4 w-24" />
                <Bone className="h-4 w-32" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <Bone className="h-5 w-40" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Bone key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compact skeleton for tab content areas that load independently. */
export function TabContentSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
        <Bone className="h-5 w-40" />
        <Bone className="h-5 w-56" />
      </div>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header row */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Bone key={i} className="h-4 w-20 flex-1" />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3 flex gap-4 border-b border-gray-100 last:border-0"
          >
            {Array.from({ length: 6 }).map((_, j) => (
              <Bone key={j} className="h-4 w-20 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
