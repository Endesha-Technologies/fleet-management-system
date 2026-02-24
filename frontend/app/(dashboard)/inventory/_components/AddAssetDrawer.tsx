'use client';

// ---------------------------------------------------------------------------
// AddAssetDrawer — Create / Edit an asset via assetsService
// ---------------------------------------------------------------------------
// All form fields are aligned with `CreateAssetRequest`. Type-specific
// sections are shown/hidden based on the selected `assetType`. On submit,
// calls `assetsService.createAsset()` or `assetsService.updateAsset()`.
// ---------------------------------------------------------------------------

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormNumberInput,
  FormDateInput,
} from '@/components/ui/form';
import { AlertCircle, Loader2, Package, Wrench, Droplets, Settings } from 'lucide-react';
import { assetsService } from '@/api/assets';
import type {
  AssetType,
  AssetCategory,
  SparePartCondition,
  ToolCondition,
  CreateAssetRequest,
} from '@/api/assets/assets.types';
import type { AddAssetDrawerProps } from '../_types';

// ---------------------------------------------------------------------------
// Option lists (aligned with API enums)
// ---------------------------------------------------------------------------

const ASSET_TYPE_OPTIONS = [
  { value: 'TYRE', label: 'Tyre' },
  { value: 'SPARE_PART', label: 'Spare Part' },
  { value: 'CONSUMABLE', label: 'Consumable' },
  { value: 'TOOL_EQUIPMENT', label: 'Tool / Equipment' },
];

const CATEGORY_OPTIONS = [
  { value: 'TYRES', label: 'Tyres' },
  { value: 'ENGINE', label: 'Engine' },
  { value: 'FLUIDS', label: 'Fluids' },
  { value: 'BRAKES', label: 'Brakes' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'BODY', label: 'Body' },
  { value: 'TRANSMISSION', label: 'Transmission' },
  { value: 'SUSPENSION', label: 'Suspension' },
];

const TYRE_TYPE_OPTIONS = [
  { value: 'STEER', label: 'Steer' },
  { value: 'DRIVE', label: 'Drive' },
  { value: 'TRAILER', label: 'Trailer' },
  { value: 'ALL_POSITION', label: 'All Position' },
];

const SPARE_PART_CONDITION_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'USED', label: 'Used' },
  { value: 'REFURBISHED', label: 'Refurbished' },
];

const TOOL_CONDITION_OPTIONS = [
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
  { value: 'NEEDS_REPAIR', label: 'Needs Repair' },
];

// ---------------------------------------------------------------------------
// Form data type — all strings so inputs bind cleanly, converted on submit
// ---------------------------------------------------------------------------

interface AssetFormData {
  // Common fields
  assetType: string;
  category: string;
  name: string;
  serialNumber: string;
  partNumber: string;
  description: string;
  notes: string;
  // Tyre-specific
  tyreType: string;
  tyreBrand: string;
  tyreModel: string;
  tyreSize: string;
  tyreLoadIndex: string;
  tyreSpeedRating: string;
  tyreDotCode: string;
  tyreTreadDepth: string;
  tyreMaxMileage: string;
  // Spare part
  sparePartOem: string;
  sparePartFitsModels: string;
  sparePartLifeKm: string;
  sparePartCondition: string;
  // Consumable
  consumableGrade: string;
  consumableVolume: string;
  consumableExpiryDate: string;
  // Tool / Equipment
  toolCalibrationDate: string;
  toolCalibrationDueDate: string;
  toolCondition: string;
}

const EMPTY_FORM: AssetFormData = {
  assetType: '',
  category: '',
  name: '',
  serialNumber: '',
  partNumber: '',
  description: '',
  notes: '',
  tyreType: '',
  tyreBrand: '',
  tyreModel: '',
  tyreSize: '',
  tyreLoadIndex: '',
  tyreSpeedRating: '',
  tyreDotCode: '',
  tyreTreadDepth: '',
  tyreMaxMileage: '',
  sparePartOem: '',
  sparePartFitsModels: '',
  sparePartLifeKm: '',
  sparePartCondition: '',
  consumableGrade: '',
  consumableVolume: '',
  consumableExpiryDate: '',
  toolCalibrationDate: '',
  toolCalibrationDueDate: '',
  toolCondition: '',
};

// ---------------------------------------------------------------------------
// Build API request from form data
// ---------------------------------------------------------------------------

function buildCreateRequest(form: AssetFormData): CreateAssetRequest {
  const req: CreateAssetRequest = {
    assetType: form.assetType as AssetType,
    category: form.category as AssetCategory,
    name: form.name,
  };

  // Common optional fields
  if (form.serialNumber.trim()) req.serialNumber = form.serialNumber.trim();
  if (form.partNumber.trim()) req.partNumber = form.partNumber.trim();
  if (form.description.trim()) req.description = form.description.trim();
  if (form.notes.trim()) req.notes = form.notes.trim();

  // Tyre-specific
  if (form.assetType === 'TYRE') {
    if (form.tyreType) req.tyreType = form.tyreType;
    if (form.tyreBrand.trim()) req.tyreBrand = form.tyreBrand.trim();
    if (form.tyreModel.trim()) req.tyreModel = form.tyreModel.trim();
    if (form.tyreSize.trim()) req.tyreSize = form.tyreSize.trim();
    if (form.tyreLoadIndex.trim()) req.tyreLoadIndex = form.tyreLoadIndex.trim();
    if (form.tyreSpeedRating.trim()) req.tyreSpeedRating = form.tyreSpeedRating.trim();
    if (form.tyreDotCode.trim()) req.tyreDotCode = form.tyreDotCode.trim();
    if (form.tyreTreadDepth) req.tyreTreadDepth = parseFloat(form.tyreTreadDepth);
    if (form.tyreMaxMileage) req.tyreMaxMileage = parseInt(form.tyreMaxMileage, 10);
  }

  // Spare part
  if (form.assetType === 'SPARE_PART') {
    if (form.sparePartOem.trim()) req.sparePartOem = form.sparePartOem.trim();
    if (form.sparePartFitsModels.trim()) req.sparePartFitsModels = form.sparePartFitsModels.trim();
    if (form.sparePartLifeKm) req.sparePartLifeKm = parseInt(form.sparePartLifeKm, 10);
    if (form.sparePartCondition) req.sparePartCondition = form.sparePartCondition as SparePartCondition;
  }

  // Consumable
  if (form.assetType === 'CONSUMABLE') {
    if (form.consumableGrade.trim()) req.consumableGrade = form.consumableGrade.trim();
    if (form.consumableVolume.trim()) req.consumableVolume = form.consumableVolume.trim();
    if (form.consumableExpiryDate) req.consumableExpiryDate = form.consumableExpiryDate;
  }

  // Tool / Equipment
  if (form.assetType === 'TOOL_EQUIPMENT') {
    if (form.toolCalibrationDate) req.toolCalibrationDate = form.toolCalibrationDate;
    if (form.toolCalibrationDueDate) req.toolCalibrationDueDate = form.toolCalibrationDueDate;
    if (form.toolCondition) req.toolCondition = form.toolCondition as ToolCondition;
  }

  return req;
}

// ---------------------------------------------------------------------------
// Populate form from an existing asset (edit mode)
// ---------------------------------------------------------------------------

function assetToFormData(asset: NonNullable<AddAssetDrawerProps['asset']>): AssetFormData {
  return {
    assetType: asset.assetType,
    category: asset.category,
    name: asset.name,
    serialNumber: asset.serialNumber ?? '',
    partNumber: asset.partNumber ?? '',
    description: asset.description ?? '',
    notes: asset.notes ?? '',
    // Tyre
    tyreType: asset.tyreType ?? '',
    tyreBrand: asset.tyreBrand ?? '',
    tyreModel: asset.tyreModel ?? '',
    tyreSize: asset.tyreSize ?? '',
    tyreLoadIndex: asset.tyreLoadIndex ?? '',
    tyreSpeedRating: asset.tyreSpeedRating ?? '',
    tyreDotCode: asset.tyreDotCode ?? '',
    tyreTreadDepth: asset.tyreTreadDepth != null ? String(asset.tyreTreadDepth) : '',
    tyreMaxMileage: asset.tyreMaxMileage != null ? String(asset.tyreMaxMileage) : '',
    // Spare part
    sparePartOem: asset.sparePartOem ?? '',
    sparePartFitsModels: asset.sparePartFitsModels ?? '',
    sparePartLifeKm: asset.sparePartLifeKm != null ? String(asset.sparePartLifeKm) : '',
    sparePartCondition: asset.sparePartCondition ?? '',
    // Consumable
    consumableGrade: asset.consumableGrade ?? '',
    consumableVolume: asset.consumableVolume ?? '',
    consumableExpiryDate: asset.consumableExpiryDate?.split('T')[0] ?? '',
    // Tool
    toolCalibrationDate: asset.toolCalibrationDate?.split('T')[0] ?? '',
    toolCalibrationDueDate: asset.toolCalibrationDueDate?.split('T')[0] ?? '',
    toolCondition: asset.toolCondition ?? '',
  };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AddAssetDrawer({
  open,
  onOpenChange,
  asset,
  onSuccess,
}: AddAssetDrawerProps) {
  const isEditMode = !!asset;
  const [formData, setFormData] = useState<AssetFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Hydrate form when drawer opens ------------------------------------
  useEffect(() => {
    if (open) {
      if (asset) {
        setFormData(assetToFormData(asset));
      } else {
        setFormData(EMPTY_FORM);
      }
      setError(null);
    }
  }, [open, asset]);

  // ---- Generic change handler (works with all form components) -----------
  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  // ---- Validate ---------------------------------------------------------
  const validate = (): string[] => {
    const errs: string[] = [];
    if (!formData.assetType) errs.push('Asset type is required');
    if (!formData.category) errs.push('Category is required');
    if (!formData.name.trim()) errs.push('Asset name is required');
    return errs;
  };

  // ---- Submit -----------------------------------------------------------
  const handleSubmit = async (addAnother = false) => {
    const errs = validate();
    if (errs.length > 0) {
      setError(errs.join('. '));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const request = buildCreateRequest(formData);

      if (isEditMode && asset) {
        await assetsService.updateAsset(asset.id, request);
      } else {
        await assetsService.createAsset(request);
      }

      onSuccess?.();

      if (addAnother) {
        // Reset form but keep asset type & category for faster entry
        setFormData({
          ...EMPTY_FORM,
          assetType: formData.assetType,
          category: formData.category,
        });
      } else {
        onOpenChange(false);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save asset';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Type-specific field sections ------------------------------------
  const renderTyreFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormSelect
        label="Tyre Type"
        id="tyreType"
        name="tyreType"
        value={formData.tyreType}
        onChange={handleInputChange}
        options={TYRE_TYPE_OPTIONS}
        placeholder="Select tyre type"
      />
      <FormInput
        label="Brand"
        id="tyreBrand"
        name="tyreBrand"
        value={formData.tyreBrand}
        onChange={handleInputChange}
        placeholder="e.g., Continental, Michelin"
      />
      <FormInput
        label="Model"
        id="tyreModel"
        name="tyreModel"
        value={formData.tyreModel}
        onChange={handleInputChange}
        placeholder="e.g., HDR2"
      />
      <FormInput
        label="Size"
        id="tyreSize"
        name="tyreSize"
        value={formData.tyreSize}
        onChange={handleInputChange}
        placeholder="e.g., 315/80R22.5"
      />
      <FormInput
        label="Load Index"
        id="tyreLoadIndex"
        name="tyreLoadIndex"
        value={formData.tyreLoadIndex}
        onChange={handleInputChange}
        placeholder="e.g., 156/150"
      />
      <FormInput
        label="Speed Rating"
        id="tyreSpeedRating"
        name="tyreSpeedRating"
        value={formData.tyreSpeedRating}
        onChange={handleInputChange}
        placeholder="e.g., L"
      />
      <FormInput
        label="DOT Code"
        id="tyreDotCode"
        name="tyreDotCode"
        value={formData.tyreDotCode}
        onChange={handleInputChange}
        placeholder="e.g., DOT AB CD 1234"
      />
      <FormNumberInput
        label="Tread Depth (mm)"
        id="tyreTreadDepth"
        name="tyreTreadDepth"
        value={formData.tyreTreadDepth}
        onChange={handleInputChange}
        placeholder="e.g., 18"
      />
      <FormNumberInput
        label="Max Mileage (km)"
        id="tyreMaxMileage"
        name="tyreMaxMileage"
        value={formData.tyreMaxMileage}
        onChange={handleInputChange}
        placeholder="e.g., 120000"
      />
    </div>
  );

  const renderSparePartFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormInput
        label="OEM Part Number"
        id="sparePartOem"
        name="sparePartOem"
        value={formData.sparePartOem}
        onChange={handleInputChange}
        placeholder="e.g., VOL-22345678"
      />
      <FormSelect
        label="Condition"
        id="sparePartCondition"
        name="sparePartCondition"
        value={formData.sparePartCondition}
        onChange={handleInputChange}
        options={SPARE_PART_CONDITION_OPTIONS}
        placeholder="Select condition"
      />
      <div className="col-span-1 sm:col-span-2">
        <FormInput
          label="Fits Models"
          id="sparePartFitsModels"
          name="sparePartFitsModels"
          value={formData.sparePartFitsModels}
          onChange={handleInputChange}
          placeholder="e.g., Volvo FH, Volvo FM"
        />
      </div>
      <FormNumberInput
        label="Expected Life (km)"
        id="sparePartLifeKm"
        name="sparePartLifeKm"
        value={formData.sparePartLifeKm}
        onChange={handleInputChange}
        placeholder="e.g., 80000"
      />
    </div>
  );

  const renderConsumableFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormInput
        label="Grade"
        id="consumableGrade"
        name="consumableGrade"
        value={formData.consumableGrade}
        onChange={handleInputChange}
        placeholder="e.g., 15W-40"
      />
      <FormInput
        label="Volume"
        id="consumableVolume"
        name="consumableVolume"
        value={formData.consumableVolume}
        onChange={handleInputChange}
        placeholder="e.g., 20L"
      />
      <FormDateInput
        label="Expiry Date"
        id="consumableExpiryDate"
        name="consumableExpiryDate"
        value={formData.consumableExpiryDate}
        onChange={handleInputChange}
      />
    </div>
  );

  const renderToolFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormSelect
        label="Condition"
        id="toolCondition"
        name="toolCondition"
        value={formData.toolCondition}
        onChange={handleInputChange}
        options={TOOL_CONDITION_OPTIONS}
        placeholder="Select condition"
      />
      <FormDateInput
        label="Calibration Date"
        id="toolCalibrationDate"
        name="toolCalibrationDate"
        value={formData.toolCalibrationDate}
        onChange={handleInputChange}
      />
      <FormDateInput
        label="Calibration Due Date"
        id="toolCalibrationDueDate"
        name="toolCalibrationDueDate"
        value={formData.toolCalibrationDueDate}
        onChange={handleInputChange}
      />
    </div>
  );

  const renderTypeSpecificFields = () => {
    switch (formData.assetType) {
      case 'TYRE':
        return renderTyreFields();
      case 'SPARE_PART':
        return renderSparePartFields();
      case 'CONSUMABLE':
        return renderConsumableFields();
      case 'TOOL_EQUIPMENT':
        return renderToolFields();
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (formData.assetType) {
      case 'TYRE':
        return 'Tyre';
      case 'SPARE_PART':
        return 'Spare Part';
      case 'CONSUMABLE':
        return 'Consumable';
      case 'TOOL_EQUIPMENT':
        return 'Tool / Equipment';
      default:
        return '';
    }
  };

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="xl" className="overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-gray-200">
          <SheetTitle className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Asset' : 'Add New Asset'}
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            {isEditMode
              ? 'Update the details of this asset.'
              : 'Fill in the details below to add a new asset to your inventory.'}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* ── Error banner ─────────────────────────────────────── */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* ── Section 1: Basic Information ──────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <h3 className="text-base font-semibold text-gray-900">
                Basic Information
              </h3>
            </div>

            <div className="space-y-4 pl-3">
              <FormInput
                label="Asset Name"
                required
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Continental HDR2 Drive Tyre"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Asset Type"
                  required
                  id="assetType"
                  name="assetType"
                  value={formData.assetType}
                  onChange={handleInputChange}
                  options={ASSET_TYPE_OPTIONS}
                  placeholder="Select type"
                />
                <FormSelect
                  label="Category"
                  required
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  options={CATEGORY_OPTIONS}
                  placeholder="Select category"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Serial Number"
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., TYR-2026-001"
                />
                <FormInput
                  label="Part Number"
                  id="partNumber"
                  name="partNumber"
                  value={formData.partNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., BP-FA-2200"
                />
              </div>

              <FormTextarea
                label="Description"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a brief description of the asset…"
                rows={3}
              />
            </div>
          </div>

          {/* ── Section 2: Type-Specific Details ──────────────────── */}
          {formData.assetType && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-blue-600 rounded-full" />
                <h3 className="text-base font-semibold text-gray-900">
                  {getTypeLabel()} Details
                </h3>
              </div>

              <div className="pl-3">{renderTypeSpecificFields()}</div>
            </div>
          )}

          {/* ── Section 4: Notes ──────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <h3 className="text-base font-semibold text-gray-900">
                Additional Notes
              </h3>
            </div>

            <div className="pl-3">
              <FormTextarea
                label="Notes"
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes about this asset…"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 pb-2 mt-auto flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="order-3 sm:order-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {!isEditMode && (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(true)}
              className="order-2 border-blue-300 text-blue-700 hover:bg-blue-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Save & Add Another
            </Button>
          )}
          <Button
            type="button"
            onClick={() => handleSubmit(false)}
            className="order-1 sm:order-3 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            {isEditMode ? 'Update Asset' : 'Save Asset'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
