'use client';

import React, { useState, useEffect } from 'react';
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
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Package, Wrench, Droplets, Settings } from 'lucide-react';
import { Asset } from '@/types/asset';

interface AddAssetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
}

type AssetType = 'Tyre' | 'Spare Part' | 'Consumable' | 'Tool';

const ASSET_CATEGORIES = [
  { value: 'Tyres', label: 'Tyres' },
  { value: 'Engine', label: 'Engine' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Fluids', label: 'Fluids' },
  { value: 'Body', label: 'Body' },
];

const ASSET_TYPES = [
  { value: 'Tyre', label: 'Tyre' },
  { value: 'Spare Part', label: 'Spare Part' },
  { value: 'Consumable', label: 'Consumable' },
  { value: 'Tool', label: 'Tool / Equipment' },
];

const UNIT_OF_MEASURE = [
  { value: 'Piece', label: 'Piece' },
  { value: 'Litre', label: 'Litre' },
  { value: 'Kg', label: 'Kg' },
  { value: 'Set', label: 'Set' },
];

const YES_NO_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

const TYRE_PATTERNS = [
  { value: 'Road', label: 'Road' },
  { value: 'Offroad', label: 'Off-road' },
  { value: 'Mixed', label: 'Mixed' },
];

export default function AddAssetDrawer({ open, onOpenChange, asset }: AddAssetDrawerProps) {
  const [formData, setFormData] = useState({
    // Basic Info
    assetName: '',
    assetCategory: '',
    assetType: '' as AssetType | '',
    unitOfMeasure: '',
    description: '',
    // Tyre specific
    tyreBrand: '',
    tyreSize: '',
    tyrePattern: '',
    tyrePlyRating: '',
    tyreExpectedLife: '',
    tyreTubeType: '',
    // Spare Part specific
    partNumber: '',
    manufacturer: '',
    compatibleTruckModel: '',
    warrantyPeriod: '',
    // Consumable specific
    volumeWeight: '',
    shelfLife: '',
    hazardous: '',
    // Tool specific
    serialRequired: '',
    calibrationRequired: '',
    serviceInterval: '',
  });

  useEffect(() => {
    if (open && asset) {
        // Map asset fields to form data
        // Note: This is a simplified mapping. Real app would need more robust mapping based on Asset type structure
        setFormData({
            assetName: asset.name,
            assetCategory: '', // Need to derive from asset.category if available
            assetType: asset.type as AssetType,
            unitOfMeasure: '', // asset.uom
            description: '',
            
            // Populate other fields as best as possible from generic Asset type
            tyreBrand: '',
            tyreSize: '',
            tyrePattern: '',
            tyrePlyRating: '',
            tyreExpectedLife: '',
            tyreTubeType: '',
            partNumber: asset.sku,
            manufacturer: '',
            compatibleTruckModel: '',
            warrantyPeriod: '',
            volumeWeight: '',
            shelfLife: '',
            hazardous: '',
            serialRequired: asset.tracking === 'Serial Number' ? 'Yes' : 'No',
            calibrationRequired: '',
            serviceInterval: '',
        });
    } else if (open && !asset) {
        // Reset form
        setFormData({
            assetName: '',
            assetCategory: '',
            assetType: '' as AssetType | '',
            unitOfMeasure: '',
            description: '',
            tyreBrand: '',
            tyreSize: '',
            tyrePattern: '',
            tyrePlyRating: '',
            tyreExpectedLife: '',
            tyreTubeType: '',
            partNumber: '',
            manufacturer: '',
            compatibleTruckModel: '',
            warrantyPeriod: '',
            volumeWeight: '',
            shelfLife: '',
            hazardous: '',
            serialRequired: '',
            calibrationRequired: '',
            serviceInterval: '',
        });
    }
  }, [open, asset]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (addAnother: boolean = false) => {
    // Handle form submission
    console.log('Form submitted:', formData);
    
    if (addAnother) {
      // Reset form but keep drawer open
      setFormData({
        assetName: '',
        assetCategory: '',
        assetType: '',
        unitOfMeasure: '',
        description: '',
        tyreBrand: '',
        tyreSize: '',
        tyrePattern: '',
        tyrePlyRating: '',
        tyreExpectedLife: '',
        tyreTubeType: '',
        partNumber: '',
        manufacturer: '',
        compatibleTruckModel: '',
        warrantyPeriod: '',
        volumeWeight: '',
        shelfLife: '',
        hazardous: '',
        serialRequired: '',
        calibrationRequired: '',
        serviceInterval: '',
      });
    } else {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Tyre':
        return <Package className="h-4 w-4" />;
      case 'Spare Part':
        return <Wrench className="h-4 w-4" />;
      case 'Consumable':
        return <Droplets className="h-4 w-4" />;
      case 'Tool':
        return <Settings className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderTypeSpecificFields = () => {
    switch (formData.assetType) {
      case 'Tyre':
        return (
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tyreBrand">Brand</Label>
                <Input
                  id="tyreBrand"
                  name="tyreBrand"
                  value={formData.tyreBrand}
                  onChange={handleInputChange}
                  placeholder="e.g., Michelin, Bridgestone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tyreSize">Size</Label>
                <Input
                  id="tyreSize"
                  name="tyreSize"
                  value={formData.tyreSize}
                  onChange={handleInputChange}
                  placeholder="e.g., 295/80R22.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tyrePattern">Pattern</Label>
                <Select
                  id="tyrePattern"
                  name="tyrePattern"
                  value={formData.tyrePattern}
                  onChange={handleInputChange}
                  options={TYRE_PATTERNS}
                  placeholder="Select pattern"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tyrePlyRating">Ply Rating</Label>
                <Input
                  id="tyrePlyRating"
                  name="tyrePlyRating"
                  value={formData.tyrePlyRating}
                  onChange={handleInputChange}
                  placeholder="e.g., 16PR"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tyreExpectedLife">Expected Life (KM)</Label>
                <Input
                  id="tyreExpectedLife"
                  name="tyreExpectedLife"
                  type="number"
                  value={formData.tyreExpectedLife}
                  onChange={handleInputChange}
                  placeholder="e.g., 80000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tyreTubeType">Tube Type</Label>
                <Select
                  id="tyreTubeType"
                  name="tyreTubeType"
                  value={formData.tyreTubeType}
                  onChange={handleInputChange}
                  options={YES_NO_OPTIONS}
                  placeholder="Select option"
                />
              </div>
            </div>
        );

      case 'Spare Part':
        return (
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partNumber">Part Number</Label>
                <Input
                  id="partNumber"
                  name="partNumber"
                  value={formData.partNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., BP-F-2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  placeholder="e.g., Bosch, Denso"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compatibleTruckModel">Compatible Truck Model</Label>
                <Input
                  id="compatibleTruckModel"
                  name="compatibleTruckModel"
                  value={formData.compatibleTruckModel}
                  onChange={handleInputChange}
                  placeholder="e.g., Volvo FH16, Scania R450"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyPeriod">Warranty Period</Label>
                <Input
                  id="warrantyPeriod"
                  name="warrantyPeriod"
                  value={formData.warrantyPeriod}
                  onChange={handleInputChange}
                  placeholder="e.g., 12 months"
                />
              </div>
            </div>
        );

      case 'Consumable':
        return (
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volumeWeight">Volume/Weight per Unit</Label>
                <Input
                  id="volumeWeight"
                  name="volumeWeight"
                  value={formData.volumeWeight}
                  onChange={handleInputChange}
                  placeholder="e.g., 5L, 20Kg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shelfLife">Shelf Life</Label>
                <Input
                  id="shelfLife"
                  name="shelfLife"
                  value={formData.shelfLife}
                  onChange={handleInputChange}
                  placeholder="e.g., 24 months"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="hazardous">Hazardous Material</Label>
                <Select
                  id="hazardous"
                  name="hazardous"
                  value={formData.hazardous}
                  onChange={handleInputChange}
                  options={YES_NO_OPTIONS}
                  placeholder="Select option"
                />
              </div>
            </div>
        );

      case 'Tool':
        return (
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialRequired">Serial Number Required</Label>
                <Select
                  id="serialRequired"
                  name="serialRequired"
                  value={formData.serialRequired}
                  onChange={handleInputChange}
                  options={YES_NO_OPTIONS}
                  placeholder="Select option"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calibrationRequired">Calibration Required</Label>
                <Select
                  id="calibrationRequired"
                  name="calibrationRequired"
                  value={formData.calibrationRequired}
                  onChange={handleInputChange}
                  options={YES_NO_OPTIONS}
                  placeholder="Select option"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="serviceInterval">Service Interval</Label>
                <Input
                  id="serviceInterval"
                  name="serviceInterval"
                  value={formData.serviceInterval}
                  onChange={handleInputChange}
                  placeholder="e.g., Every 6 months"
                />
              </div>
            </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="xl" className="overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-gray-200">
          <SheetTitle className="text-xl font-semibold text-gray-900">
            {asset ? 'Edit Asset' : 'Add New Asset'}
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            {asset 
              ? 'Update the details of this asset.' 
              : 'Fill in the details below to add a new asset to your inventory.'}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
            </div>
            
            <div className="space-y-4 pl-3">
              <div className="space-y-2">
                <Label htmlFor="assetName">
                  Asset Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="assetName"
                  name="assetName"
                  value={formData.assetName}
                  onChange={handleInputChange}
                  placeholder="Enter asset name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetCategory">
                    Asset Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="assetCategory"
                    name="assetCategory"
                    value={formData.assetCategory}
                    onChange={handleInputChange}
                    options={ASSET_CATEGORIES}
                    placeholder="Select category"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assetType">
                    Asset Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="assetType"
                    name="assetType"
                    value={formData.assetType}
                    onChange={handleInputChange}
                    options={ASSET_TYPES}
                    placeholder="Select type"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitOfMeasure">
                  Unit of Measure <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="unitOfMeasure"
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleInputChange}
                  options={UNIT_OF_MEASURE}
                  placeholder="Select unit"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter a brief description of the asset..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Type-specific fields */}
          {formData.assetType && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-blue-600 rounded-full" />
                <h3 className="text-base font-semibold text-gray-900">
                  {formData.assetType === 'Tool' ? 'Tool / Equipment' : formData.assetType} Details
                </h3>
              </div>
              
              <div className="pl-3">
                {renderTypeSpecificFields()}
              </div>
            </div>
          )}
        </div>

        {/* Footer with buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 pb-2 mt-auto flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="order-3 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(true)}
            className="order-2 border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            Save & Add Another
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit(false)}
            className="order-1 sm:order-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Asset
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
