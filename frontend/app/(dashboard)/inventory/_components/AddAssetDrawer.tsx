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
import { FormInput, FormSelect, FormTextarea, FormNumberInput } from '@/components/ui/form';
import { Package, Wrench, Droplets, Settings } from 'lucide-react';
import type { AddAssetDrawerProps, AssetType } from '../_types';

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
        setFormData({
            assetName: asset.name,
            assetCategory: '',
            assetType: asset.type as AssetType,
            unitOfMeasure: '',
            description: '',
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
    console.log('Form submitted:', formData);
    
    if (addAnother) {
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
              <FormInput
                label="Brand"
                id="tyreBrand"
                name="tyreBrand"
                value={formData.tyreBrand}
                onChange={handleInputChange}
                placeholder="e.g., Michelin, Bridgestone"
              />
              <FormInput
                label="Size"
                id="tyreSize"
                name="tyreSize"
                value={formData.tyreSize}
                onChange={handleInputChange}
                placeholder="e.g., 295/80R22.5"
              />
              <FormSelect
                label="Pattern"
                id="tyrePattern"
                name="tyrePattern"
                value={formData.tyrePattern}
                onChange={handleInputChange}
                options={TYRE_PATTERNS}
                placeholder="Select pattern"
              />
              <FormInput
                label="Ply Rating"
                id="tyrePlyRating"
                name="tyrePlyRating"
                value={formData.tyrePlyRating}
                onChange={handleInputChange}
                placeholder="e.g., 16PR"
              />
              <FormNumberInput
                label="Expected Life (KM)"
                id="tyreExpectedLife"
                name="tyreExpectedLife"
                value={formData.tyreExpectedLife}
                onChange={handleInputChange}
                placeholder="e.g., 80000"
              />
              <FormSelect
                label="Tube Type"
                id="tyreTubeType"
                name="tyreTubeType"
                value={formData.tyreTubeType}
                onChange={handleInputChange}
                options={YES_NO_OPTIONS}
                placeholder="Select option"
              />
            </div>
        );

      case 'Spare Part':
        return (
          <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Part Number"
                id="partNumber"
                name="partNumber"
                value={formData.partNumber}
                onChange={handleInputChange}
                placeholder="e.g., BP-F-2024"
              />
              <FormInput
                label="Manufacturer"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                placeholder="e.g., Bosch, Denso"
              />
              <FormInput
                label="Compatible Truck Model"
                id="compatibleTruckModel"
                name="compatibleTruckModel"
                value={formData.compatibleTruckModel}
                onChange={handleInputChange}
                placeholder="e.g., Volvo FH16, Scania R450"
              />
              <FormInput
                label="Warranty Period"
                id="warrantyPeriod"
                name="warrantyPeriod"
                value={formData.warrantyPeriod}
                onChange={handleInputChange}
                placeholder="e.g., 12 months"
              />
            </div>
        );

      case 'Consumable':
        return (
          <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Volume/Weight per Unit"
                id="volumeWeight"
                name="volumeWeight"
                value={formData.volumeWeight}
                onChange={handleInputChange}
                placeholder="e.g., 5L, 20Kg"
              />
              <FormInput
                label="Shelf Life"
                id="shelfLife"
                name="shelfLife"
                value={formData.shelfLife}
                onChange={handleInputChange}
                placeholder="e.g., 24 months"
              />
              <div className="col-span-2">
                <FormSelect
                  label="Hazardous Material"
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
              <FormSelect
                label="Serial Number Required"
                id="serialRequired"
                name="serialRequired"
                value={formData.serialRequired}
                onChange={handleInputChange}
                options={YES_NO_OPTIONS}
                placeholder="Select option"
              />
              <FormSelect
                label="Calibration Required"
                id="calibrationRequired"
                name="calibrationRequired"
                value={formData.calibrationRequired}
                onChange={handleInputChange}
                options={YES_NO_OPTIONS}
                placeholder="Select option"
              />
              <div className="col-span-2">
                <FormInput
                  label="Service Interval"
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
              <FormInput
                label="Asset Name"
                required
                id="assetName"
                name="assetName"
                value={formData.assetName}
                onChange={handleInputChange}
                placeholder="Enter asset name"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Asset Category"
                  required
                  id="assetCategory"
                  name="assetCategory"
                  value={formData.assetCategory}
                  onChange={handleInputChange}
                  options={ASSET_CATEGORIES}
                  placeholder="Select category"
                />
                <FormSelect
                  label="Asset Type"
                  required
                  id="assetType"
                  name="assetType"
                  value={formData.assetType}
                  onChange={handleInputChange}
                  options={ASSET_TYPES}
                  placeholder="Select type"
                />
              </div>

              <FormSelect
                label="Unit of Measure"
                required
                id="unitOfMeasure"
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleInputChange}
                options={UNIT_OF_MEASURE}
                placeholder="Select unit"
              />

              <FormTextarea
                label="Description"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a brief description of the asset..."
                rows={3}
              />
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
