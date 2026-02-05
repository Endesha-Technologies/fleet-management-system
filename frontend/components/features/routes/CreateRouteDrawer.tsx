'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Loader, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

interface CreateRouteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (routeData: RouteFormData) => void;
}

interface RouteFormData {
  name: string;
  origin: string;
  originLat: number | null;
  originLon: number | null;
  destination: string;
  destinationLat: number | null;
  destinationLon: number | null;
  distance: string;
  duration: string;
  deviationThreshold: string;
}

const initialFormData: RouteFormData = {
  name: '',
  origin: '',
  originLat: null,
  originLon: null,
  destination: '',
  destinationLat: null,
  destinationLon: null,
  distance: '',
  duration: '',
  deviationThreshold: '500',
};

export function CreateRouteDrawer({ open, onOpenChange, onSave }: CreateRouteDrawerProps) {
  const [formData, setFormData] = useState<RouteFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Origin search state
  const [originQuery, setOriginQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [isGettingOriginLocation, setIsGettingOriginLocation] = useState(false);
  const [isGettingDestinationLocation, setIsGettingDestinationLocation] = useState(false);
  
  // Destination search state
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  
  // Refs for click outside handling
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  
  // Debounce timer refs
  const originDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const destinationDebounceRef = useRef<NodeJS.Timeout | null>(null);

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

  // Search locations using OpenStreetMap Nominatim API (free, no API key required)
  const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.length < 3) return [];
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
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
    setFormData(prev => ({ ...prev, origin: value, originLat: null, originLon: null }));
    
    if (originDebounceRef.current) {
      clearTimeout(originDebounceRef.current);
    }
    
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
  }, []);

  // Handle destination search with debounce
  const handleDestinationSearch = useCallback((value: string) => {
    setDestinationQuery(value);
    setFormData(prev => ({ ...prev, destination: value, destinationLat: null, destinationLon: null }));
    
    if (destinationDebounceRef.current) {
      clearTimeout(destinationDebounceRef.current);
    }
    
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
  }, []);

  // Select origin from suggestions
  const selectOrigin = (suggestion: LocationSuggestion) => {
    const shortName = suggestion.display_name.split(',').slice(0, 3).join(',');
    setOriginQuery(shortName);
    setFormData(prev => ({
      ...prev,
      origin: shortName,
      originLat: parseFloat(suggestion.lat),
      originLon: parseFloat(suggestion.lon),
    }));
    setShowOriginSuggestions(false);
    setFormErrors(prev => ({ ...prev, origin: '' }));
  };

  // Select destination from suggestions
  const selectDestination = (suggestion: LocationSuggestion) => {
    const shortName = suggestion.display_name.split(',').slice(0, 3).join(',');
    setDestinationQuery(shortName);
    setFormData(prev => ({
      ...prev,
      destination: shortName,
      destinationLat: parseFloat(suggestion.lat),
      destinationLon: parseFloat(suggestion.lon),
    }));
    setShowDestinationSuggestions(false);
    setFormErrors(prev => ({ ...prev, destination: '' }));
  };

  // Use current location for origin or destination
  const useCurrentLocation = (type: 'origin' | 'destination') => {
    if (!navigator.geolocation) {
      setFormErrors(prev => ({ ...prev, [type]: 'Geolocation is not supported by your browser' }));
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
        
        // Reverse geocode to get address using Nominatim
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            const shortName = data.display_name.split(',').slice(0, 3).join(',');
            
            if (type === 'origin') {
              setOriginQuery(shortName);
              setFormData(prev => ({
                ...prev,
                origin: shortName,
                originLat: latitude,
                originLon: longitude,
              }));
              setFormErrors(prev => ({ ...prev, origin: '' }));
            } else {
              setDestinationQuery(shortName);
              setFormData(prev => ({
                ...prev,
                destination: shortName,
                destinationLat: latitude,
                destinationLon: longitude,
              }));
              setFormErrors(prev => ({ ...prev, destination: '' }));
            }
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          const locationStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          if (type === 'origin') {
            setOriginQuery(locationStr);
            setFormData(prev => ({
              ...prev,
              origin: locationStr,
              originLat: latitude,
              originLon: longitude,
            }));
          } else {
            setDestinationQuery(locationStr);
            setFormData(prev => ({
              ...prev,
              destination: locationStr,
              destinationLat: latitude,
              destinationLon: longitude,
            }));
          }
        }
        
        if (type === 'origin') {
          setIsGettingOriginLocation(false);
        } else {
          setIsGettingDestinationLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setFormErrors(prev => ({ ...prev, [type]: 'Unable to get your location' }));
        if (type === 'origin') {
          setIsGettingOriginLocation(false);
        } else {
          setIsGettingDestinationLocation(false);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Calculate distance and duration when both locations are selected
  useEffect(() => {
    const calculateRoute = async () => {
      if (
        formData.originLat !== null &&
        formData.originLon !== null &&
        formData.destinationLat !== null &&
        formData.destinationLon !== null
      ) {
        try {
          // Use OSRM for routing
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${formData.originLon},${formData.originLat};${formData.destinationLon},${formData.destinationLat}?overview=false`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
              const route = data.routes[0];
              const distanceKm = (route.distance / 1000).toFixed(1);
              const durationMinutes = Math.round(route.duration / 60);
              const hours = Math.floor(durationMinutes / 60);
              const minutes = durationMinutes % 60;
              
              setFormData(prev => ({
                ...prev,
                distance: `${distanceKm} km`,
                duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
              }));
            }
          }
        } catch (error) {
          console.error('Route calculation error:', error);
        }
      }
    };

    calculateRoute();
  }, [formData.originLat, formData.originLon, formData.destinationLat, formData.destinationLon]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Route name is required';
    }
    
    if (!formData.origin.trim() || formData.originLat === null) {
      errors.origin = 'Please select a valid origin location';
    }
    
    if (!formData.destination.trim() || formData.destinationLat === null) {
      errors.destination = 'Please select a valid destination location';
    }
    
    if (!formData.deviationThreshold || parseFloat(formData.deviationThreshold) <= 0) {
      errors.deviationThreshold = 'Please enter a valid deviation threshold';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave?.(formData);
      
      // Reset form
      setFormData(initialFormData);
      setOriginQuery('');
      setDestinationQuery('');
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when drawer closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData(initialFormData);
      setOriginQuery('');
      setDestinationQuery('');
      setFormErrors({});
      setOriginSuggestions([]);
      setDestinationSuggestions([]);
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-gray-200">
          <SheetTitle>Create New Route</SheetTitle>
          <SheetDescription>
            Define a new route with origin and destination locations.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Route Name */}
          <div>
            <Label htmlFor="routeName">Route Name *</Label>
            <Input
              id="routeName"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="e.g., Kampala to Jinja"
              className={formErrors.name ? 'border-red-300' : ''}
            />
            {formErrors.name && (
              <p className="text-red-600 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Origin */}
          <div ref={originRef} className="relative">
            <Label htmlFor="origin">Origin *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="origin"
                value={originQuery}
                onChange={(e) => handleOriginSearch(e.target.value)}
                onFocus={() => setShowOriginSuggestions(true)}
                placeholder="Search for origin location..."
                className={`pl-10 ${formErrors.origin ? 'border-red-300' : ''}`}
              />
              {(isSearchingOrigin || isGettingOriginLocation) && (
                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
            
            {/* Origin Suggestions Dropdown */}
            {showOriginSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {/* Use Current Location Option */}
                <button
                  type="button"
                  onClick={() => useCurrentLocation('origin')}
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
                    <span className="text-sm text-gray-700 line-clamp-2">
                      {suggestion.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {formErrors.origin && (
              <p className="text-red-600 text-xs mt-1">{formErrors.origin}</p>
            )}
          </div>

          {/* Destination */}
          <div ref={destinationRef} className="relative">
            <Label htmlFor="destination">Destination *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="destination"
                value={destinationQuery}
                onChange={(e) => handleDestinationSearch(e.target.value)}
                onFocus={() => setShowDestinationSuggestions(true)}
                placeholder="Search for destination location..."
                className={`pl-10 ${formErrors.destination ? 'border-red-300' : ''}`}
              />
              {(isSearchingDestination || isGettingDestinationLocation) && (
                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
            
            {/* Destination Suggestions Dropdown */}
            {showDestinationSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {/* Use Current Location Option */}
                <button
                  type="button"
                  onClick={() => useCurrentLocation('destination')}
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
                    <span className="text-sm text-gray-700 line-clamp-2">
                      {suggestion.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {formErrors.destination && (
              <p className="text-red-600 text-xs mt-1">{formErrors.destination}</p>
            )}
          </div>

          {/* Auto-calculated Distance and Duration */}
          {(formData.distance || formData.duration) && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <Label className="text-blue-700">Estimated Distance</Label>
                <p className="text-lg font-semibold text-blue-900">{formData.distance || 'Calculating...'}</p>
              </div>
              <div>
                <Label className="text-blue-700">Estimated Duration</Label>
                <p className="text-lg font-semibold text-blue-900">{formData.duration || 'Calculating...'}</p>
              </div>
            </div>
          )}

          {/* Deviation Threshold */}
          <div>
            <Label htmlFor="deviationThreshold">Deviation Threshold (meters) *</Label>
            <Input
              id="deviationThreshold"
              type="number"
              value={formData.deviationThreshold}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, deviationThreshold: e.target.value }));
                if (formErrors.deviationThreshold) setFormErrors(prev => ({ ...prev, deviationThreshold: '' }));
              }}
              placeholder="e.g., 500"
              min="0"
              className={formErrors.deviationThreshold ? 'border-red-300' : ''}
            />
            <p className="text-gray-500 text-xs mt-1">
              Alert if vehicle deviates more than this distance from the planned route.
            </p>
            {formErrors.deviationThreshold && (
              <p className="text-red-600 text-xs mt-1">{formErrors.deviationThreshold}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Route'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
