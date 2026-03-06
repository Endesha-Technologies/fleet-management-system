'use client';

// ---------------------------------------------------------------------------
// RouteFormFields — Shared form fields for create/edit route
// ---------------------------------------------------------------------------

import React, { useRef, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Loader, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormInput, FormNumberInput, FormField } from '@/components/ui/form';
import { Select } from '@/components/ui/select';
import type { RouteType } from '@/api/routes';
import type { LocationSuggestion } from '../_types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RouteFormData {
  code: string;
  name: string;
  originName: string;
  originLat: number | null;
  originLng: number | null;
  destinationName: string;
  destinationLat: number | null;
  destinationLng: number | null;
  type: RouteType;
  deviationThresholdKm: string;
  speedLimitKmh: string;
  notes: string;
}

export const INITIAL_FORM_DATA: RouteFormData = {
  code: '',
  name: '',
  originName: '',
  originLat: null,
  originLng: null,
  destinationName: '',
  destinationLat: null,
  destinationLng: null,
  type: 'REGIONAL',
  deviationThresholdKm: '0.5',
  speedLimitKmh: '',
  notes: '',
};

export const ROUTE_TYPE_OPTIONS = [
  { value: 'REGIONAL', label: 'Regional' },
  { value: 'SHORT_HAUL', label: 'Short Haul' },
  { value: 'LONG_HAUL', label: 'Long Haul' },

  { value: 'INTERNATIONAL', label: 'International' },
];

interface RouteFormFieldsProps {
  formData: RouteFormData;
  setFormData: React.Dispatch<React.SetStateAction<RouteFormData>>;
  formErrors: Record<string, string>;
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isEditing?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RouteFormFields({
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  isEditing = false,
}: RouteFormFieldsProps) {
  // Origin search state
  const [originQuery, setOriginQuery] = React.useState(formData.originName);
  const [originSuggestions, setOriginSuggestions] = React.useState<LocationSuggestion[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = React.useState(false);
  const [showOriginSuggestions, setShowOriginSuggestions] = React.useState(false);
  const [isGettingOriginLocation, setIsGettingOriginLocation] = React.useState(false);

  // Destination search state
  const [destinationQuery, setDestinationQuery] = React.useState(formData.destinationName);
  const [destinationSuggestions, setDestinationSuggestions] = React.useState<LocationSuggestion[]>([]);
  const [isSearchingDestination, setIsSearchingDestination] = React.useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = React.useState(false);
  const [isGettingDestinationLocation, setIsGettingDestinationLocation] = React.useState(false);

  // Refs
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const originDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const destinationDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync queries when formData changes (for edit mode)
  useEffect(() => {
    setOriginQuery(formData.originName);
    setDestinationQuery(formData.destinationName);
  }, [formData.originName, formData.destinationName]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-generate code from name (only for create)
  useEffect(() => {
    if (!isEditing && formData.name && !formData.code) {
      const generatedCode = formData.name
        .substring(0, 10)
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9-]/g, '');
      setFormData((prev) => ({ ...prev, code: generatedCode }));
    }
  }, [formData.name, formData.code, isEditing, setFormData]);

  // Search locations using OpenStreetMap Nominatim API
  const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.length < 3) return [];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );

      if (!response.ok) throw new Error('Search failed');
      return await response.json();
    } catch (error) {
      console.error('Location search error:', error);
      return [];
    }
  };

  // Handle origin search with debounce
  const handleOriginSearch = useCallback((value: string) => {
    setOriginQuery(value);
    setFormData((prev) => ({ ...prev, originName: value, originLat: null, originLng: null }));

    if (originDebounceRef.current) clearTimeout(originDebounceRef.current);

    if (value.length >= 3) {
      setIsSearchingOrigin(true);
      originDebounceRef.current = setTimeout(async () => {
        const results = await searchLocations(value);
        setOriginSuggestions(results);
        setShowOriginSuggestions(true);
        setIsSearchingOrigin(false);
      }, 300);
    } else {
      setOriginSuggestions([]);
      setShowOriginSuggestions(false);
    }
  }, [setFormData]);

  // Handle destination search with debounce
  const handleDestinationSearch = useCallback((value: string) => {
    setDestinationQuery(value);
    setFormData((prev) => ({ ...prev, destinationName: value, destinationLat: null, destinationLng: null }));

    if (destinationDebounceRef.current) clearTimeout(destinationDebounceRef.current);

    if (value.length >= 3) {
      setIsSearchingDestination(true);
      destinationDebounceRef.current = setTimeout(async () => {
        const results = await searchLocations(value);
        setDestinationSuggestions(results);
        setShowDestinationSuggestions(true);
        setIsSearchingDestination(false);
      }, 300);
    } else {
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
    }
  }, [setFormData]);

  // Select origin from suggestions
  const selectOrigin = (suggestion: LocationSuggestion) => {
    const shortName = suggestion.display_name.split(',').slice(0, 3).join(',');
    setOriginQuery(shortName);
    setFormData((prev) => ({
      ...prev,
      originName: shortName,
      originLat: parseFloat(suggestion.lat),
      originLng: parseFloat(suggestion.lon),
    }));
    setShowOriginSuggestions(false);
    setFormErrors((prev) => ({ ...prev, origin: '' }));
  };

  // Select destination from suggestions
  const selectDestination = (suggestion: LocationSuggestion) => {
    const shortName = suggestion.display_name.split(',').slice(0, 3).join(',');
    setDestinationQuery(shortName);
    setFormData((prev) => ({
      ...prev,
      destinationName: shortName,
      destinationLat: parseFloat(suggestion.lat),
      destinationLng: parseFloat(suggestion.lon),
    }));
    setShowDestinationSuggestions(false);
    setFormErrors((prev) => ({ ...prev, destination: '' }));
  };

  // Fetch current location
  const fetchCurrentLocation = (type: 'origin' | 'destination') => {
    if (!navigator.geolocation) {
      setFormErrors((prev) => ({ ...prev, [type]: 'Geolocation is not supported' }));
      return;
    }

    if (type === 'origin') {
      setIsGettingOriginLocation(true);
      setShowOriginSuggestions(false);
    } else {
      setIsGettingDestinationLocation(true);
      setShowDestinationSuggestions(false);
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );

          if (response.ok) {
            const data = await response.json();
            const shortName = data.display_name.split(',').slice(0, 3).join(',');

            if (type === 'origin') {
              setOriginQuery(shortName);
              setFormData((prev) => ({
                ...prev,
                originName: shortName,
                originLat: latitude,
                originLng: longitude,
              }));
              setFormErrors((prev) => ({ ...prev, origin: '' }));
            } else {
              setDestinationQuery(shortName);
              setFormData((prev) => ({
                ...prev,
                destinationName: shortName,
                destinationLat: latitude,
                destinationLng: longitude,
              }));
              setFormErrors((prev) => ({ ...prev, destination: '' }));
            }
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          const locationStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          if (type === 'origin') {
            setOriginQuery(locationStr);
            setFormData((prev) => ({
              ...prev,
              originName: locationStr,
              originLat: latitude,
              originLng: longitude,
            }));
          } else {
            setDestinationQuery(locationStr);
            setFormData((prev) => ({
              ...prev,
              destinationName: locationStr,
              destinationLat: latitude,
              destinationLng: longitude,
            }));
          }
        }

        if (type === 'origin') setIsGettingOriginLocation(false);
        else setIsGettingDestinationLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setFormErrors((prev) => ({ ...prev, [type]: 'Unable to get your location' }));
        if (type === 'origin') setIsGettingOriginLocation(false);
        else setIsGettingDestinationLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6">
      {/* Route Code */}
      <FormInput
        id="routeCode"
        label="Route Code"
        required
        value={formData.code}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }));
          if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: '' }));
        }}
        placeholder="e.g., KLA-JNJ-01"
        error={formErrors.code}
        description="Unique identifier for the route"
      />

      {/* Route Name */}
      <FormInput
        id="routeName"
        label="Route Name"
        required
        value={formData.name}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, name: e.target.value }));
          if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }));
        }}
        placeholder="e.g., Kampala to Jinja"
        error={formErrors.name}
      />

      {/* Route Type */}
      <FormField label="Route Type" htmlFor="routeType">
        <Select
          id="routeType"
          value={formData.type}
          onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as RouteType }))}
          options={ROUTE_TYPE_OPTIONS}
          className="bg-white"
        />
      </FormField>

      {/* Origin */}
      <div ref={originRef} className="relative">
        <FormField label="Origin" required error={formErrors.origin} htmlFor="origin">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
            <Input
              id="origin"
              value={originQuery}
              onChange={(e) => handleOriginSearch(e.target.value)}
              onFocus={() => originSuggestions.length > 0 && setShowOriginSuggestions(true)}
              placeholder="Search for origin location..."
              className={`pl-10 ${formErrors.origin ? 'border-red-300' : ''}`}
            />
            {(isSearchingOrigin || isGettingOriginLocation) && (
              <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>
        </FormField>

        {/* Origin Suggestions Dropdown */}
        {showOriginSuggestions && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => fetchCurrentLocation('origin')}
              disabled={isGettingOriginLocation}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-200 flex items-center gap-3 text-blue-600"
            >
              {isGettingOriginLocation ? (
                <Loader className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <Navigation className="w-4 h-4 shrink-0" />
              )}
              <span className="text-sm font-medium">
                {isGettingOriginLocation ? 'Getting location...' : 'Use Current Location'}
              </span>
            </button>

            {originSuggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => selectOrigin(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start gap-3"
              >
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700 line-clamp-2">{suggestion.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Show selected coordinates */}
        {formData.originLat !== null && (
          <p className="text-xs text-gray-500 mt-1">
            Coordinates: {formData.originLat.toFixed(6)}, {formData.originLng?.toFixed(6)}
          </p>
        )}
      </div>

      {/* Destination */}
      <div ref={destinationRef} className="relative">
        <FormField label="Destination" required error={formErrors.destination} htmlFor="destination">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
            <Input
              id="destination"
              value={destinationQuery}
              onChange={(e) => handleDestinationSearch(e.target.value)}
              onFocus={() => destinationSuggestions.length > 0 && setShowDestinationSuggestions(true)}
              placeholder="Search for destination location..."
              className={`pl-10 ${formErrors.destination ? 'border-red-300' : ''}`}
            />
            {(isSearchingDestination || isGettingDestinationLocation) && (
              <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>
        </FormField>

        {/* Destination Suggestions Dropdown */}
        {showDestinationSuggestions && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => fetchCurrentLocation('destination')}
              disabled={isGettingDestinationLocation}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-200 flex items-center gap-3 text-blue-600"
            >
              {isGettingDestinationLocation ? (
                <Loader className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <Navigation className="w-4 h-4 shrink-0" />
              )}
              <span className="text-sm font-medium">
                {isGettingDestinationLocation ? 'Getting location...' : 'Use Current Location'}
              </span>
            </button>

            {destinationSuggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => selectDestination(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start gap-3"
              >
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700 line-clamp-2">{suggestion.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Show selected coordinates */}
        {formData.destinationLat !== null && (
          <p className="text-xs text-gray-500 mt-1">
            Coordinates: {formData.destinationLat.toFixed(6)}, {formData.destinationLng?.toFixed(6)}
          </p>
        )}
      </div>

      {/* Info about backend calculation */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          Distance and duration will be calculated automatically by the system.
        </p>
      </div>

      {/* Deviation Threshold */}
      <FormNumberInput
        id="deviationThresholdKm"
        label="Deviation Threshold (km)"
        required
        value={formData.deviationThresholdKm}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, deviationThresholdKm: e.target.value }));
          if (formErrors.deviationThresholdKm) setFormErrors((prev) => ({ ...prev, deviationThresholdKm: '' }));
        }}
        placeholder="e.g., 0.5"
        min={0}
        step={0.1}
        error={formErrors.deviationThresholdKm}
        description="Alert if vehicle deviates more than this distance from the planned route."
      />

      {/* Speed Limit (optional) */}
      <FormNumberInput
        id="speedLimitKmh"
        label="Speed Limit (km/h)"
        value={formData.speedLimitKmh}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, speedLimitKmh: e.target.value }));
          if (formErrors.speedLimitKmh) setFormErrors((prev) => ({ ...prev, speedLimitKmh: '' }));
        }}
        placeholder="e.g., 80"
        min={0}
        error={formErrors.speedLimitKmh}
        description="Optional maximum speed for this route."
      />

      {/* Notes (optional) */}
      <FormField label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional notes about this route..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </FormField>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------

export function validateRouteForm(formData: RouteFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!formData.code.trim()) {
    errors.code = 'Route code is required';
  }

  if (!formData.name.trim()) {
    errors.name = 'Route name is required';
  }

  if (!formData.originName.trim() || formData.originLat === null) {
    errors.origin = 'Please select a valid origin location';
  }

  if (!formData.destinationName.trim() || formData.destinationLat === null) {
    errors.destination = 'Please select a valid destination location';
  }

  const deviation = parseFloat(formData.deviationThresholdKm);
  if (isNaN(deviation) || deviation < 0) {
    errors.deviationThresholdKm = 'Please enter a valid deviation threshold';
  }

  if (formData.speedLimitKmh) {
    const speed = parseFloat(formData.speedLimitKmh);
    if (isNaN(speed) || speed <= 0) {
      errors.speedLimitKmh = 'Please enter a valid speed limit';
    }
  }

  return errors;
}
