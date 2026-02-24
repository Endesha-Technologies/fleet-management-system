'use client';

// ---------------------------------------------------------------------------
// DisposeAssetDrawer — Record asset disposal (scrap, write-off, donation)
// ---------------------------------------------------------------------------
// Uses the disposal API with disposalType ∈ { SCRAP, WRITE_OFF, DONATION }.
// Supports two modes:
//   • initialAssetId – pre-fills a single asset (from detail page)
//   • No pre-fill    – user selects an asset from a dropdown
//
// API: assetsService.disposeAsset(assetId, { disposalType, quantity, reason, notes })
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
  FormSelect,
  FormTextarea,
  FormNumberInput,
} from '@/components/ui/form';
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  Trash2,
  Package,
  Wrench,
  Droplets,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { assetsService } from '@/api/assets';
import type {
  AssetListItem,
  DisposalType,
  DisposeAssetRequest,
} from '@/api/assets/assets.types';
import type { DisposeAssetDrawerProps } from '../_types';

// ===========================================================================
// Constants
// ===========================================================================

const DISPOSAL_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'SCRAP',          label: 'Scrap' },
  { value: 'WARRANTY_CLAIM', label: 'Warranty Claim' },
];

const DISPOSAL_REASONS = [
  { value: 'Damaged beyond repair', label: 'Damaged beyond repair' },
  { value: 'Obsolete / outdated',   label: 'Obsolete / outdated' },
  { value: 'Lost or stolen',        label: 'Lost or stolen' },
  { value: 'Expired',               label: 'Expired' },
  { value: 'Excess inventory',      label: 'Excess inventory' },
  { value: 'Safety concern',        label: 'Safety concern' },
  { value: 'Other',                 label: 'Other' },
];

// ===========================================================================
// Visual meta per asset type
// ===========================================================================

const TYPE_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  TYRE:           { label: 'Tyre',             color: 'bg-blue-100 text-blue-700',     icon: Package  },
  SPARE_PART:     { label: 'Spare Part',       color: 'bg-amber-100 text-amber-700',   icon: Wrench   },
  CONSUMABLE:     { label: 'Consumable',       color: 'bg-green-100 text-green-700',   icon: Droplets },
  TOOL_EQUIPMENT: { label: 'Tool / Equipment', color: 'bg-purple-100 text-purple-700', icon: Settings },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? { label: type || 'Asset', color: 'bg-gray-100 text-gray-500', icon: Package };
}

// Serialized asset types always have quantity = 1
const SERIALIZED_ASSET_TYPES = new Set<string>(['TYRE', 'SPARE_PART', 'TOOL_EQUIPMENT']);

// ===========================================================================
// Component
// ===========================================================================

export default function DisposeAssetDrawer({
  open,
  onOpenChange,
  initialAssetId,
  onSuccess,
}: DisposeAssetDrawerProps) {
  // ---- Reference data (assets for dropdown) --------------------------------
  const [availableAssets, setAvailableAssets] = useState<AssetListItem[]>([]);
  const [loadingRef, setLoadingRef] = useState(false);

  // ---- Form state ----------------------------------------------------------
  const [assetId, setAssetId] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<AssetListItem | null>(null);
  const [disposalType, setDisposalType] = useState<DisposalType>('SCRAP');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // ---- Submit state --------------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  // =========================================================================
  // Fetch reference data once
  // =========================================================================

  useEffect(() => {
    if (open && availableAssets.length === 0) {
      setLoadingRef(true);
      assetsService
        .getAssets({ page: 1, limit: 200 })
        .then((data) => setAvailableAssets(data.data))
        .catch(() => {})
        .finally(() => setLoadingRef(false));
    }
  }, [open, availableAssets.length]);

  // =========================================================================
  // Reset / prefill when drawer opens
  // =========================================================================

  useEffect(() => {
    if (!open) return;

    // Reset form
    setAssetId('');
    setSelectedAsset(null);
    setDisposalType('SCRAP');
    setQuantity(1);
    setReason('');
    setNotes('');
    setErrors([]);
    setSuccess(false);

    // Pre-fill from initialAssetId
    if (initialAssetId) {
      setAssetId(initialAssetId);
      // Try to find asset in the already-loaded list, otherwise fetch
      const found = availableAssets.find((a) => a.id === initialAssetId);
      if (found) {
        setSelectedAsset(found);
        setQuantity(SERIALIZED_ASSET_TYPES.has(found.assetType) ? 1 : 1);
      } else {
        assetsService
          .getAssetById(initialAssetId)
          .then((asset) => {
            setSelectedAsset(asset as unknown as AssetListItem);
            setQuantity(SERIALIZED_ASSET_TYPES.has(asset.assetType) ? 1 : 1);
          })
          .catch(() => {});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialAssetId]);

  // =========================================================================
  // Handle asset selection change
  // =========================================================================

  const handleAssetChange = useCallback(
    (newAssetId: string) => {
      setAssetId(newAssetId);
      const asset = availableAssets.find((a) => a.id === newAssetId);
      if (asset) {
        setSelectedAsset(asset);
        setQuantity(SERIALIZED_ASSET_TYPES.has(asset.assetType) ? 1 : 1);
      } else {
        setSelectedAsset(null);
      }
    },
    [availableAssets],
  );

  // =========================================================================
  // Derived values
  // =========================================================================

  const isSerialized = selectedAsset
    ? SERIALIZED_ASSET_TYPES.has(selectedAsset.assetType)
    : false;
  const maxQuantity = selectedAsset?.quantity ?? 0;

  const assetOptions = availableAssets
    .filter((a) => a.quantity > 0)
    .map((a) => ({
      value: a.id,
      label: `${a.name} (${getTypeMeta(a.assetType).label}) — ${a.quantity} in stock`,
    }));

  const selectedDisposalMeta = DISPOSAL_TYPE_OPTIONS.find((d) => d.value === disposalType);

  // =========================================================================
  // Validation
  // =========================================================================

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!assetId) errs.push('Please select an asset');
    if (!disposalType) errs.push('Please select a disposal type');
    if (quantity <= 0) errs.push('Quantity must be greater than 0');
    if (selectedAsset && quantity > maxQuantity) {
      errs.push(`Quantity cannot exceed available stock (${maxQuantity})`);
    }
    if (!reason) errs.push('Please select a reason for disposal');
    return errs;
  };

  // =========================================================================
  // Submit
  // =========================================================================

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const request: DisposeAssetRequest = {
        disposalType,
        quantity: isSerialized ? 1 : quantity,
      };
      if (reason.trim()) request.reason = reason.trim();
      if (notes.trim()) request.notes = notes.trim();

      await assetsService.disposeAsset(assetId, request);

      setSuccess(true);
      onSuccess?.();

      // Close after brief success display
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to record disposal';
      setErrors([msg]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // Render
  // =========================================================================

  const meta = selectedAsset ? getTypeMeta(selectedAsset.assetType) : null;
  const Icon = meta?.icon ?? Package;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="lg" className="overflow-y-auto flex flex-col">
        {/* ── Header ───────────────────────────────────────────── */}
        <SheetHeader className="pb-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <SheetTitle className="text-xl font-semibold text-gray-900">
                Dispose Asset
              </SheetTitle>
              <SheetDescription className="text-gray-600">
                Record the disposal of an asset from your inventory.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── Error banner ──────────────────────────────────────── */}
        {errors.length > 0 && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 shrink-0">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              <AlertCircle className="h-5 w-5" />
              {errors.length === 1 ? 'Error' : 'Validation Errors'}
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Success banner ────────────────────────────────────── */}
        {success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 flex items-start gap-3 shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 font-medium">
              Disposal recorded successfully!
            </p>
          </div>
        )}

        {/* ── Form content ──────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto py-6 space-y-8">
          {/* ── Asset Selection ─────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-red-600 rounded-full" />
              <h3 className="text-base font-semibold text-gray-900">
                Asset to Dispose
              </h3>
            </div>
            <div className="pl-3">
              {initialAssetId && selectedAsset ? (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Asset
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-900">
                    <Icon className="h-4 w-4 text-gray-500 shrink-0" />
                    <span className="truncate font-medium">{selectedAsset.name}</span>
                    {meta && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ml-auto shrink-0',
                          meta.color,
                        )}
                      >
                        {meta.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Current stock: <span className="font-medium">{maxQuantity}</span>
                  </p>
                </div>
              ) : (
                <div>
                  <FormSelect
                    label="Asset"
                    required
                    id="dispose-asset"
                    value={assetId}
                    onChange={(e) => handleAssetChange(e.target.value)}
                    options={assetOptions}
                    placeholder={loadingRef ? 'Loading assets…' : 'Select asset to dispose'}
                  />
                  {selectedAsset && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current stock: <span className="font-medium">{maxQuantity}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Disposal Details ────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-red-600 rounded-full" />
              <h3 className="text-base font-semibold text-gray-900">
                Disposal Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
              {/* Disposal Type */}
              <FormSelect
                label="Disposal Type"
                required
                id="dispose-type"
                value={disposalType}
                onChange={(e) => setDisposalType(e.target.value as DisposalType)}
                options={DISPOSAL_TYPE_OPTIONS}
                placeholder="Select disposal type"
              />

              {/* Quantity */}
              <div>
                <FormNumberInput
                  label="Quantity"
                  required
                  id="dispose-quantity"
                  value={String(quantity)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setQuantity(isSerialized ? 1 : Math.min(val, maxQuantity));
                  }}
                  placeholder="1"
                  disabled={isSerialized || !assetId}
                />
                {isSerialized && (
                  <p className="text-xs text-gray-400 mt-1">
                    Fixed at 1 for serialized assets
                  </p>
                )}
                {!isSerialized && maxQuantity > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Max: {maxQuantity}</p>
                )}
              </div>

              {/* Reason */}
              <FormSelect
                label="Reason"
                required
                id="dispose-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                options={DISPOSAL_REASONS}
                placeholder="Select reason"
              />

              {/* Notes */}
              <div className="md:col-span-2">
                <FormTextarea
                  label="Notes"
                  id="dispose-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional details about this disposal…"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* ── Disposal Summary ──────────────────────────────── */}
          {assetId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-red-600 rounded-full" />
                <h3 className="text-base font-semibold text-gray-900">
                  Disposal Summary
                </h3>
              </div>
              <div className="pl-3">
                <div className="bg-red-50/50 rounded-lg p-4 space-y-3 border border-red-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Asset</span>
                    <span className="font-medium text-gray-900">
                      {selectedAsset?.name ?? '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Disposal Type</span>
                    <span className="font-medium text-gray-900">
                      {selectedDisposalMeta?.label ?? disposalType}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium text-gray-900">{quantity}</span>
                  </div>
                  {reason && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reason</span>
                      <span className="font-medium text-gray-900">{reason}</span>
                    </div>
                  )}
                  {selectedAsset?.unitCost != null && selectedAsset.unitCost > 0 && (
                    <div className="border-t border-red-200 pt-3 flex justify-between">
                      <span className="text-gray-900 font-semibold">
                        Estimated Value Loss
                      </span>
                      <span className="text-lg font-bold text-red-700">
                        UGX {(quantity * (selectedAsset.unitCost ?? 0)).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 pb-2 mt-auto shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || success}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting || success || !assetId}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Confirm Disposal
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
