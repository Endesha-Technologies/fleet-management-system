'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Truck } from '@/types/truck';
import { BasicIdentityStep } from './steps/BasicIdentityStep';
import { RegistrationComplianceStep } from './steps/RegistrationComplianceStep';
import { TechnicalSpecificationsStep } from './steps/TechnicalSpecificationsStep';
import { AxleTyreConfigStep } from './steps/AxleTyreConfigStep';
import { TyreAssignmentDialog } from './dialogs/TyreAssignmentDialog';
import { AssignLaterDialog } from './dialogs/AssignLaterDialog';

interface AddTruckDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTruck?: Truck | null;
  onAddComplete?: () => void;
}

export type FormStep = 'basic' | 'registration' | 'technical' | 'axle-tyre';

export interface FormData {
  // Basic Identity
  plateNumber: string;
  make: string;
  model: string;
  yearOfManufacture: string;
  vinNumber: string;
  color: string;

  // Registration & Compliance
  insuranceExpiryDate: string;
  roadLicenceExpiryDate: string;
  inspectionExpiryDate: string;
  registrationNumber: string;

  // Technical Specifications
  fuelType: string;
  fuelTankCapacity: string;
  engineNumber: string;
  engineCapacity: string;
  transmissionType: string;
  odometerReadingAtEntry: string;

  // Axle & Tyre Configuration
  steerAxles: string;
  driveAxles: string;
  liftAxlePresent: boolean;
  twinTyresOnDrive: boolean;
}

function getInitialFormData(initialTruck?: Truck | null): FormData {
  return {
    plateNumber: initialTruck?.plateNumber || '',
    make: initialTruck?.make || '',
    model: initialTruck?.model || '',
    yearOfManufacture: initialTruck?.year.toString() || '',
    vinNumber: initialTruck?.vinNumber || '',
    color: initialTruck?.color || '',
    insuranceExpiryDate: initialTruck?.insuranceExpiryDate || '',
    roadLicenceExpiryDate: initialTruck?.roadLicenceExpiryDate || '',
    inspectionExpiryDate: initialTruck?.inspectionExpiryDate || '',
    registrationNumber: initialTruck?.registrationNumber || '',
    fuelType: initialTruck?.fuelType || 'Diesel',
    fuelTankCapacity: initialTruck?.fuelTankCapacity.toString() || '',
    engineNumber: initialTruck?.engineNumber || '',
    engineCapacity: initialTruck?.engineCapacity.toString() || '',
    transmissionType: initialTruck?.transmissionType || 'Manual',
    odometerReadingAtEntry: initialTruck?.odometerReadingAtEntry?.toString() || '',
    steerAxles: initialTruck?.axleConfig ? extractAxleCount(initialTruck.axleConfig, 'steer') : '2',
    driveAxles: initialTruck?.axleConfig ? extractAxleCount(initialTruck.axleConfig, 'drive') : '2',
    liftAxlePresent: initialTruck?.axleConfig?.includes('Lift') || false,
    twinTyresOnDrive: false,
  };
}

export function AddTruckDrawer({
  open,
  onOpenChange,
  initialTruck,
  onAddComplete,
}: AddTruckDrawerProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [showTyreAssignment, setShowTyreAssignment] = useState(false);
  const [showAssignLaterDialog, setShowAssignLaterDialog] = useState(false);
  const [formData, setFormData] = useState<FormData>(getInitialFormData(initialTruck));

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line 
      setFormData(getInitialFormData(initialTruck));
      setCurrentStep('basic');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialTruck]);

  const handleNext = () => {
    const steps: FormStep[] = ['basic', 'registration', 'technical', 'axle-tyre'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: FormStep[] = ['basic', 'registration', 'technical', 'axle-tyre'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    setShowAssignLaterDialog(true);
  };

  const handleClose = () => {
    // Resetting is handled by useEffect when opening
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl z-50 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialTruck ? 'Edit Truck' : 'Add Truck'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between mb-2">
            {(['basic', 'registration', 'technical', 'axle-tyre'] as FormStep[]).map(
              (step, index) => (
                <div
                  key={step}
                  className={`flex-1 ${index < 3 ? 'mr-2' : ''}`}
                >
                  <div
                    className={`h-2 rounded-full transition ${
                      currentStep === step || (currentStep !== step && shouldStepBeCompleted(step, currentStep))
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    }`}
                  />
                </div>
              )
            )}
          </div>
          <p className="text-sm text-gray-600">
            {currentStep === 'basic' && 'Step 1: Basic Identity'}
            {currentStep === 'registration' && 'Step 2: Registration & Compliance'}
            {currentStep === 'technical' && 'Step 3: Technical Specifications'}
            {currentStep === 'axle-tyre' && 'Step 4: Axle & Tyre Configuration'}
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'basic' && (
            <BasicIdentityStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 'registration' && (
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
            {currentStep !== 'basic' && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {currentStep !== 'axle-tyre' && (
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
                Next
              </Button>
            )}
            {currentStep === 'axle-tyre' && (
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Assign Later Dialog */}
      <AssignLaterDialog
        open={showAssignLaterDialog}
        onOpenChange={setShowAssignLaterDialog}
        onAssignNow={() => {
          setShowAssignLaterDialog(false);
          setShowTyreAssignment(true);
        }}
        onAssignLater={() => {
          setShowAssignLaterDialog(false);
          handleClose();
          onAddComplete?.();
        }}
      />

      {/* Tyre Assignment Dialog */}
      <TyreAssignmentDialog
        open={showTyreAssignment}
        onOpenChange={setShowTyreAssignment}
        formData={formData}
        onComplete={() => {
          setShowTyreAssignment(false);
          handleClose();
          onAddComplete?.();
        }}
      />
    </>
  );
}

function extractAxleCount(axleConfig: string, type: 'steer' | 'drive'): string {
  const regex = type === 'steer' ? /(\d+)\s*[Ss]teer/ : /(\d+)\s*[Dd]rive/;
  const match = axleConfig.match(regex);
  return match ? match[1] : type === 'steer' ? '2' : '2';
}

function shouldStepBeCompleted(step: FormStep, currentStep: FormStep): boolean {
  const steps: FormStep[] = ['basic', 'registration', 'technical', 'axle-tyre'];
  const stepIndex = steps.indexOf(step);
  const currentIndex = steps.indexOf(currentStep);
  return stepIndex < currentIndex;
}
