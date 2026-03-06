'use client';

import { useEffect, useRef, useState } from 'react';

interface RouteLocation {
  name: string;
  lat: number;
  lon: number;
}

interface RouteMapProps {
  origin: RouteLocation;
  destination: RouteLocation;
  className?: string;
}

export function RouteMap({ origin, destination, className = '' }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet script once
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(linkEl);

    // Add custom CSS to lower Leaflet z-index so dialogs appear above
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .leaflet-pane { z-index: 1 !important; }
      .leaflet-top, .leaflet-bottom { z-index: 2 !important; }
      .leaflet-control { z-index: 2 !important; }
    `;
    document.head.appendChild(styleEl);

    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptEl.onload = () => setLeafletLoaded(true);
    document.head.appendChild(scriptEl);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchAndDrawRoute = async (map: any, L: any) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes[0]) {
          const coordinates = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );

          L.polyline(coordinates, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8,
          }).addTo(map);
        }
      }
    } catch (error) {
      console.error('Failed to fetch route:', error);
      // Fall back to straight line
      L.polyline(
        [
          [origin.lat, origin.lon],
          [destination.lat, destination.lon],
        ],
        {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.6,
          dashArray: '10, 10',
        }
      ).addTo(map);
    }
  };

  const createMap = () => {
    if (!mapRef.current || typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;

    // Remove existing map if any
    if (mapInstanceRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mapInstanceRef.current as any).remove();
    }

    // Clear container
    mapRef.current.innerHTML = '';

    // Calculate center point between origin and destination
    const centerLat = (origin.lat + destination.lat) / 2;
    const centerLon = (origin.lon + destination.lon) / 2;

    // Create map
    const map = L.map(mapRef.current).setView([centerLat, centerLon], 7);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Custom icons
    const originIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const destinationIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add markers
    L.marker([origin.lat, origin.lon], { icon: originIcon })
      .addTo(map)
      .bindPopup(`<strong>Origin</strong><br/>${origin.name}`);

    L.marker([destination.lat, destination.lon], { icon: destinationIcon })
      .addTo(map)
      .bindPopup(`<strong>Destination</strong><br/>${destination.name}`);

    // Fit bounds to show both markers
    const bounds = L.latLngBounds(
      [origin.lat, origin.lon],
      [destination.lat, destination.lon]
    );
    map.fitBounds(bounds, { padding: [50, 50] });

    // Fetch and draw route from OSRM
    fetchAndDrawRoute(map, L);
  };

  // Initialize map when leaflet is loaded
  useEffect(() => {
    if (!leafletLoaded) return;

    // Delay to ensure container is rendered
    const timer = setTimeout(() => {
      createMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, origin.lat, origin.lon, destination.lat, destination.lon]);

  return (
    <div
      ref={mapRef}
      className={`w-full rounded-xl border border-gray-200 bg-gray-100 relative ${className}`}
      style={{ minHeight: '300px', zIndex: 0 }}
    />
  );
}
