'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Download, Gauge, Navigation, Satellite, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TripGpsTrailProps, GpsPoint } from '../_types';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ---------------------------------------------------------------------------
// Reverse-geocode via free Nominatim API (1 req/s policy, cached)
// ---------------------------------------------------------------------------
const geoCache = new Map<string, string>();

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geoCache.has(key)) return geoCache.get(key)!;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) throw new Error('Geocode failed');
    const data = await res.json();
    const addr = data.address;
    const name =
      addr?.suburb || addr?.village || addr?.town || addr?.city || addr?.county || data.display_name?.split(',')[0] || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    geoCache.set(key, name);
    return name;
  } catch {
    const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    geoCache.set(key, fallback);
    return fallback;
  }
}

const PAGE_SIZE = 50;

export function TripGpsTrail({ gpsPoints, speedLimit }: TripGpsTrailProps) {
  const [page, setPage] = useState(1);
  const [locations, setLocations] = useState<Record<string, string>>({});

  const totalPages = Math.ceil(gpsPoints.length / PAGE_SIZE);
  const paginatedPoints = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return gpsPoints.slice(start, start + PAGE_SIZE);
  }, [gpsPoints, page]);

  // Batch reverse-geocode the visible page (respecting Nominatim 1 req/s)
  useEffect(() => {
    let cancelled = false;
    async function geocodePage() {
      for (const p of paginatedPoints) {
        if (cancelled) break;
        const key = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
        if (locations[key]) continue;
        const name = await reverseGeocode(p.lat, p.lng);
        if (!cancelled) {
          setLocations(prev => ({ ...prev, [key]: name }));
        }
        // Respect Nominatim rate limit
        await new Promise(r => setTimeout(r, 1100));
      }
    }
    geocodePage();
    return () => { cancelled = true; };
  }, [paginatedPoints]);

  const getLocation = useCallback((lat: number, lng: number): string => {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    return locations[key] || 'Loading…';
  }, [locations]);

  // Speed stats for the mini chart
  const speedStats = useMemo(() => {
    if (gpsPoints.length === 0) return { max: 0, avg: 0, overLimitCount: 0 };
    const speeds = gpsPoints.map(p => p.speed);
    const max = Math.max(...speeds);
    const avg = Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length);
    const overLimitCount = speedLimit ? speeds.filter(s => s > speedLimit).length : 0;
    return { max, avg, overLimitCount };
  }, [gpsPoints, speedLimit]);

  // Export as CSV
  const handleExport = () => {
    const headers = 'Time,Latitude,Longitude,Speed (km/h),Heading,Odometer,Fuel (L)\n';
    const rows = gpsPoints.map(p =>
      `${p.timestamp},${p.lat},${p.lng},${p.speed},${p.heading},${p.odometer},${p.fuelLevel}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gps-trail.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 p-4 md:p-0">
      {/* Speed summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">GPS Points</p>
          <p className="text-lg font-bold text-gray-900">{gpsPoints.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Max Speed</p>
          <p className={`text-lg font-bold ${speedLimit && speedStats.max > speedLimit ? 'text-red-600' : 'text-gray-900'}`}>
            {speedStats.max} km/h
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Avg Speed</p>
          <p className="text-lg font-bold text-gray-900">{speedStats.avg} km/h</p>
        </div>
        {speedLimit && (
          <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
            <p className="text-xs text-gray-500">Over Limit</p>
            <p className={`text-lg font-bold ${speedStats.overLimitCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {speedStats.overLimitCount}
            </p>
          </div>
        )}
      </div>

      {/* GPS log table */}
      {gpsPoints.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Satellite className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No GPS data available</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">GPS Log</h4>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-2 px-3 font-medium">Time</th>
                  <th className="text-left py-2 px-3 font-medium">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</span>
                  </th>
                  <th className="text-left py-2 px-3 font-medium">Coordinates</th>
                  <th className="text-right py-2 px-3 font-medium">
                    <span className="inline-flex items-center gap-1"><Gauge className="h-3 w-3" /> Speed</span>
                  </th>
                  <th className="text-right py-2 px-3 font-medium">
                    <span className="inline-flex items-center gap-1"><Navigation className="h-3 w-3" /> Heading</span>
                  </th>
                  <th className="text-right py-2 px-3 font-medium">Odometer</th>
                  <th className="text-right py-2 px-3 font-medium">Fuel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedPoints.map((p, i) => {
                  const isOver = speedLimit ? p.speed > speedLimit : false;
                  return (
                    <tr key={i} className={`${isOver ? 'bg-red-50' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="py-1.5 px-3 text-gray-700 whitespace-nowrap">{formatTime(p.timestamp)}</td>
                      <td className="py-1.5 px-3 text-gray-600 max-w-[180px] truncate" title={`${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`}>
                        {getLocation(p.lat, p.lng)}
                      </td>
                      <td className="py-1.5 px-3 text-gray-400 font-mono whitespace-nowrap">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</td>
                      <td className={`py-1.5 px-3 text-right font-medium ${isOver ? 'text-red-600' : 'text-gray-700'}`}>
                        {p.speed} km/h
                      </td>
                      <td className="py-1.5 px-3 text-right text-gray-500">{p.heading}°</td>
                      <td className="py-1.5 px-3 text-right text-gray-500">{p.odometer.toLocaleString()}</td>
                      <td className="py-1.5 px-3 text-right text-gray-500">{p.fuelLevel} L</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages} ({gpsPoints.length} points)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="text-xs"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
