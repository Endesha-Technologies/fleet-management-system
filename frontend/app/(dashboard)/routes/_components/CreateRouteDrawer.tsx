'use client';

import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { routesService } from '@/api/routes';
import type { CreateRouteRequest } from '@/api/routes';
import {
  RouteFormFields,
  validateRouteForm,
  INITIAL_FORM_DATA,
  type RouteFormData,
} from './RouteFormFields';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreateRouteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreateRouteDrawer({ open, onOpenChange, onSuccess }: CreateRouteDrawerProps) {
  const [formData, setFormData] = useState<RouteFormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async () => {
    const errors = validateRouteForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const request: CreateRouteRequest = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        originName: formData.originName.trim(),
        originLat: formData.originLat!,
        originLng: formData.originLng!,
        destinationName: formData.destinationName.trim(),
        destinationLat: formData.destinationLat!,
        destinationLng: formData.destinationLng!,
        type: formData.type,
        deviationThresholdKm: parseFloat(formData.deviationThresholdKm),
      };

      // Add optional fields
      if (formData.speedLimitKmh) {
        request.speedLimitKmh = parseFloat(formData.speedLimitKmh);
      }
      if (formData.notes.trim()) {
        request.notes = formData.notes.trim();
      }

      await routesService.createRoute(request);

      // Reset and close
      setFormData(INITIAL_FORM_DATA);
      setFormErrors({});
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Create route error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create route');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when drawer closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData(INITIAL_FORM_DATA);
      setFormErrors({});
      setSubmitError(null);
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-gray-200">
          <SheetTitle>Create New Route</SheetTitle>
          <SheetDescription>
            Define the origin and destination. Distance and duration will be calculated automatically.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {/* Submit Error */}
          {submitError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {submitError}
            </div>
          )}

          {/* Form Fields */}
          <RouteFormFields
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
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
                  Creating...
                </>
              ) : (
                'Create Route'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
