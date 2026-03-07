'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSelect, FormDateInput } from '@/components/ui/form';
import {
  Route as RouteIcon,
  MapPin,
  Navigation,
  User,
  Users,
  Truck,
  Calendar,
  FileText,
  ChevronDown,
  Check,
  Loader2,
  Search,
  X,
  AlertCircle,
} from 'lucide-react';

// API Services
import { routesService } from '@/api/routes';
import { trucksService } from '@/api/trucks';
import { usersService } from '@/api/users';
import type { RouteWithCount } from '@/api/routes';
import type { Truck as ApiTruck } from '@/api/trucks';
import type { User as ApiUser } from '@/api/users';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RouteMode = 'existing' | 'adhoc';

interface LocationSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export interface SuggestedRoute {
  distance: number; // in km
  duration: number; // in minutes
  polyline?: string;
}

export interface NewTripFormData {
  // Route
  routeMode: RouteMode;
  selectedRouteId: string;
  originName: string;
  originLat: number | null;
  originLng: number | null;
  destinationName: string;
  destinationLat: number | null;
  destinationLng: number | null;
  selectedSuggestedRoute: number;
  // Assignment
  vehicleId: string;
  driverId: string;
  turnBoyId: string;
  // Schedule
  scheduledStartTime: string;
  scheduledEndTime: string;
  // Notes
  notes: string;
}

const INITIAL_FORM_DATA: NewTripFormData = {
  routeMode: 'existing',
  selectedRouteId: '',
  originName: '',
  originLat: null,
  originLng: null,
  destinationName: '',
  destinationLat: null,
  destinationLng: null,
  selectedSuggestedRoute: 0,
  vehicleId: '',
  driverId: '',
  turnBoyId: '',
  scheduledStartTime: '',
  scheduledEndTime: '',
  notes: '',
};

export interface NewTripFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (data: NewTripFormData, suggestedRoute?: SuggestedRoute) => void;
  /** If true, renders without header (for inline panel use) */
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Searchable Select Component
// ---------------------------------------------------------------------------

interface SearchableSelectProps<T extends NonNullable<unknown>> {
  label: string;
  icon?: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  items: T[];
  selectedItem: T | null;
  onSelect: (item: T | null) => void;
  getItemLabel: (item: T) => string;
  getItemSubLabel?: (item: T) => string;
  getItemId: (item: T) => string;
  allowClear?: boolean;
}

function SearchableSelect<T extends NonNullable<unknown>>({
  label,
  icon,
  placeholder = 'Select...',
  required = false,
  items,
  selectedItem,
  onSelect,
  getItemLabel,
  getItemSubLabel,
  getItemId,
  allowClear = false,
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter((item) =>
    getItemLabel(item).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (getItemSubLabel && getItemSubLabel(item).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-2">
        {icon}
        {label} {required && <span className="text-red-500">*</span>}
        {!required && <span className="text-gray-400 text-xs">(Optional)</span>}
      </Label>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-left flex items-center justify-between hover:border-gray-300 bg-white"
        >
          <span className={`text-sm truncate ${selectedItem ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedItem ? getItemLabel(selectedItem) : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {allowClear && selectedItem && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(null);
                }}
                className="p-0.5 hover:bg-gray-100 rounded"
              >
                <X className="h-3.5 w-3.5 text-gray-400" />
              </button>
            )}
            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">No results found</div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={getItemId(item)}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{getItemLabel(item)}</p>
                      {getItemSubLabel && (
                        <p className="text-xs text-gray-500 truncate">{getItemSubLabel(item)}</p>
                      )}
                    </div>
                    {selectedItem && getItemId(selectedItem) === getItemId(item) && (
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Location Input Component
// ---------------------------------------------------------------------------

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: string;
  lat: number | null;
  lng: number | null;
  onChange: (name: string, lat: number | null, lng: number | null) => void;
  required?: boolean;
}

function LocationInput({
  label,
  placeholder,
  value,
  lat,
  lng,
  onChange,
  required = false,
}: LocationInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (searchQuery: string): Promise<LocationSuggestion[]> => {
    if (!searchQuery || searchQuery.length < 3) return [];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );

      if (!response.ok) throw new Error('Search failed');
      return await response.json();
    } catch (error) {
      console.error('Location search error:', error);
      return [];
    }
  };

  const handleSearch = useCallback((newValue: string) => {
    setQuery(newValue);
    onChange(newValue, null, null); // Clear lat/lng when typing

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (newValue.length >= 3) {
      setIsSearching(true);
      debounceRef.current = setTimeout(async () => {
        const results = await searchLocations(newValue);
        setSuggestions(results);
        setShowSuggestions(true);
        setIsSearching(false);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [onChange]);

  const selectLocation = (suggestion: LocationSuggestion) => {
    const shortName = suggestion.display_name.split(',').slice(0, 3).join(',');
    setQuery(shortName);
    onChange(shortName, parseFloat(suggestion.lat), parseFloat(suggestion.lon));
    setShowSuggestions(false);
  };

  const isSelected = lat !== null && lng !== null;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className={`pr-10 ${isSelected ? 'border-green-500 bg-green-50' : ''}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : isSelected ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Navigation className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => selectLocation(suggestion)}
                className="w-full px-3 py-2.5 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                <p className="text-sm text-gray-900 line-clamp-2">{suggestion.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Form Component
// ---------------------------------------------------------------------------

export function NewTripForm({ isOpen, onClose, onCreateTrip, compact = false }: NewTripFormProps) {
  const [formData, setFormData] = useState<NewTripFormData>(INITIAL_FORM_DATA);
  const [suggestedRoutes, setSuggestedRoutes] = useState<SuggestedRoute[]>([]);
  const [isCalculatingRoutes, setIsCalculatingRoutes] = useState(false);

  // API data state
  const [routes, setRoutes] = useState<RouteWithCount[]>([]);
  const [trucks, setTrucks] = useState<ApiTruck[]>([]);
  const [drivers, setDrivers] = useState<ApiUser[]>([]);
  const [turnBoys, setTurnBoys] = useState<ApiUser[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filtered active items
  const activeTrucks = trucks.filter((t) => t.status === 'ACTIVE');
  const activeDrivers = drivers.filter((d) => d.status === 'ACTIVE');
  const activeTurnBoys = turnBoys.filter((tb) => tb.status === 'ACTIVE');

  // Get selected items for assignment
  const selectedRoute = formData.selectedRouteId
    ? routes.find((r) => r.id === formData.selectedRouteId) ?? null
    : null;
  const selectedVehicle = formData.vehicleId
    ? activeTrucks.find((v) => v.id === formData.vehicleId) ?? null
    : null;
  const selectedDriver = formData.driverId
    ? activeDrivers.find((d) => d.id === formData.driverId) ?? null
    : null;
  const selectedTurnBoy = formData.turnBoyId
    ? activeTurnBoys.find((tb) => tb.id === formData.turnBoyId) ?? null
    : null;

  // Fetch data when form opens
  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_DATA);
      setSuggestedRoutes([]);
      setLoadError(null);

      // Fetch all required data in parallel
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const [routesRes, trucksRes, usersRes] = await Promise.all([
            routesService.getRoutes({ status: 'ACTIVE' }),
            trucksService.getTrucks({ status: 'ACTIVE' }),
            usersService.getUsers({ limit: 500 }),
          ]);

          setRoutes(routesRes.data);
          setTrucks(trucksRes.data);
          
          const allUsers = usersRes.data;
          setDrivers(allUsers.filter((u) => u.type === 'DRIVER'));
          setTurnBoys(allUsers.filter((u) => u.type === 'TURN_BOY'));
        } catch (error) {
          console.error('Failed to load data:', error);
          setLoadError('Failed to load data. Please try again.');
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchData();
    }
  }, [isOpen]);

  // Calculate suggested routes when origin and destination are set for ad-hoc
  const calculateSuggestedRoutes = useCallback(async () => {
    if (
      formData.routeMode !== 'adhoc' ||
      formData.originLat === null ||
      formData.originLng === null ||
      formData.destinationLat === null ||
      formData.destinationLng === null
    ) {
      setSuggestedRoutes([]);
      return;
    }

    setIsCalculatingRoutes(true);

    try {
      const response = await routesService.suggestRoute({
        originLat: formData.originLat,
        originLng: formData.originLng,
        destLat: formData.destinationLat,
        destLng: formData.destinationLng,
      });

      const routes: SuggestedRoute[] = [];

      if (response.orsSuggestion) {
        routes.push({
          distance: response.orsSuggestion.distanceKm,
          duration: response.orsSuggestion.durationMin,
          polyline: response.orsSuggestion.polyline,
        });
      }

      response.existingRoutes.slice(0, 2).forEach((match) => {
        routes.push({
          distance: match.route.estimatedDistanceKm,
          duration: match.route.estimatedDurationMin,
          polyline: match.route.polyline ?? undefined,
        });
      });

      if (routes.length > 0) {
        setSuggestedRoutes(routes);
        setFormData((prev) => ({ ...prev, selectedSuggestedRoute: 0 }));
      } else {
        setSuggestedRoutes([]);
      }
    } catch (error) {
      console.error('Failed to calculate routes:', error);
      setSuggestedRoutes([]);
    } finally {
      setIsCalculatingRoutes(false);
    }
  }, [formData.routeMode, formData.originLat, formData.originLng, formData.destinationLat, formData.destinationLng]);

  // Trigger route calculation when both locations are set
  useEffect(() => {
    if (
      formData.routeMode === 'adhoc' &&
      formData.originLat !== null &&
      formData.destinationLat !== null
    ) {
      calculateSuggestedRoutes();
    }
  }, [formData.routeMode, formData.originLat, formData.destinationLat, calculateSuggestedRoutes]);

  // Form validation
  const isRouteValid =
    formData.routeMode === 'existing'
      ? formData.selectedRouteId !== ''
      : formData.originLat !== null &&
        formData.destinationLat !== null &&
        suggestedRoutes.length > 0;

  const isAssignmentValid = formData.vehicleId !== '' && formData.driverId !== '';
  const isScheduleValid = formData.scheduledStartTime !== '' && formData.scheduledEndTime !== '';
  const isFormValid = isRouteValid && isAssignmentValid && isScheduleValid;

  const handleCreateTrip = () => {
    if (!isFormValid) return;
    const selectedSuggestedRoute = suggestedRoutes[formData.selectedSuggestedRoute];
    onCreateTrip(formData, selectedSuggestedRoute);
    onClose();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Route options for existing routes
  const routeOptions = [
    { value: '', label: '-- Select a route --' },
    ...routes.map((route) => ({
      value: route.id,
      label: `${route.name} (${route.originName} → ${route.destinationName})`,
    })),
  ];

  // Show loading state
  if (isLoadingData) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-700 mb-4">{loadError}</p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header - only show when not compact */}
      {!compact && (
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Create New Trip</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Set up a new trip by selecting a route, assigning a vehicle and crew, and scheduling the trip.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 space-y-8">
        {/* ── Section 1: Route Selection ──────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
              1
            </div>
            <h3 className="font-semibold text-gray-900">Route Selection</h3>
          </div>

          {/* Route Mode Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                formData.routeMode === 'existing'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <input
                type="radio"
                name="routeMode"
                value="existing"
                checked={formData.routeMode === 'existing'}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    routeMode: 'existing',
                    originName: '',
                    originLat: null,
                    originLng: null,
                    destinationName: '',
                    destinationLat: null,
                    destinationLng: null,
                  }))
                }
                className="sr-only"
              />
              <RouteIcon className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Existing Route</span>
            </label>

            <label
              className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                formData.routeMode === 'adhoc'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <input
                type="radio"
                name="routeMode"
                value="adhoc"
                checked={formData.routeMode === 'adhoc'}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    routeMode: 'adhoc',
                    selectedRouteId: '',
                  }))
                }
                className="sr-only"
              />
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">One-time (Ad-hoc)</span>
            </label>
          </div>

          {/* Existing Route Dropdown */}
          {formData.routeMode === 'existing' && (
            <FormSelect
              label="Select Route"
              options={routeOptions}
              value={formData.selectedRouteId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, selectedRouteId: e.target.value }))
              }
              required
            />
          )}

          {/* Show selected route info */}
          {formData.routeMode === 'existing' && selectedRoute && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Distance:</span>
                <span className="font-medium text-gray-900">{selectedRoute.estimatedDistanceKm} km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Est. Duration:</span>
                <span className="font-medium text-gray-900">{formatDuration(selectedRoute.estimatedDurationMin)}</span>
              </div>
            </div>
          )}

          {/* Ad-hoc Location Inputs */}
          {formData.routeMode === 'adhoc' && (
            <div className="space-y-4">
              <LocationInput
                label="Origin"
                placeholder="Search for origin location..."
                value={formData.originName}
                lat={formData.originLat}
                lng={formData.originLng}
                onChange={(name, lat, lng) =>
                  setFormData((prev) => ({
                    ...prev,
                    originName: name,
                    originLat: lat,
                    originLng: lng,
                  }))
                }
                required
              />

              <LocationInput
                label="Destination"
                placeholder="Search for destination location..."
                value={formData.destinationName}
                lat={formData.destinationLat}
                lng={formData.destinationLng}
                onChange={(name, lat, lng) =>
                  setFormData((prev) => ({
                    ...prev,
                    destinationName: name,
                    destinationLat: lat,
                    destinationLng: lng,
                  }))
                }
                required
              />

              {/* Suggested Routes */}
              {isCalculatingRoutes && (
                <div className="flex items-center justify-center py-4 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Finding best routes...</span>
                </div>
              )}

              {!isCalculatingRoutes && suggestedRoutes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Suggested Routes</Label>
                  <div className="space-y-2">
                    {suggestedRoutes.map((route, index) => (
                      <label
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.selectedSuggestedRoute === index
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="suggestedRoute"
                            checked={formData.selectedSuggestedRoute === index}
                            onChange={() =>
                              setFormData((prev) => ({ ...prev, selectedSuggestedRoute: index }))
                            }
                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {index === 0 ? 'Fastest Route' : `Alternative ${index}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {index === 0 ? 'Recommended' : 'Alternative path'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{route.distance} km</p>
                          <p className="text-xs text-gray-500">{formatDuration(route.duration)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Section 2: Assignment ───────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
              2
            </div>
            <h3 className="font-semibold text-gray-900">Assignment</h3>
          </div>

          <SearchableSelect
            label="Truck"
            icon={<Truck className="h-4 w-4 text-gray-500" />}
            placeholder="Search and select truck..."
            required
            items={activeTrucks}
            selectedItem={selectedVehicle}
            onSelect={(item) =>
              setFormData((prev) => ({ ...prev, vehicleId: item?.id || '' }))
            }
            getItemLabel={(v) => `${v.registrationNumber} - ${v.make} ${v.model}`}
            getItemSubLabel={(v) => `${v.bodyType} • ${(v.currentOdometer ?? 0).toLocaleString()} km`}
            getItemId={(v) => v.id}
          />

          <SearchableSelect
            label="Driver"
            icon={<User className="h-4 w-4 text-gray-500" />}
            placeholder="Search and select driver..."
            required
            items={activeDrivers}
            selectedItem={selectedDriver}
            onSelect={(item) =>
              setFormData((prev) => ({ ...prev, driverId: item?.id || '' }))
            }
            getItemLabel={(d) => `${d.firstName} ${d.lastName}`}
            getItemSubLabel={(d) => d.phone}
            getItemId={(d) => d.id}
          />

          <SearchableSelect
            label="Turn Boy"
            icon={<Users className="h-4 w-4 text-gray-500" />}
            placeholder="Search and select turn boy..."
            items={activeTurnBoys}
            selectedItem={selectedTurnBoy}
            onSelect={(item) =>
              setFormData((prev) => ({ ...prev, turnBoyId: item?.id || '' }))
            }
            getItemLabel={(tb) => `${tb.firstName} ${tb.lastName}`}
            getItemSubLabel={(tb) => tb.phone}
            getItemId={(tb) => tb.id}
            allowClear
          />
        </div>

        {/* ── Section 3: Schedule ─────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
              3
            </div>
            <h3 className="font-semibold text-gray-900">Schedule</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormDateInput
              label="Start Time"
              includeTime
              value={formData.scheduledStartTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, scheduledStartTime: e.target.value }))
              }
              required
            />
            <FormDateInput
              label="End Time"
              includeTime
              value={formData.scheduledEndTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, scheduledEndTime: e.target.value }))
              }
              required
            />
          </div>
        </div>

        {/* ── Section 4: Additional Notes ─────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
              4
            </div>
            <h3 className="font-semibold text-gray-900">Additional Notes</h3>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              Notes <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            <Textarea
              placeholder="Add any special instructions, cargo details, or notes for this trip..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
      </div>

      {/* ── Footer Actions ────────────────────────────────────────── */}
      <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleCreateTrip}
          disabled={!isFormValid}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create Trip
        </Button>
      </div>
    </div>
  );
}
