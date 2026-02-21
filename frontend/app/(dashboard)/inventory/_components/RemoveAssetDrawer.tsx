'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FormSelect, FormDateInput, FormNumberInput, FormTextarea } from '@/components/ui/form';
import { MOCK_ASSIGNMENTS } from '@/constants/asset_details';
import { AlertCircle, Truck } from 'lucide-react';
import type { RemoveAssetDrawerProps } from '../_types';

export default function RemoveAssetDrawer({ open, onOpenChange, asset }: RemoveAssetDrawerProps) {
  // Form State
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [dismountDate, setDismountDate] = useState(new Date().toISOString().split('T')[0]);
  const [dismountOdometer, setDismountOdometer] = useState<number>(0);
  const [returnCondition, setReturnCondition] = useState('Used');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<string[]>([]);
  
  // Get active assignments for this asset
  const activeAssignments = MOCK_ASSIGNMENTS.filter(a => a.assetId === asset.id && a.status === 'Active');

  const selectedAssignment = activeAssignments.find(a => a.id === selectedAssignmentId);

  const validate = () => {
    const errs = [];
    if (!selectedAssignmentId) errs.push('Please select which assignment to terminate');
    if (!dismountDate) errs.push('Dismount Date is required');
    if (selectedAssignment && dismountOdometer < selectedAssignment.mountOdometer) {
        errs.push(`Dismount Odometer cannot be less than Mount Odometer (${selectedAssignment.mountOdometer})`);
    }

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
      if (validate()) {
          console.log("Removing Asset", { selectedAssignmentId, dismountDate, dismountOdometer, returnCondition, notes });
          onOpenChange(false);
      }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="xl" className="overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Remove from Truck</SheetTitle>
          <SheetDescription>
             Record the removal of {asset.name} from a vehicle.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
            {/* Selection Section */}
            <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Select Assignment
                 </h3>
                 <FormSelect
                    label="Active Assignment"
                    value={selectedAssignmentId}
                    onChange={(e) => setSelectedAssignmentId(e.target.value)}
                    options={activeAssignments.map(a => ({ 
                        value: a.id, 
                        label: `${a.truckPlate} - ${a.serialNumber ? a.serialNumber : 'Bulk Qty'}` 
                    }))}
                    placeholder={activeAssignments.length > 0 ? "Select truck/unit" : "No active assignments found"}
                    disabled={activeAssignments.length === 0}
                 />
                 
                 {selectedAssignment && (
                     <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 grid grid-cols-2 gap-2">
                         <div>
                             <span className="text-gray-500 text-xs uppercase">Truck</span>
                             <p className="font-semibold">{selectedAssignment.truckPlate}</p>
                         </div>
                         <div>
                             <span className="text-gray-500 text-xs uppercase">Mount Date</span>
                             <p className="font-semibold">{new Date(selectedAssignment.mountDate).toLocaleDateString()}</p>
                         </div>
                         <div>
                             <span className="text-gray-500 text-xs uppercase">Mount Odometer</span>
                             <p className="font-semibold">{selectedAssignment.mountOdometer.toLocaleString()} km</p>
                         </div>
                         <div>
                             <span className="text-gray-500 text-xs uppercase">Position</span>
                             <p className="font-semibold">{selectedAssignment.position || 'N/A'}</p>
                         </div>
                     </div>
                 )}
            </div>

            {/* Removal Details */}
            {selectedAssignment && (
                <div className="space-y-4">
                     <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Removal Details</h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormDateInput
                            label="Dismount Date"
                            value={dismountDate}
                            onChange={(e) => setDismountDate(e.target.value)}
                         />
                         <FormNumberInput
                            label="Current Odometer (km)"
                            value={dismountOdometer}
                            onChange={(e) => setDismountOdometer(Number(e.target.value))}
                         />
                         <FormSelect
                            label="Return Condition"
                            value={returnCondition}
                            onChange={(e) => setReturnCondition(e.target.value)}
                            options={[
                                { value: 'Good', label: 'Good (Return to Stock)' },
                                { value: 'Used', label: 'Used (Return to Stock)' },
                                { value: 'Damaged', label: 'Damaged (Quarantine)' },
                                { value: 'Worn Out', label: 'Worn Out (Dispose)' },
                            ]}
                        />
                     </div>

                     <FormTextarea
                        label="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Reason for removal..."
                     />
                </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                    <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                         <AlertCircle className="h-4 w-4" />
                         Validation Error
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-700">
                        {errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                </div>
            )}
        </div>

        <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700 text-white">
                Confirm Removal
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
