'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface AssignLaterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignNow: () => void;
  onAssignLater: () => void;
}

export function AssignLaterDialog({
  open,
  onOpenChange,
  onAssignNow,
  onAssignLater,
}: AssignLaterDialogProps) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Assign Tyres to Truck
          </h2>
          <p className="text-gray-600 mb-6">
            Would you like to assign tyres to this truck now, or do it later?
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={onAssignNow}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              Assign Tyres Now
            </Button>
            <Button
              onClick={onAssignLater}
              variant="outline"
              className="w-full"
            >
              Assign Later
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
