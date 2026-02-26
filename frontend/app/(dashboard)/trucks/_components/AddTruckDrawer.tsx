'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { trucksService } from '@/api/trucks/trucks.service';
import { BasicIdentityStep } from './steps/BasicIdentityStep';
import { RegistrationComplianceStep } from './steps/RegistrationComplianceStep';
import { TechnicalSpecificationsStep } from './steps/TechnicalSpecificationsStep';
import { AxleTyreConfigStep } from './steps/AxleTyreConfigStep';
import { TyreAssignmentDialog } from './dialogs/TyreAssignmentDialog';
import { AssignLaterDialog } from './dialogs/AssignLaterDialog';
import type { AddTruckDrawerProps, FormStep, TruckFormData } from '../_types';
import {
  FORM_STEPS,
  EMPTY_TRUCK_FORM,
  truckToFormData,
  buildCreateTruckRequest,
  buildUpdateTruckRequest,
} from '../_types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitialFormData(initialTruck?: import('@/api/trucks/trucks.types').Truck | null): TruckFormData {
  if (initialTruck) return truckToFormData(initialTruck);
  return { ...EMPTY_TRUCK_FORM, axles: EMPTY_TRUCK_FORM.axles.map((a) => ({ ...a, key: crypto.randomUUID() })) };
}

const STEP_KEYS: FormStep[] = FORM_STEPS.map((s) => s.key);

function stepIndex(step: FormStep): number {
  return STEP_KEYS.indexOf(step);
}

function isStepCompleted(step: FormStep, currentStep: FormStep): boolean {
  return stepIndex(step) < stepIndex(currentStep);
}

/** Basic validation: required fields for the identity step. */
function canAdvancePastIdentity(form: TruckFormData): boolean {
  return !!(form.make.trim() && form.model.trim() && form.year.trim() && form.registrationNumber.trim());
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddTruckDrawer({
  open,
  onOpenChange,
  initialTruck,
  onAddComplete,
}: AddTruckDrawerProps) {
  const isEditMode = !!initialTruck;

  const [currentStep, setCurrentStep] = useState<FormStep>('identity');
  const [formData, setFormData] = useState<TruckFormData>(getInitialFormData(initialTruck));
  const initialFormRef = useRef<TruckFormData>(getInitialFormData(initialTruck));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // State for post-submit flow
  const [createdTruckId, setCreatedTruckId] = useState<string | null>(null);
  const [showAssignLaterDialog, setShowAssignLaterDialog] = useState(false);
  const [showTyreAssignment, setShowTyreAssignment] = useState(false);

  // Reset when drawer opens
  useEffect(() => {
    if (open) {
      const initial = getInitialFormData(initialTruck);
      setFormData(initial);
      initialFormRef.current = initial;
      setCurrentStep('identity');
      setIsSubmitting(false);
      setSubmitError(null);
      setCreatedTruckId(null);
    }
  }, [open, initialTruck]);

  // Navigation
  const handleNext = useCallback(() => {
    const idx = stepIndex(currentStep);
    if (idx < STEP_KEYS.length - 1) {
      setCurrentStep(STEP_KEYS[idx + 1]);
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    const idx = stepIndex(currentStep);
    if (idx > 0) {
      setCurrentStep(STEP_KEYS[idx - 1]);
    }
  }, [currentStep]);

  // Submit
  const handleSubmit = useCallback(async () => {
    // Validate required fields
    if (!canAdvancePastIdentity(formData)) {
      setSubmitError('Please fill in all required fields on the Vehicle Identity step.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (isEditMode && initialTruck) {
        // Edit mode — only send changed fields
        const payload = buildUpdateTruckRequest(initialFormRef.current, formData);

        // Skip API call if nothing changed
        if (Object.keys(payload).length === 0) {
          onOpenChange(false);
          return;
        }

        await trucksService.updateTruck(initialTruck.id, payload);
        onOpenChange(false);
        onAddComplete?.();
      } else {
        // Create mode — create truck, then prompt for tyre assignment
        const payload = buildCreateTruckRequest(formData);
        const createdTruck = await trucksService.createTruck(payload);
        setCreatedTruckId(createdTruck.id);
        onOpenChange(false); // Close the drawer
        setShowAssignLaterDialog(true); // Open the "assign now or later?" prompt
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save truck. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isEditMode, initialTruck, onOpenChange, onAddComplete]);

  const handleClose = () => {
    onOpenChange(false);
  };

  // Navigation guard: only allow "Next" past identity step if required fields are filled
  const canProceed =
    currentStep !== 'identity' || canAdvancePastIdentity(formData);

  const isLastStep = currentStep === 'axle-tyre';

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl p-0 flex flex-col h-full border-l border-gray-200"
        >
          <SheetHeader className="px-6 py-5 border-b border-gray-200 flex-shrink-0 space-y-1">
            <SheetTitle className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Truck' : 'Add Truck'}
            </SheetTitle>
            <SheetDescription className="text-gray-500">
              {isEditMode
                ? 'Update the details of this truck.'
                : 'Register a new truck in your fleet.'}
            </SheetDescription>
          </SheetHeader>

          {/* Progress Indicator */}
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex gap-2 mb-2">
              {FORM_STEPS.map((step) => (
                <div key={step.key} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-colors ${
                      currentStep === step.key || isStepCompleted(step.key, currentStep)
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-600">
              Step {stepIndex(currentStep) + 1}:{' '}
              {FORM_STEPS.find((s) => s.key === currentStep)?.label}
            </p>
          </div>

          {/* Error Banner */}
          {submitError && (
            <div className="mx-6 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentStep === 'identity' && (
              <BasicIdentityStep formData={formData} setFormData={setFormData} />
            )}
            {currentStep === 'compliance' && (
              <RegistrationComplianceStep formData={formData} setFormData={setFormData} />
            )}
            {currentStep === 'technical' && (
              <TechnicalSpecificationsStep formData={formData} setFormData={setFormData} />
            )}
            {currentStep === 'axle-tyre' && (
              <AxleTyreConfigStep formData={formData} setFormData={setFormData} />
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 flex gap-3 justify-between flex-shrink-0">
            <div>
              {currentStep !== 'identity' && (
                <Button variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              {!isLastStep && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next
                </Button>
              )}
              {isLastStep && (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : isEditMode ? (
                    'Save Changes'
                  ) : (
                    'Create Truck'
                  )}
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Assign Later Dialog — shown after create success */}
      <AssignLaterDialog
        open={showAssignLaterDialog}
        onOpenChange={setShowAssignLaterDialog}
        onAssignNow={() => {
          setShowAssignLaterDialog(false);
          setShowTyreAssignment(true);
        }}
        onAssignLater={() => {
          setShowAssignLaterDialog(false);
          onAddComplete?.();
        }}
      />

      {/* Tyre Assignment Dialog — fetch positions from the API */}
      {createdTruckId && (
        <TyreAssignmentDialog
          open={showTyreAssignment}
          onOpenChange={setShowTyreAssignment}
          truckId={createdTruckId}
          onComplete={() => {
            setShowTyreAssignment(false);
            onAddComplete?.();
          }}
        />
      )}
    </>
  );
}
