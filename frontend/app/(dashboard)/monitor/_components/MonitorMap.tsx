'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { TruckLocation } from '@/types/tracking';
import { TRIP_COLORS } from '@/constants/tracking';

// Color palette for each trip (indexed by trip order)
const getColorForTripIndex = (index: number) => {
  const colors = TRIP_COLORS;
  return colors[index % colors.length];
};

// Create custom arrow icon with rotation and custom color
function createTruckIconHtml(heading: number, isSelected: boolean, color: { trail: string; marker: string }): string {
  const bgColor = color.marker;
  const size = isSelected ? 44 : 36;
  const pulseRing = isSelected ? `
    <div style="
      position: absolute;
      inset: -6px;
      border: 2px solid ${bgColor};
      border-radius: 50%;
      opacity: 0.5;
      animation: pulse 2s ease-in-out infinite;
    "></div>` : '';

  return `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
    ">
      ${pulseRing}
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%);
        border: 3px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px ${bgColor}66, 0 2px 4px rgba(0,0,0,0.15);
        transform: rotate(${heading}deg);
      ">
        <svg width="${isSelected ? 20 : 16}" height="${isSelected ? 20 : 16}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L12 16"/>
          <path d="M5 9L12 2L19 9"/>
        </svg>
      </div>
    </div>
  `;
}

interface MonitorMapProps {
  trucks: TruckLocation[];
  selectedTruckId: string | null;
  onTruckSelect: (truckId: string) => void;
}

export function MonitorMap({ trucks, selectedTruckId, onTruckSelect }: MonitorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const gpsTrailRef = useRef<Map<string, L.Polyline>>(new Map());
  const startMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const initialBoundsSetRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  const onTruckSelectRef = useRef(onTruckSelect);
  onTruckSelectRef.current = onTruckSelect;

  const trucksRef = useRef(trucks);
  trucksRef.current = trucks;

  const isInitializingRef = useRef(false);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || isInitializingRef.current) return;

    isInitializingRef.current = true;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        leafletRef.current = L;

        // Load CSS with z-index fix
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);

          // Add z-index fix for dialogs
          const style = document.createElement('style');
          style.textContent = `
            .leaflet-pane { z-index: 1 !important; }
            .leaflet-top, .leaflet-bottom { z-index: 2 !important; }
            .leaflet-control { z-index: 2 !important; }
          `;
          document.head.appendChild(style);
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        if (!mapContainerRef.current || mapRef.current) {
          isInitializingRef.current = false;
          return;
        }

        const currentTrucks = trucksRef.current;
        const center: [number, number] = currentTrucks.length > 0
          ? [
              currentTrucks.reduce((sum, t) => sum + t.latitude, 0) / currentTrucks.length,
              currentTrucks.reduce((sum, t) => sum + t.longitude, 0) / currentTrucks.length,
            ]
          : [1.3733, 32.2903];

        const map = L.map(mapContainerRef.current, {
          center,
          zoom: 7,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
        }).addTo(map);

        mapRef.current = map;
        setMapReady(true);
      } catch (error) {
        console.error('Failed to initialize map:', error);
        isInitializingRef.current = false;
      }
    };

    initMap();

    return () => {
      isInitializingRef.current = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
        gpsTrailRef.current.clear();
        startMarkersRef.current.clear();
      }
    };
  }, []);

  // Update markers and polylines
  useEffect(() => {
    if (!mapReady || !mapRef.current || !leafletRef.current) return;

    const L = leafletRef.current;
    const map = mapRef.current;
    const allCoordinates: [number, number][] = [];

    trucks.forEach((truck, index) => {
      const isSelected = selectedTruckId === truck.tripId;
      const tripColor = getColorForTripIndex(index);
      const trailColor = tripColor.trail;

      // Build remaining route: current position -> waypoints -> destination
      const remainingRoute: [number, number][] = [
        [truck.latitude, truck.longitude], // Current position
        ...truck.routeWaypoints.map(wp => [wp.lat, wp.lng] as [number, number]),
        [truck.endLocation.lat, truck.endLocation.lng], // Destination
      ];
      allCoordinates.push(...remainingRoute);

      // Update remaining route trail
      const existingTrail = gpsTrailRef.current.get(truck.tripId);
      if (existingTrail) {
        existingTrail.setLatLngs(remainingRoute);
        existingTrail.setStyle({
          color: trailColor,
          weight: isSelected ? 4 : 3,
          opacity: isSelected ? 0.9 : 0.6,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: isSelected ? undefined : '8, 8', // Dashed line for remaining route
        });
      } else {
        const trail = L.polyline(remainingRoute, {
          color: trailColor,
          weight: 3,
          opacity: 0.6,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: '8, 8', // Dashed line to indicate future/remaining route
        }).addTo(map);
        gpsTrailRef.current.set(truck.tripId, trail);
      }

      // Update destination marker with trip color
      const existingDestMarker = startMarkersRef.current.get(truck.tripId);
      const destIcon = L.divIcon({
        html: `<div style="
          width: 16px;
          height: 16px;
          background: ${tripColor.marker};
          border: 3px solid #ffffff;
          border-radius: 2px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          transform: rotate(45deg);
        "></div>`,
        className: 'dest-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      
      if (existingDestMarker) {
        existingDestMarker.setLatLng([truck.endLocation.lat, truck.endLocation.lng]);
        existingDestMarker.setIcon(destIcon);
      } else {
        const destMarker = L.marker([truck.endLocation.lat, truck.endLocation.lng], { icon: destIcon }).addTo(map);
        startMarkersRef.current.set(truck.tripId, destMarker);
      }

      // Update truck marker with trip color
      const existingMarker = markersRef.current.get(truck.tripId);
      const truckIcon = L.divIcon({
        html: createTruckIconHtml(truck.heading, isSelected, tripColor),
        className: 'truck-marker',
        iconSize: [isSelected ? 46 : 38, isSelected ? 46 : 38],
        iconAnchor: [isSelected ? 23 : 19, isSelected ? 23 : 19],
      });

      if (existingMarker) {
        existingMarker.setLatLng([truck.latitude, truck.longitude]);
        existingMarker.setIcon(truckIcon);
      } else {
        const marker = L.marker([truck.latitude, truck.longitude], { icon: truckIcon }).addTo(map);
        marker.on('click', () => onTruckSelectRef.current(truck.tripId));
        markersRef.current.set(truck.tripId, marker);
      }
    });

    // Remove old markers
    const currentTruckIds = new Set(trucks.map(t => t.tripId));
    markersRef.current.forEach((marker, tripId) => {
      if (!currentTruckIds.has(tripId)) {
        marker.remove();
        markersRef.current.delete(tripId);
      }
    });
    gpsTrailRef.current.forEach((trail, tripId) => {
      if (!currentTruckIds.has(tripId)) {
        trail.remove();
        gpsTrailRef.current.delete(tripId);
      }
    });
    startMarkersRef.current.forEach((marker, tripId) => {
      if (!currentTruckIds.has(tripId)) {
        marker.remove();
        startMarkersRef.current.delete(tripId);
      }
    });

    // Fit bounds on initial load
    if (!initialBoundsSetRef.current && allCoordinates.length > 0) {
      const bounds = L.latLngBounds(allCoordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      initialBoundsSetRef.current = true;
    }
  }, [trucks, selectedTruckId, mapReady]);

  const selectedTruckIdRef = useRef<string | null>(null);

  // Center on selected truck only when selection changes
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedTruckId) return;
    
    // Only pan if selection actually changed
    if (selectedTruckIdRef.current === selectedTruckId) return;
    selectedTruckIdRef.current = selectedTruckId;
    
    const truck = trucks.find(t => t.tripId === selectedTruckId);
    if (truck) {
      mapRef.current.setView([truck.latitude, truck.longitude], 11, { animate: true });
    }
  }, [selectedTruckId, mapReady, trucks]);

  return (
    <div ref={mapContainerRef} className="h-full w-full rounded-xl overflow-hidden" style={{ zIndex: 0 }}>
      {!mapReady && (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-500">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
}
