'use client';

import { useEffect, useMemo } from 'react';
import { Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import type { TripMapProps } from '../_types';

// ── Leaflet CSS ───────────────────────────────────────────────────────────
import 'leaflet/dist/leaflet.css';

// ── react-leaflet ─────────────────────────────────────────────────────────
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';

// ---------------------------------------------------------------------------
// Fix default Leaflet marker icon (broken in webpack/Next.js bundles)
// ---------------------------------------------------------------------------
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// ---------------------------------------------------------------------------
// Custom div-icon factory
// ---------------------------------------------------------------------------
function createDivIcon(emoji: string, bg: string, size = 32, pulse = false) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};display:flex;align-items:center;justify-content:center;
      font-size:${size * 0.45}px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);
      ${pulse ? 'animation:pulse 2s infinite;' : ''}
    ">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const originIcon = createDivIcon('🟢', '#22c55e', 34);
const destIcon = createDivIcon('🏁', '#ef4444', 34);
const stopIcon = createDivIcon('⏸', '#f97316', 26);
const incidentIcon = createDivIcon('⚠️', '#eab308', 26);
const deviationIcon = createDivIcon('↗️', '#ef4444', 24);
const fuelIcon = createDivIcon('⛽', '#8b5cf6', 24);
const highlightIcon = createDivIcon('📍', '#facc15', 30, true);

// Heading-aware arrow icon for the truck position
function createTruckIcon(heading: number) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:#2563eb;display:flex;align-items:center;justify-content:center;
      border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);
      animation:pulse 2s infinite;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="transform:rotate(${heading}deg)">
        <path d="M12 2 L20 20 L12 16 L4 20 Z" fill="white" />
      </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

// ---------------------------------------------------------------------------
// Sub-component: auto-fit bounds & fly-to highlighted point
// ---------------------------------------------------------------------------
function MapController({
  trip,
  highlightedPoint,
}: {
  trip: TripMapProps['trip'];
  highlightedPoint?: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  // Fit bounds on mount
  useEffect(() => {
    const points: L.LatLngExpression[] = [
      [trip.route.originLat, trip.route.originLng],
      [trip.route.destinationLat, trip.route.destinationLng],
    ];
    if (trip.currentPosition) {
      points.push([trip.currentPosition.lat, trip.currentPosition.lng]);
    }
    trip.stops.forEach((s) => points.push([s.lat, s.lng]));

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points as [number, number][]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, trip]);

  // Fly to highlighted point when "Locate" is clicked from data panel
  useEffect(() => {
    if (highlightedPoint) {
      map.flyTo([highlightedPoint.lat, highlightedPoint.lng], 14, { duration: 1 });
    }
  }, [map, highlightedPoint]);

  return null;
}

// ---------------------------------------------------------------------------
// Sub-component: custom zoom / center-on-truck controls
// ---------------------------------------------------------------------------
function ZoomControls({
  isLive,
  truckLat,
  truckLng,
}: {
  isLive: boolean;
  truckLat?: number;
  truckLng?: number;
}) {
  const map = useMap();

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
      {isLive && truckLat != null && truckLng != null && (
        <button
          onClick={() => map.flyTo([truckLat, truckLng], 14, { duration: 0.8 })}
          className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-2 hover:bg-blue-50 transition shadow-md"
          title="Center on truck"
        >
          <Navigation className="h-4 w-4 text-blue-600" />
        </button>
      )}
      <button
        onClick={() => map.zoomIn()}
        className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition shadow-md"
        title="Zoom in"
      >
        <ZoomIn className="h-4 w-4 text-gray-600" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition shadow-md"
        title="Zoom out"
      >
        <ZoomOut className="h-4 w-4 text-gray-600" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main TripMap component
// ---------------------------------------------------------------------------
export function TripMap({ trip, highlightedPoint }: TripMapProps) {
  const isLive = trip.status === 'IN_PROGRESS' || trip.status === 'DELAYED';
  const isCompleted = trip.status === 'COMPLETED';

  // GPS trail polyline
  const trailPositions: [number, number][] = useMemo(() => {
    if (!trip.trail || trip.trail.length === 0) return [];
    return trip.trail.map((p) => [p.lat, p.lng] as [number, number]);
  }, [trip.trail]);

  // Planned route line (origin → stops → destination)
  const routeLine: [number, number][] = useMemo(() => {
    const pts: [number, number][] = [[trip.route.originLat, trip.route.originLng]];
    trip.stops.forEach((s) => pts.push([s.lat, s.lng]));
    pts.push([trip.route.destinationLat, trip.route.destinationLng]);
    return pts;
  }, [trip]);

  // Centre fallback
  const center: [number, number] = useMemo(() => {
    return [
      (trip.route.originLat + trip.route.destinationLat) / 2,
      (trip.route.originLng + trip.route.destinationLng) / 2,
    ];
  }, [trip.route]);

  return (
    <div className="relative h-full overflow-hidden">
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full z-0"
        style={{ background: '#e8e0d8' }}
      >
        {/* OSM tile layer – free, no API key */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Fit bounds + highlight fly-to */}
        <MapController trip={trip} highlightedPoint={highlightedPoint} />

        {/* Custom zoom / center buttons */}
        <ZoomControls
          isLive={isLive}
          truckLat={trip.currentPosition?.lat}
          truckLng={trip.currentPosition?.lng}
        />

        {/* ── Planned route (dashed) ───────────────────────────── */}
        <Polyline
          positions={routeLine}
          pathOptions={{ color: '#93c5fd', weight: 3, dashArray: '8, 8', opacity: 0.7 }}
        />

        {/* ── Actual GPS trail (solid) ─────────────────────────── */}
        {trailPositions.length > 1 && (
          <Polyline
            positions={trailPositions}
            pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.9 }}
          />
        )}

        {/* ── Origin ───────────────────────────────────────────── */}
        <Marker position={[trip.route.originLat, trip.route.originLng]} icon={originIcon}>
          <Popup>
            <strong>{trip.route.originName}</strong>
            <br />
            <span className="text-xs text-gray-500">Origin</span>
          </Popup>
        </Marker>

        {/* ── Destination ──────────────────────────────────────── */}
        <Marker position={[trip.route.destinationLat, trip.route.destinationLng]} icon={destIcon}>
          <Popup>
            <strong>{trip.route.destinationName}</strong>
            <br />
            <span className="text-xs text-gray-500">Destination</span>
          </Popup>
        </Marker>

        {/* ── Truck (live / completed) ─────────────────────────── */}
        {(isLive || isCompleted) && trip.currentPosition && (
          <Marker position={[trip.currentPosition.lat, trip.currentPosition.lng]} icon={createTruckIcon(trip.currentPosition.heading)}>
            <Popup>
              <strong>{trip.truckPlate}</strong>
              <br />
              <span className="text-xs text-gray-500">
                {trip.currentPosition.speed} km/h • {trip.driverName}
              </span>
            </Popup>
          </Marker>
        )}

        {/* ── Stops ────────────────────────────────────────────── */}
        {trip.stops.map((stop) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopIcon}>
            <Popup>
              <strong>{stop.locationName}</strong>
              <br />
              <span className="text-xs text-gray-500">{stop.reason}</span>
              {stop.durationMin && (
                <>
                  <br />
                  <span className="text-xs text-orange-600 font-medium">{stop.durationMin} min stop</span>
                </>
              )}
            </Popup>
          </Marker>
        ))}

        {/* ── Incidents ────────────────────────────────────────── */}
        {trip.incidents
          .filter((inc) => inc.lat != null && inc.lng != null)
          .map((inc) => (
            <Marker key={inc.id} position={[inc.lat!, inc.lng!]} icon={incidentIcon}>
              <Popup>
                <strong>{inc.description}</strong>
                <br />
                <span className={`text-xs font-medium ${
                  inc.severity === 'CRITICAL' ? 'text-red-600' :
                  inc.severity === 'HIGH' ? 'text-orange-600' :
                  inc.severity === 'MEDIUM' ? 'text-yellow-600' : 'text-gray-500'
                }`}>{inc.severity}</span>
                {inc.resolvedAt && <span className="text-xs text-green-600 ml-2">✓ Resolved</span>}
              </Popup>
            </Marker>
          ))}

        {/* ── Deviations ───────────────────────────────────────── */}
        {trip.deviations.map((dev) => (
          <Marker key={dev.id} position={[dev.lat, dev.lng]} icon={deviationIcon}>
            <Popup>
              <strong>{dev.distanceOffRouteKm} km off route</strong>
              <br />
              <span className="text-xs text-gray-500">
                {dev.acknowledged ? '✓ Acknowledged' : '⚠ Unacknowledged'}
              </span>
            </Popup>
          </Marker>
        ))}

        {/* ── Fuel stops ───────────────────────────────────────── */}
        {trip.fuelLogs
          .filter((fl) => fl.stationLat != null && fl.stationLng != null)
          .map((fl) => (
            <Marker key={fl.id} position={[fl.stationLat!, fl.stationLng!]} icon={fuelIcon}>
              <Popup>
                <strong>{fl.station}</strong>
                <br />
                <span className="text-xs text-gray-500">{fl.liters}L • {fl.receiptNumber}</span>
              </Popup>
            </Marker>
          ))}

        {/* ── Highlighted point ────────────────────────────────── */}
        {highlightedPoint && (
          <Marker position={[highlightedPoint.lat, highlightedPoint.lng]} icon={highlightIcon} />
        )}
      </MapContainer>


    </div>
  );
}
