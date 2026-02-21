'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Loader } from 'lucide-react';
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
import { FormInput, FormField } from '@/components/ui/form';
import type { Route, LocationSuggestion, EditRouteDrawerProps } from '../_types';

export function EditRouteDrawer({ route, open, onOpenChange, onSave }: EditRouteDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    originLat: null as number | null,
    originLon: null as number | null,
    destination: '',
    destinationLat: null as number | null,
    destinationLon: null as number | null,
    distance: '',
    duration: '',
    deviationThreshold: '500',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Origin search state
  const [originQuery, setOriginQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  
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

  // Populate form when route changes
  useEffect(() => {
    if (route && open) {
      setFormData({
        name: route.name,
        origin: route.origin.name,
        originLat: route.origin.lat,
        originLon: route.origin.lon,
        destination: route.destination.name,
        destinationLat: route.destination.lat,
        destinationLon: route.destination.lon,
        distance: route.distance,
        duration: route.estimatedDuration,
        deviationThreshold: route.deviationThreshold.toString(),
      });
      setOriginQuery(route.origin.name);
      setDestinationQuery(route.destination.name);
      setFormErrors({});
    }
  }, [route, open]);

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

  // Search locations using OpenStreetMap Nominatim API
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
        setIsSearchingOrigin(false);
        setShowOriginSuggestions(true);
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
        setIsSearchingDestination(false);
        setShowDestinationSuggestions(true);
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

  // Calculate route distance and duration when both locations are selected
  useEffect(() => {
    if (formData.originLat && formData.originLon && formData.destinationLat && formData.destinationLon) {
      calculateRoute();
    }
  }, [formData.originLat, formData.originLon, formData.destinationLat, formData.destinationLon]);

  const calculateRoute = async () => {
    if (!formData.originLat || !formData.originLon || !formData.destinationLat || !formData.destinationLon) return;

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${formData.originLon},${formData.originLat};${formData.destinationLon},${formData.destinationLat}?overview=false`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes[0]) {
          const distanceKm = (data.routes[0].distance / 1000).toFixed(1);
          const durationMinutes = Math.round(data.routes[0].duration / 60);
          const hours = Math.floor(durationMinutes / 60);
          const minutes = durationMinutes % 60;
          
          setFormData(prev => ({
            ...prev,
            distance: `${distanceKm} km`,
            duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes} mins`,
          }));
        }
      }
    } catch (error) {
      console.error('Route calculation error:', error);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Route name is required';
    }
    if (!formData.originLat || !formData.originLon) {
      errors.origin = 'Please select a valid origin from the suggestions';
    }
    if (!formData.destinationLat || !formData.destinationLon) {
      errors.destination = 'Please select a valid destination from the suggestions';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !route) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedRoute: Route = {
        ...route,
        name: formData.name,
        origin: {
          name: formData.origin,
          lat: formData.originLat!,
          lon: formData.originLon!,
        },
        destination: {
          name: formData.destination,
          lat: formData.destinationLat!,
          lon: formData.destinationLon!,
        },
        distance: formData.distance,
        estimatedDuration: formData.duration,
        deviationThreshold: parseInt(formData.deviationThreshold) || 500,
      };
      
      onSave?.(updatedRoute);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!route) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-gray-200">
          <SheetTitle>Edit Route</SheetTitle>
          <SheetDescription>
            Update the route details below.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Route Name */}
          <FormInput
            id="routeName"
            label="Route Name"
            required
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
            }}
            placeholder="e.g., Kampala to Jinja Express"
            error={formErrors.name}
          />

          {/* Origin */}
          <div ref={originRef} className="relative">
            <FormField label="Origin" required error={formErrors.origin} htmlFor="origin">
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
                {isSearchingOrigin && (
                  <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>
            </FormField>
            
            {showOriginSuggestions && originSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
          </div>

          {/* Destination */}
          <div ref={destinationRef} className="relative">
            <FormField label="Destination" required error={formErrors.destination} htmlFor="destination">
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
                {isSearchingDestination && (
                  <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>
            </FormField>
            
            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
          <FormField label="Deviation Threshold (meters)" htmlFor="deviationThreshold" description="Alert when vehicle deviates more than this distance from the route">
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="deviationThreshold"
                type="number"
                value={formData.deviationThreshold}
                onChange={(e) => setFormData(prev => ({ ...prev, deviationThreshold: e.target.value }))}
                placeholder="500"
                className="pl-10"
                min="0"
              />
            </div>
          </FormField>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
