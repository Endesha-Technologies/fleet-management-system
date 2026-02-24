'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FormSelect, FormNumberInput, FormTextarea } from '@/components/ui/form';
import { AlertCircle, Truck, Loader2, CheckCircle2, Package, Wrench } from 'lucide-react';
import { assetsService } from '@/api/assets';
import { trucksService } from '@/api/trucks';
import type { AssetListItem } from '@/api/assets/assets.types';
import type { Truck as TruckType } from '@/api/trucks/trucks.types';
import type { AssignAssetDrawerProps } from '../_types';

// ---- Position options for tyres -------------------------------------------

const TYRE_POSITIONS = [
  { value: 'FL', label: 'Front Left' },
  { value: 'FR', label: 'Front Right' },
  { value: 'RLI', label: 'Rear Left Inner' },
  { value: 'RLO', label: 'Rear Left Outer' },
  { value: 'RRI', label: 'Rear Right Inner' },
  { value: 'RRO', label: 'Rear Right Outer' },
  { value: 'SPARE', label: 'Spare' },
];

// ---- Component ------------------------------------------------------------

export default function AssignAssetDrawer({
  open,
  onOpenChange,
  initialAssetId,
  onSuccess,
}: AssignAssetDrawerProps) {
  // ---- Data state -----------------------------------------------------------
  const [assets, setAssets] = useState<AssetListItem[]>([]);
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // ---- Form state -----------------------------------------------------------
  const [assetId, setAssetId] = useState('');
  const [truckId, setTruckId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [position, setPosition] = useState('');
  const [odometerAtInstall, setOdometerAtInstall] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // ---- Submit state ---------------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ---- Derived state --------------------------------------------------------
  const selectedAsset = assets.find((a) => a.id === assetId);
  const selectedTruck = trucks.find((t) => t.id === truckId);
  const isTyre = selectedAsset?.assetType === 'TYRE';
  const isSpare = selectedAsset?.assetType === 'SPARE_PART';
  const isQuantityBased = selectedAsset?.assetType === 'CONSUMABLE' || selectedAsset?.assetType === 'SPARE_PART';
  const showPosition = isTyre || isSpare;
  const maxQuantity = selectedAsset?.quantity ?? 0;

  // ---- Fetch assets & trucks on open ----------------------------------------
  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [assetsRes, trucksRes] = await Promise.all([
        assetsService.getAssets({ limit: 200 }),
        trucksService.getTrucks({ limit: 200 }),
      ]);
      // Only show assets that have stock
      setAssets(assetsRes.data.filter((a) => a.quantity > 0));
      setTrucks(trucksRes.data);
    } catch {
      // Silent — assets/trucks lists just won't populate
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // ---- Reset form on open ---------------------------------------------------
  useEffect(() => {
    if (open) {
      setAssetId(initialAssetId ?? '');
      setTruckId('');
      setQuantity(1);
      setPosition('');
      setOdometerAtInstall('');
      setNotes('');
      setSubmitError(null);
      setSubmitSuccess(false);
      fetchData();
    }
  }, [open, initialAssetId, fetchData]);

  // ---- Auto-fill odometer when truck selected --------------------------------
  useEffect(() => {
    if (selectedTruck) {
      setOdometerAtInstall(selectedTruck.currentOdometer);
    }
  }, [selectedTruck]);

  // ---- Validate -------------------------------------------------------------
  const validate = (): string[] => {
    const errs: string[] = [];
    if (!assetId) errs.push('Please select an asset.');
    if (!truckId) errs.push('Please select a truck.');
    if (isQuantityBased && (quantity < 1 || quantity > maxQuantity)) {
      errs.push(`Quantity must be between 1 and ${maxQuantity}.`);
    }
    if (isTyre && !position) {
      errs.push('Please select a tyre position.');
    }
    return errs;
  };

  // ---- Submit ---------------------------------------------------------------
  const handleSubmit = async () => {
    const errs = validate();
    if (errs.length > 0) {
      setSubmitError(errs.join(' '));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await assetsService.installAsset({
        assetId,
        truckId,
        quantity: isQuantityBased ? quantity : 1,
        position: showPosition && position ? position : undefined,
        odometerAtInstall: odometerAtInstall !== '' ? Number(odometerAtInstall) : undefined,
        notes: notes.trim() || undefined,
      });

      setSubmitSuccess(true);
      onSuccess?.();

      // Auto-close after brief success message
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Installation failed. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Render ---------------------------------------------------------------
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-[560px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            Install on Truck
          </SheetTitle>
          <SheetDescription>
            Install an asset onto a fleet vehicle. This will reduce available stock.
          </SheetDescription>
        </SheetHeader>

        {/* Success banner */}
        {submitSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Installation successful!</p>
              <p className="text-xs text-green-600">The asset has been installed on the truck.</p>
            </div>
          </div>
        )}

        {/* Loading data */}
        {isLoadingData && (
          <div className="flex items-center justify-center h-32 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm text-gray-500">Loading assets and trucks…</span>
          </div>
        )}

        {/* Form */}
        {!isLoadingData && !submitSuccess && (
          <div className="space-y-8">
            {/* Asset selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                Asset
              </h3>
              <FormSelect
                label="Select Asset"
                value={assetId}
                onChange={(e) => {
                  setAssetId(e.target.value);
                  setQuantity(1);
                  setPosition('');
                }}
                options={assets.map((a) => ({
                  value: a.id,
                  label: `${a.name} (${a.quantity} available)`,
                }))}
                placeholder="Choose an asset to install"
                disabled={!!initialAssetId}
              />

              {selectedAsset && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Type</span>
                    <span className="text-xs font-medium text-gray-700">{selectedAsset.assetType.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Available stock</span>
                    <span className="text-xs font-medium text-gray-700">{selectedAsset.quantity}</span>
                  </div>
                  {selectedAsset.storageLocation && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Location</span>
                      <span className="text-xs font-medium text-gray-700">{selectedAsset.storageLocation}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Truck selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-500" />
                Vehicle
              </h3>
              <FormSelect
                label="Select Truck"
                value={truckId}
                onChange={(e) => setTruckId(e.target.value)}
                options={trucks.map((t) => ({
                  value: t.id,
                  label: `${t.registrationNumber} — ${t.make} ${t.model}`,
                }))}
                placeholder="Choose a vehicle"
              />

              <FormNumberInput
                label="Odometer at Install (km)"
                value={odometerAtInstall}
                onChange={(e) => setOdometerAtInstall(e.target.value ? Number(e.target.value) : '')}
                min={0}
                description={selectedTruck ? `Current: ${selectedTruck.currentOdometer.toLocaleString()} km` : undefined}
              />
            </div>

            {/* Installation details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Installation Details
              </h3>

              {/* Quantity (for consumable / spare parts) */}
              {isQuantityBased && selectedAsset && (
                <FormNumberInput
                  label="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, Number(e.target.value) || 1)))}
                  min={1}
                  max={maxQuantity}
                  description={`Max: ${maxQuantity}`}
                />
              )}

              {/* Position (for tyres / spare parts) */}
              {showPosition && (
                <FormSelect
                  label={isTyre ? 'Tyre Position' : 'Mount Position'}
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  options={TYRE_POSITIONS}
                  placeholder="Select position"
                />
              )}

              {/* Notes */}
              <FormTextarea
                label="Notes"
                id="install-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about this installation…"
              />
            </div>

            {/* Error banner */}
            {submitError && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-xs text-red-600 mt-0.5">{submitError}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!submitSuccess && !isLoadingData && (
          <SheetFooter className="mt-8">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !assetId || !truckId}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Installing…
                </>
              ) : (
                'Confirm Installation'
              )}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
