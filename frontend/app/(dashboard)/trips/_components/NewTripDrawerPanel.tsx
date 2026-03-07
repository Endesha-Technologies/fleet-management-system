'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Route as RouteIcon, X } from 'lucide-react';
import { NewTripForm, type NewTripFormData, type SuggestedRoute } from './NewTripForm';

// Re-export types
export type { NewTripFormData, SuggestedRoute } from './NewTripForm';

// ---------------------------------------------------------------------------
// Drawer version (for mobile/tablet)
// ---------------------------------------------------------------------------

interface NewTripDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreateTrip: (data: NewTripFormData, suggestedRoute?: SuggestedRoute) => void;
}

export function NewTripDrawer({ open, onClose, onCreateTrip }: NewTripDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col h-full p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <SheetTitle className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5 text-blue-600" />
            Create New Trip
          </SheetTitle>
          <SheetDescription>
            Set up a new trip by selecting a route, assigning a vehicle and crew, and scheduling the trip.
          </SheetDescription>
        </SheetHeader>
        <NewTripForm 
          isOpen={open} 
          onClose={onClose} 
          onCreateTrip={onCreateTrip}
          compact
        />
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Panel version (for desktop inline)
// ---------------------------------------------------------------------------

interface NewTripPanelProps {
  open: boolean;
  onClose: () => void;
  onCreateTrip: (data: NewTripFormData, suggestedRoute?: SuggestedRoute) => void;
}

export function NewTripPanel({ open, onClose, onCreateTrip }: NewTripPanelProps) {
  if (!open) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-7rem)] overflow-hidden sticky top-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Create New Trip</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Set up a new trip by selecting a route, assigning a vehicle and crew.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close panel"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      
      {/* Form */}
      <NewTripForm 
        isOpen={open} 
        onClose={onClose} 
        onCreateTrip={onCreateTrip}
        compact
      />
    </div>
  );
}
