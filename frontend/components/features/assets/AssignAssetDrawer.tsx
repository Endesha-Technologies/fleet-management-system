'use client';

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { MOCK_VEHICLES } from '@/constants/vehicles';
import { Asset, StockUnit } from '@/types/asset';
import { AlertCircle, Truck } from 'lucide-react';
import { MOCK_STOCK_UNITS } from '@/constants/asset_details';

export const TYRE_POSITIONS = [
    { value: 'FL', label: 'Front Left' },
    { value: 'FR', label: 'Front Right' },
    { value: 'RLI', label: 'Rear Left Inner' },
    { value: 'RLO', label: 'Rear Left Outer' },
    { value: 'RRI', label: 'Rear Right Inner' },
    { value: 'RRO', label: 'Rear Right Outer' },
];

interface AssignAssetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
}

export default function AssignAssetDrawer({ open, onOpenChange, asset }: AssignAssetDrawerProps) {
  // Form State
  const [truckId, setTruckId] = useState('');
  const [mountDate, setMountDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<number>(0);
  const [engineHours, setEngineHours] = useState<number>(0);
  
  // Asset Specific
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedStockUnitId, setSelectedStockUnitId] = useState('');
  const [tyrePosition, setTyrePosition] = useState('');

  const [errors, setErrors] = useState<string[]>([]);
  
  // Derived
  const isSerialTracked = asset.tracking === 'Serial Number';
  const availableStockUnits = MOCK_STOCK_UNITS.filter(u => u.assetId === asset.id && u.status === 'In Stock');

  // Load truck details when selected
  useEffect(() => {
      if (truckId) {
          const truck = MOCK_VEHICLES.find(v => v.id === truckId);
          if (truck) {
              setOdometer(truck.currentOdometer);
          }
      }
  }, [truckId]);

  const validate = () => {
    const errs = [];
    if (!truckId) errs.push('Truck is required');
    if (!mountDate) errs.push('Assignment Date is required');
    if (odometer < 0) errs.push('Odometer cannot be negative');

    if (isSerialTracked) {
        if (!selectedStockUnitId) errs.push('Specific Serial Number must be selected');
        // Tyre Logic
        if (asset.type === 'Spare Part' || asset.name.toLowerCase().includes('tyre')) {
             if (!tyrePosition) errs.push('Position is required for Tyres/Parts');
        }
    } else {
        if (quantity < 1) errs.push('Quantity must be at least 1');
        if (quantity > asset.inStock) errs.push(`Quantity exceeds available stock (${asset.inStock})`);
    }

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
      if (validate()) {
          // In a real app, this would modify state or call an API
          console.log("Assigning Asset", { truckId, mountDate, odometer, selectedStockUnitId, quantity, tyrePosition });
          onOpenChange(false);
      }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="xl" className="overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Assign to Truck</SheetTitle>
          <SheetDescription>
             Allocating {asset.name} to a fleet vehicle.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
            {/* Truck Information Section */}
            <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Vehicle Information
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2 col-span-2">
                        <Label>Select Truck</Label>
                        <Select
                            value={truckId}
                            onChange={(e) => setTruckId(e.target.value)}
                            options={MOCK_VEHICLES.map(v => ({ value: v.id, label: `${v.plateNumber} - ${v.make} ${v.model}` }))}
                            placeholder="Select a vehicle"
                        />
                     </div>
                     <div className="space-y-2">
                         <Label>Odometer Reading (km)</Label>
                         <Input 
                            type="number" 
                            value={odometer} 
                            onChange={(e) => setOdometer(Number(e.target.value))}
                         />
                     </div>
                      <div className="space-y-2">
                         <Label>Engine Hours (hrs)</Label>
                         <Input 
                            type="number" 
                            value={engineHours} 
                            onChange={(e) => setEngineHours(Number(e.target.value))}
                         />
                     </div>
                      <div className="space-y-2">
                         <Label>Assignment Date</Label>
                         <Input 
                            type="date" 
                            value={mountDate} 
                            onChange={(e) => setMountDate(e.target.value)}
                         />
                     </div>
                 </div>
            </div>

            {/* Asset Allocation Section */}
            <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Asset Allocation</h3>
                 
                 {isSerialTracked ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                             <Label>Stock Unit (Serial Number)</Label>
                             <Select
                                value={selectedStockUnitId}
                                onChange={(e) => setSelectedStockUnitId(e.target.value)}
                                options={availableStockUnits.map(u => ({ 
                                    value: u.id, 
                                    label: `${u.serialNumber} (${u.condition})` 
                                }))}
                                placeholder={availableStockUnits.length > 0 ? "Select serial number" : "No available units in stock"}
                                disabled={availableStockUnits.length === 0}
                             />
                             {availableStockUnits.length === 0 && (
                                 <p className="text-xs text-red-500">No stock available for assignment.</p>
                             )}
                        </div>
                        
                        {(asset.type === 'Spare Part' || asset.type === 'Equipment') && (
                             <div className="space-y-2">
                                <Label>Mount Position</Label>
                                <Select
                                    value={tyrePosition}
                                    onChange={(e) => setTyrePosition(e.target.value)}
                                    options={TYRE_POSITIONS}
                                    placeholder="Select position"
                                />
                             </div>
                        )}
                     </div>
                 ) : (
                      <div className="space-y-2">
                         <Label>Quantity to Assign</Label>
                         <div className="flex items-center gap-3">
                             <Input 
                                type="number" 
                                min={1}
                                max={asset.inStock}
                                value={quantity} 
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-32"
                             />
                             <span className="text-sm text-gray-500">
                                 / {asset.inStock} available
                             </span>
                         </div>
                     </div>
                 )}
            </div>

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
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
                Confirm Assignment
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
