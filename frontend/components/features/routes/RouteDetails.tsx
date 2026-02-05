'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Route } from '@/types/route';
import { MapPin, Calendar, Clock, Navigation, AlertTriangle, ArrowLeft } from 'lucide-react';

interface RouteDetailsProps {
  route: Route;
}

export function RouteDetails({ route }: RouteDetailsProps) {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize OpenStreetMap with Leaflet
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    // Dynamically load Leaflet CSS
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(linkEl);

    // Dynamically load Leaflet JS
    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptEl.onload = () => {
      initializeMap();
    };
    document.head.appendChild(scriptEl);

    return () => {
      linkEl.remove();
      scriptEl.remove();
    };
  }, [route, mapLoaded]);

  const initializeMap = () => {
    if (!mapRef.current || typeof window === 'undefined') return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;

    // Calculate center point between origin and destination
    const centerLat = (route.origin.lat + route.destination.lat) / 2;
    const centerLon = (route.origin.lon + route.destination.lon) / 2;

    // Create map
    const map = L.map(mapRef.current).setView([centerLat, centerLon], 7);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Custom icons
    const originIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const destinationIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add markers
    L.marker([route.origin.lat, route.origin.lon], { icon: originIcon })
      .addTo(map)
      .bindPopup(`<strong>Origin</strong><br/>${route.origin.name}`);

    L.marker([route.destination.lat, route.destination.lon], { icon: destinationIcon })
      .addTo(map)
      .bindPopup(`<strong>Destination</strong><br/>${route.destination.name}`);

    // Fit bounds to show both markers
    const bounds = L.latLngBounds(
      [route.origin.lat, route.origin.lon],
      [route.destination.lat, route.destination.lon]
    );
    map.fitBounds(bounds, { padding: [50, 50] });

    // Fetch and draw route from OSRM
    fetchAndDrawRoute(map, L);

    setMapLoaded(true);
  };

  const fetchAndDrawRoute = async (map: unknown, L: unknown) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${route.origin.lon},${route.origin.lat};${route.destination.lon},${route.destination.lat}?overview=full&geometries=geojson`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes[0]) {
          const coordinates = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (L as any).polyline(coordinates, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8,
          }).addTo(map);
        }
      }
    } catch (error) {
      console.error('Failed to fetch route:', error);
      // Fall back to straight line
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (L as any).polyline([
        [route.origin.lat, route.origin.lon],
        [route.destination.lat, route.destination.lon]
      ], {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10',
      }).addTo(map);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{route.name}</h2>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
              ${route.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                route.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                route.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-gray-100 text-gray-800'}`}>
              {route.status}
            </span>
          </div>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          asChild
        >
          <Link href={`/routes/${route.id}/edit`} scroll={false}>
            Edit Route
          </Link>
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Map */}
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg border border-gray-200 bg-gray-100"
          style={{ minHeight: '256px' }}
        />

        {/* Route Info */}
        <div className="grid gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="h-3 w-3 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500">Origin</p>
              <p className="text-sm text-gray-900 truncate">{route.origin.name}</p>
              <p className="text-xs text-gray-400">{route.origin.lat.toFixed(4)}, {route.origin.lon.toFixed(4)}</p>
            </div>
          </div>

          <div className="ml-3 border-l-2 border-dashed border-gray-300 h-4" />

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="h-3 w-3 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500">Destination</p>
              <p className="text-sm text-gray-900 truncate">{route.destination.name}</p>
              <p className="text-xs text-gray-400">{route.destination.lat.toFixed(4)}, {route.destination.lon.toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="h-4 w-4 text-blue-500" />
              <p className="text-xs font-medium text-gray-500">Distance</p>
            </div>
            <p className="text-lg font-semibold">{route.distance}</p>
          </div>
          
          <div className="p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <p className="text-xs font-medium text-gray-500">Duration</p>
            </div>
            <p className="text-lg font-semibold">{route.estimatedDuration}</p>
          </div>

          <div className="p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <p className="text-xs font-medium text-gray-500">Deviation</p>
            </div>
            <p className="text-lg font-semibold">{route.deviationThreshold}m</p>
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Created on {new Date(route.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>
    </div>
  );
}
