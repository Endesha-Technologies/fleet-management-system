'use client';

// ---------------------------------------------------------------------------
// AddAssetDrawer — Create (single or bulk) / Edit an asset
// ---------------------------------------------------------------------------
// Supports two creation modes:
//   • Single  – one asset at a time (existing behaviour)
//   • Bulk    – multiple assets of mixed types in one request
// In edit mode only single mode is available.
// ---------------------------------------------------------------------------

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormNumberInput,
  FormDateInput,
} from '@/components/ui/form';
import {
  AlertCircle,
  Loader2,
  Package,
  Wrench,
  Droplets,
  Settings,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { assetsService } from '@/api/assets';
import type {
  AssetType,
  AssetCategory,
  SparePartCondition,
  ToolCondition,
  CreateAssetRequest,
} from '@/api/assets/assets.types';
import type { AddAssetDrawerProps, PurchaseAssetInfo } from '../_types';
import PurchaseStockDrawer from './PurchaseStockDrawer';

// ===========================================================================
// Option lists (aligned with API enums)
// ===========================================================================

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
  { value: 'SPARE', label: 'Spare' },
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

const UNIT_OF_MEASURE_OPTIONS = [
  { value: 'liters', label: 'Litres' },
  { value: 'kg', label: 'Kg' },
  { value: 'pcs', label: 'Pcs' },
  { value: 'meters', label: 'Meters' },
  { value: 'sets', label: 'Sets' },
  { value: 'rolls', label: 'Rolls' },
  { value: 'gallons', label: 'Gallons' },
];

// ===========================================================================
// Form data — all strings so inputs bind cleanly; converted on submit
// ===========================================================================

type ChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
) => void;

interface AssetFormData {
  // Common
  assetType: string;
  category: string;
  name: string;
  serialNumber: string;
  partNumber: string;
  description: string;
  storageLocation: string;
  notes: string;
  // Inventory (mainly consumables)
  quantity: string;
  minimumStock: string;
  unitOfMeasure: string;
  // Tyre
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
  storageLocation: '',
  notes: '',
  quantity: '',
  minimumStock: '',
  unitOfMeasure: '',
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

// ===========================================================================
// Build API request from form data
// ===========================================================================

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
  if (form.storageLocation.trim()) req.storageLocation = form.storageLocation.trim();
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

  // Minimum stock (all asset types)
  if (form.minimumStock) req.minimumStock = parseInt(form.minimumStock, 10);

  // Consumable
  if (form.assetType === 'CONSUMABLE') {
    if (form.unitOfMeasure.trim()) req.unitOfMeasure = form.unitOfMeasure.trim();
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

// ===========================================================================
// Populate form from existing asset (edit mode)
// ===========================================================================

function assetToFormData(
  asset: NonNullable<AddAssetDrawerProps['asset']>,
): AssetFormData {
  return {
    assetType: asset.assetType,
    category: asset.category,
    name: asset.name,
    serialNumber: asset.serialNumber ?? '',
    partNumber: asset.partNumber ?? '',
    description: asset.description ?? '',
    storageLocation: asset.storageLocation ?? '',
    notes: asset.notes ?? '',
    quantity: asset.quantity != null ? String(asset.quantity) : '',
    minimumStock: asset.minimumStock != null ? String(asset.minimumStock) : '',
    unitOfMeasure: asset.unitOfMeasure ?? '',
    tyreType: asset.tyreType ?? '',
    tyreBrand: asset.tyreBrand ?? '',
    tyreModel: asset.tyreModel ?? '',
    tyreSize: asset.tyreSize ?? '',
    tyreLoadIndex: asset.tyreLoadIndex ?? '',
    tyreSpeedRating: asset.tyreSpeedRating ?? '',
    tyreDotCode: asset.tyreDotCode ?? '',
    tyreTreadDepth: asset.tyreTreadDepth != null ? String(asset.tyreTreadDepth) : '',
    tyreMaxMileage: asset.tyreMaxMileage != null ? String(asset.tyreMaxMileage) : '',
    sparePartOem: asset.sparePartOem ?? '',
    sparePartFitsModels: asset.sparePartFitsModels ?? '',
    sparePartLifeKm: asset.sparePartLifeKm != null ? String(asset.sparePartLifeKm) : '',
    sparePartCondition: asset.sparePartCondition ?? '',
    consumableGrade: asset.consumableGrade ?? '',
    consumableVolume: asset.consumableVolume ?? '',
    consumableExpiryDate: asset.consumableExpiryDate?.split('T')[0] ?? '',
    toolCalibrationDate: asset.toolCalibrationDate?.split('T')[0] ?? '',
    toolCalibrationDueDate: asset.toolCalibrationDueDate?.split('T')[0] ?? '',
    toolCondition: asset.toolCondition ?? '',
  };
}

// ===========================================================================
// Bulk-mode types
// ===========================================================================

interface BulkEntry {
  id: string;
  form: AssetFormData;
}

// ===========================================================================
// Helper — visual styling per asset type
// ===========================================================================

const TYPE_META: Record<string, { label: string; color: string; border: string; icon: React.ElementType }> = {
  TYRE:           { label: 'Tyre',            color: 'bg-blue-100 text-blue-700',   border: 'border-l-blue-500',   icon: Package  },
  SPARE_PART:     { label: 'Spare Part',      color: 'bg-amber-100 text-amber-700', border: 'border-l-amber-500',  icon: Wrench   },
  CONSUMABLE:     { label: 'Consumable',      color: 'bg-green-100 text-green-700', border: 'border-l-green-500',  icon: Droplets },
  TOOL_EQUIPMENT: { label: 'Tool / Equipment',color: 'bg-purple-100 text-purple-700',border: 'border-l-purple-500', icon: Settings },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? { label: type || 'Unknown', color: 'bg-gray-100 text-gray-500', border: 'border-l-gray-300', icon: Package };
}

// ===========================================================================
// Type-specific field renderers (parameterised for reuse in single & bulk)
// ===========================================================================

function renderTyreFields(data: AssetFormData, onChange: ChangeHandler) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormSelect label="Tyre Type" id="tyreType" name="tyreType" value={data.tyreType} onChange={onChange} options={TYRE_TYPE_OPTIONS} placeholder="Select tyre type" />
      <FormInput label="Brand" id="tyreBrand" name="tyreBrand" value={data.tyreBrand} onChange={onChange} placeholder="e.g., Continental" />
      <FormInput label="Model" id="tyreModel" name="tyreModel" value={data.tyreModel} onChange={onChange} placeholder="e.g., HDR2" />
      <FormInput label="Size" id="tyreSize" name="tyreSize" value={data.tyreSize} onChange={onChange} placeholder="e.g., 315/80R22.5" />
      <FormInput label="Load Index" id="tyreLoadIndex" name="tyreLoadIndex" value={data.tyreLoadIndex} onChange={onChange} placeholder="e.g., 156/150" />
      <FormInput label="Speed Rating" id="tyreSpeedRating" name="tyreSpeedRating" value={data.tyreSpeedRating} onChange={onChange} placeholder="e.g., L" />
      <FormInput label="DOT Code" id="tyreDotCode" name="tyreDotCode" value={data.tyreDotCode} onChange={onChange} placeholder="e.g., DOT AB CD 1234" />
      <FormNumberInput label="Tread Depth (mm)" id="tyreTreadDepth" name="tyreTreadDepth" value={data.tyreTreadDepth} onChange={onChange} placeholder="e.g., 18" />
      <FormNumberInput label="Max Mileage (km)" id="tyreMaxMileage" name="tyreMaxMileage" value={data.tyreMaxMileage} onChange={onChange} placeholder="e.g., 120000" />
    </div>
  );
}

function renderSparePartFields(data: AssetFormData, onChange: ChangeHandler) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormInput label="OEM Part Number" id="sparePartOem" name="sparePartOem" value={data.sparePartOem} onChange={onChange} placeholder="e.g., VOL-22345678" />
      <FormSelect label="Condition" id="sparePartCondition" name="sparePartCondition" value={data.sparePartCondition} onChange={onChange} options={SPARE_PART_CONDITION_OPTIONS} placeholder="Select condition" />
      <div className="col-span-1 sm:col-span-2">
        <FormInput label="Fits Models" id="sparePartFitsModels" name="sparePartFitsModels" value={data.sparePartFitsModels} onChange={onChange} placeholder="e.g., Volvo FH, Volvo FM" />
      </div>
      <FormNumberInput label="Expected Life (km)" id="sparePartLifeKm" name="sparePartLifeKm" value={data.sparePartLifeKm} onChange={onChange} placeholder="e.g., 80000" />
    </div>
  );
}

function renderConsumableFields(data: AssetFormData, onChange: ChangeHandler) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormSelect label="Unit of Measure" id="unitOfMeasure" name="unitOfMeasure" value={data.unitOfMeasure} onChange={onChange} options={UNIT_OF_MEASURE_OPTIONS} placeholder="Select unit" />
      <FormInput label="Grade" id="consumableGrade" name="consumableGrade" value={data.consumableGrade} onChange={onChange} placeholder="e.g., 15W-40" />
      <FormNumberInput label="Volume" id="consumableVolume" name="consumableVolume" value={data.consumableVolume} onChange={onChange} placeholder="e.g., 20" />
      <FormDateInput label="Expiry Date" id="consumableExpiryDate" name="consumableExpiryDate" value={data.consumableExpiryDate} onChange={onChange} />
    </div>
  );
}

function renderToolFields(data: AssetFormData, onChange: ChangeHandler) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormSelect label="Condition" id="toolCondition" name="toolCondition" value={data.toolCondition} onChange={onChange} options={TOOL_CONDITION_OPTIONS} placeholder="Select condition" />
      <FormDateInput label="Calibration Date" id="toolCalibrationDate" name="toolCalibrationDate" value={data.toolCalibrationDate} onChange={onChange} />
      <FormDateInput label="Calibration Due Date" id="toolCalibrationDueDate" name="toolCalibrationDueDate" value={data.toolCalibrationDueDate} onChange={onChange} />
    </div>
  );
}

function renderTypeSpecificFields(data: AssetFormData, onChange: ChangeHandler) {
  switch (data.assetType) {
    case 'TYRE':           return renderTyreFields(data, onChange);
    case 'SPARE_PART':     return renderSparePartFields(data, onChange);
    case 'CONSUMABLE':     return renderConsumableFields(data, onChange);
    case 'TOOL_EQUIPMENT': return renderToolFields(data, onChange);
    default:               return null;
  }
}

// ===========================================================================
// Section heading helper
// ===========================================================================

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-1 bg-blue-600 rounded-full" />
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
    </div>
  );
}

// ===========================================================================
// Main component
// ===========================================================================

export default function AddAssetDrawer({
  open,
  onOpenChange,
  asset,
  onSuccess,
}: AddAssetDrawerProps) {
  const isEditMode = !!asset;

  // ---- Mode ---------------------------------------------------------------
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // ---- Single-mode state --------------------------------------------------
  const [formData, setFormData] = useState<AssetFormData>(EMPTY_FORM);

  // ---- Shared submit / error state ----------------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<number | null>(null);

  // ---- Bulk-mode state ----------------------------------------------------
  const [bulkEntries, setBulkEntries] = useState<BulkEntry[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // ---- Post-submit purchase prompt state ----------------------------------
  const [showPurchasePrompt, setShowPurchasePrompt] = useState(false);
  const [createdAssets, setCreatedAssets] = useState<PurchaseAssetInfo[]>([]);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  // =========================================================================
  // Effects
  // =========================================================================

  // Reset everything when the drawer opens / closes
  useEffect(() => {
    if (open) {
      if (asset) {
        setFormData(assetToFormData(asset));
        setMode('single');
      } else {
        setFormData(EMPTY_FORM);
      }
      setError(null);
      setBulkSuccess(null);
      // Reset bulk state only when opening fresh (not edit)
      if (!asset) {
        setBulkEntries([]);
        setExpandedIds(new Set());
      }
    }
  }, [open, asset]);

  // When switching to bulk mode, ensure at least one entry exists
  useEffect(() => {
    if (mode === 'bulk' && bulkEntries.length === 0) {
      const id = crypto.randomUUID();
      setBulkEntries([{ id, form: { ...EMPTY_FORM } }]);
      setExpandedIds(new Set([id]));
    }
  }, [mode, bulkEntries.length]);

  // =========================================================================
  // Single-mode handlers
  // =========================================================================

  const handleInputChange: ChangeHandler = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!formData.assetType) errs.push('Asset type is required');
    if (!formData.category) errs.push('Category is required');
    if (!formData.name.trim()) errs.push('Asset name is required');
    return errs;
  };

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
        onSuccess?.();
        onOpenChange(false);
      } else {
        const created = await assetsService.createAsset(request);
        onSuccess?.();

        if (addAnother) {
          setFormData({
            ...EMPTY_FORM,
            assetType: formData.assetType,
            category: formData.category,
          });
        } else {
          // Close drawer and show purchase prompt
          onOpenChange(false);
          setCreatedAssets([
            {
              id: created.id,
              name: created.name,
              assetType: created.assetType,
            },
          ]);
          setShowPurchasePrompt(true);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save asset';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // Bulk-mode handlers
  // =========================================================================

  const addBulkEntry = useCallback(() => {
    const id = crypto.randomUUID();
    setBulkEntries((prev) => [...prev, { id, form: { ...EMPTY_FORM } }]);
    setExpandedIds((prev) => new Set([...prev, id]));
    setBulkSuccess(null);
  }, []);

  const removeBulkEntry = useCallback((id: string) => {
    setBulkEntries((prev) => prev.filter((e) => e.id !== id));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const duplicateBulkEntry = useCallback((id: string) => {
    setBulkEntries((prev) => {
      const source = prev.find((e) => e.id === id);
      if (!source) return prev;
      const newId = crypto.randomUUID();
      const idx = prev.findIndex((e) => e.id === id);
      const copy: BulkEntry = { id: newId, form: { ...source.form } };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(bulkEntries.map((e) => e.id)));
  }, [bulkEntries]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const handleBulkChange = useCallback(
    (entryId: string): ChangeHandler =>
      (e) => {
        const { name, value } = e.target;
        setBulkEntries((prev) =>
          prev.map((entry) =>
            entry.id === entryId
              ? { ...entry, form: { ...entry.form, [name]: value } }
              : entry,
          ),
        );
      },
    [],
  );

  const validateBulk = (): string | null => {
    for (let i = 0; i < bulkEntries.length; i++) {
      const { form } = bulkEntries[i];
      if (!form.assetType) return `Entry #${i + 1}: Asset type is required`;
      if (!form.category) return `Entry #${i + 1}: Category is required`;
      if (!form.name.trim()) return `Entry #${i + 1}: Asset name is required`;
    }
    return null;
  };

  const handleBulkSubmit = async () => {
    const validationError = validateBulk();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setBulkSuccess(null);

    try {
      const assetRequests = bulkEntries.map((entry) => buildCreateRequest(entry.form));
      const result = await assetsService.bulkCreateAssets({ assets: assetRequests });
      setBulkSuccess(result.count);
      onSuccess?.();

      // Capture created assets for purchase prompt
      const newlyCreated: PurchaseAssetInfo[] = result.assets.map((a) => ({
        id: a.id,
        name: a.name,
        assetType: a.assetType,
      }));

      // Close drawer briefly showing success, then show purchase prompt
      setTimeout(() => {
        onOpenChange(false);
        setCreatedAssets(newlyCreated);
        setShowPurchasePrompt(true);
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create assets';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // Render: Bulk entry card
  // =========================================================================

  const renderBulkEntryCard = (entry: BulkEntry, index: number) => {
    const isExpanded = expandedIds.has(entry.id);
    const meta = getTypeMeta(entry.form.assetType);
    const onChange = handleBulkChange(entry.id);
    const hasName = entry.form.name.trim().length > 0;

    return (
      <div
        key={entry.id}
        className={cn(
          'border border-gray-200 rounded-lg transition-all border-l-4',
          meta.border,
          isExpanded ? 'shadow-md bg-white' : 'bg-white hover:shadow-sm',
        )}
      >
        {/* ── Collapsed header ─────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
          onClick={() => toggleExpand(entry.id)}
        >
          {/* Entry number */}
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-semibold text-gray-500 shrink-0">
            {index + 1}
          </span>

          {/* Type badge */}
          {entry.form.assetType ? (
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium shrink-0', meta.color)}>
              <meta.icon className="h-3 w-3" />
              {meta.label}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-400 shrink-0">
              No type
            </span>
          )}

          {/* Name */}
          <span className={cn('truncate text-sm', hasName ? 'text-gray-900 font-medium' : 'text-gray-400 italic')}>
            {hasName ? entry.form.name : 'Untitled asset'}
          </span>

          {/* Serial number (not shown for consumables) */}
          {entry.form.serialNumber && entry.form.assetType !== 'CONSUMABLE' && (
            <span className="text-xs text-gray-400 truncate max-w-[140px] hidden sm:inline">
              SN: {entry.form.serialNumber}
            </span>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Duplicate"
              onClick={(e) => { e.stopPropagation(); duplicateBulkEntry(entry.id); }}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Remove"
              onClick={(e) => { e.stopPropagation(); removeBulkEntry(entry.id); }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* ── Expanded form ────────────────────────────────────── */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 space-y-5 pt-4">
            {/* Basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Asset Name" required id={`name-${entry.id}`} name="name" value={entry.form.name} onChange={onChange} placeholder="e.g., Continental HDR2 Drive Tyre" />
              <FormSelect label="Asset Type" required id={`assetType-${entry.id}`} name="assetType" value={entry.form.assetType} onChange={onChange} options={ASSET_TYPE_OPTIONS} placeholder="Select type" />
              <FormSelect label="Category" required id={`category-${entry.id}`} name="category" value={entry.form.category} onChange={onChange} options={CATEGORY_OPTIONS} placeholder="Select category" />
              {entry.form.assetType !== 'CONSUMABLE' && (
                <FormInput label="Serial Number" id={`serialNumber-${entry.id}`} name="serialNumber" value={entry.form.serialNumber} onChange={onChange} placeholder="e.g., TYR-2026-001" />
              )}
              {entry.form.assetType !== 'CONSUMABLE' && entry.form.assetType !== 'SPARE_PART' && (
                <FormInput label="Part Number" id={`partNumber-${entry.id}`} name="partNumber" value={entry.form.partNumber} onChange={onChange} placeholder="e.g., HDR2-315-80R225" />
              )}
              <FormInput label="Storage Location" id={`storageLocation-${entry.id}`} name="storageLocation" value={entry.form.storageLocation} onChange={onChange} placeholder="e.g., Warehouse A - Rack T1" />
              <FormNumberInput label="Minimum Stock" id={`minimumStock-${entry.id}`} name="minimumStock" value={entry.form.minimumStock} onChange={onChange} placeholder="e.g., 100" />
            </div>

            {/* Type-specific fields */}
            {entry.form.assetType && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {getTypeMeta(entry.form.assetType).label} Details
                </p>
                {renderTypeSpecificFields(entry.form, onChange)}
              </div>
            )}

            {/* Notes */}
            <FormTextarea label="Notes" id={`notes-${entry.id}`} name="notes" value={entry.form.notes} onChange={onChange} placeholder="Any additional notes…" rows={2} />
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // Render: Single-mode form
  // =========================================================================

  const renderSingleForm = () => (
    <div className="py-6 space-y-8">
      {/* ── Section 1: Basic Information ──────────────────────── */}
      <div className="space-y-4">
        <SectionHeading title="Basic Information" />
        <div className="space-y-4 pl-3">
          <FormInput label="Asset Name" required id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Continental HDR2 Drive Tyre" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect label="Asset Type" required id="assetType" name="assetType" value={formData.assetType} onChange={handleInputChange} options={ASSET_TYPE_OPTIONS} placeholder="Select type" />
            <FormSelect label="Category" required id="category" name="category" value={formData.category} onChange={handleInputChange} options={CATEGORY_OPTIONS} placeholder="Select category" />
          </div>
          {formData.assetType !== 'CONSUMABLE' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Serial Number" id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} placeholder="e.g., TYR-2026-001" />
              {formData.assetType !== 'SPARE_PART' && (
                <FormInput label="Part Number" id="partNumber" name="partNumber" value={formData.partNumber} onChange={handleInputChange} placeholder="e.g., BP-FA-2200" />
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Storage Location" id="storageLocation" name="storageLocation" value={formData.storageLocation} onChange={handleInputChange} placeholder="e.g., Warehouse A - Rack T1" />
            <FormNumberInput label="Minimum Stock" id="minimumStock" name="minimumStock" value={formData.minimumStock} onChange={handleInputChange} placeholder="e.g., 100" />
          </div>
        </div>
      </div>

      {/* ── Section 2: Type-Specific Details ──────────────────── */}
      {formData.assetType && (
        <div className="space-y-4">
          <SectionHeading title={`${getTypeMeta(formData.assetType).label} Details`} />
          <div className="pl-3">
            {renderTypeSpecificFields(formData, handleInputChange)}
          </div>
        </div>
      )}

      {/* ── Section 3: Notes ──────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeading title="Additional Notes" />
        <div className="pl-3">
          <FormTextarea label="Notes" id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any additional notes about this asset…" rows={3} />
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // Render: Bulk-mode form
  // =========================================================================

  const renderBulkForm = () => (
    <div className="py-6 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {bulkEntries.length} asset{bulkEntries.length !== 1 ? 's' : ''} ready
          to create
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-xs text-gray-500 hover:text-gray-700 underline"
            onClick={expandAll}
          >
            Expand all
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            className="text-xs text-gray-500 hover:text-gray-700 underline"
            onClick={collapseAll}
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Entry cards */}
      <div className="space-y-3">
        {bulkEntries.map((entry, i) => renderBulkEntryCard(entry, i))}
      </div>

      {/* Add button */}
      <button
        type="button"
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-5 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
        onClick={addBulkEntry}
      >
        <Plus className="h-4 w-4" />
        Add Another Asset
      </button>
    </div>
  );

  // =========================================================================
  // Purchase prompt handlers
  // =========================================================================

  const handlePurchasePromptYes = () => {
    setShowPurchasePrompt(false);
    setShowPurchaseDialog(true);
  };

  const handlePurchasePromptNo = () => {
    setShowPurchasePrompt(false);
    setCreatedAssets([]);
  };

  const handlePurchaseDialogClose = (isOpen: boolean) => {
    setShowPurchaseDialog(isOpen);
    if (!isOpen) {
      setCreatedAssets([]);
    }
  };

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          size={mode === 'bulk' && !isEditMode ? '5xl' : 'xl'}
          className="overflow-y-auto flex flex-col"
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <SheetHeader className="pb-6 border-b border-gray-200 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <SheetTitle className="text-xl font-semibold text-gray-900">
                  {isEditMode ? 'Edit Asset' : 'Add Assets'}
                </SheetTitle>
                <SheetDescription className="text-gray-600">
                  {isEditMode
                    ? 'Update the details of this asset.'
                    : mode === 'single'
                      ? 'Fill in the details below to add a new asset.'
                      : 'Add multiple assets at once — each can be a different type.'}
                </SheetDescription>
              </div>

              {/* Mode toggle (hidden in edit mode) */}
              {!isEditMode && (
                <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50 shrink-0 self-start">
                  <button
                    type="button"
                    className={cn(
                      'px-4 py-1.5 text-sm rounded-md transition-all',
                      mode === 'single'
                        ? 'bg-white shadow-sm font-medium text-gray-900'
                        : 'text-gray-500 hover:text-gray-700',
                    )}
                    onClick={() => setMode('single')}
                  >
                    Single
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'px-4 py-1.5 text-sm rounded-md transition-all',
                      mode === 'bulk'
                        ? 'bg-white shadow-sm font-medium text-gray-900'
                        : 'text-gray-500 hover:text-gray-700',
                    )}
                    onClick={() => setMode('bulk')}
                  >
                    Bulk
                  </button>
                </div>
              )}
            </div>
          </SheetHeader>

          {/* ── Error banner ─────────────────────────────────────── */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3 shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* ── Bulk success banner ──────────────────────────────── */}
          {bulkSuccess !== null && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 flex items-start gap-3 shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 font-medium">
                {bulkSuccess} asset{bulkSuccess !== 1 ? 's' : ''} created successfully!
              </p>
            </div>
          )}

          {/* ── Form content ─────────────────────────────────────── */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {mode === 'single' || isEditMode ? renderSingleForm() : renderBulkForm()}
          </div>

          {/* ── Footer ───────────────────────────────────────────── */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 pb-2 mt-auto shrink-0">
            {mode === 'single' || isEditMode ? (
              // Single-mode footer
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
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
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save & Add Another
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  className="order-1 sm:order-3 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isEditMode ? 'Update Asset' : 'Save Asset'}
                </Button>
              </div>
            ) : (
              // Bulk-mode footer
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {bulkEntries.length} asset{bulkEntries.length !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleBulkSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting || bulkEntries.length === 0}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create {bulkEntries.length} Asset{bulkEntries.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Purchase Prompt Dialog ─────────────────────────────── */}
      <Dialog open={showPurchasePrompt} onOpenChange={(isOpen) => {
        if (!isOpen) handlePurchasePromptNo();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Purchase Asset{createdAssets.length !== 1 ? 's' : ''}?
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-gray-600">
              {createdAssets.length === 1 ? (
                <>
                  <span className="font-medium text-gray-900">{createdAssets[0]?.name}</span>{' '}
                  has been created successfully. Would you like to record a purchase for this asset now?
                </>
              ) : (
                <>
                  <span className="font-medium text-gray-900">{createdAssets.length} assets</span>{' '}
                  have been created successfully. Would you like to record a purchase for these assets now?
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Asset summary chips */}
          {createdAssets.length > 0 && (
            <div className="flex flex-wrap gap-2 py-2">
              {createdAssets.slice(0, 5).map((a) => {
                const meta = TYPE_META[a.assetType] ?? { label: a.assetType, color: 'bg-gray-100 text-gray-500', icon: Package };
                const Icon = meta.icon;
                return (
                  <span
                    key={a.id}
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                      meta.color,
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {a.name}
                  </span>
                );
              })}
              {createdAssets.length > 5 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  +{createdAssets.length - 5} more
                </span>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handlePurchasePromptNo}
              className="w-full sm:w-auto"
            >
              Not Now
            </Button>
            <Button
              type="button"
              onClick={handlePurchasePromptYes}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchase Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Purchase Stock Drawer (pre-filled with created assets) ── */}
      <PurchaseStockDrawer
        open={showPurchaseDialog}
        onOpenChange={handlePurchaseDialogClose}
        initialAssets={createdAssets}
        onSuccess={onSuccess}
      />
    </>
  );
}
