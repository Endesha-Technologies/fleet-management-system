'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FormSelect, FormNumberInput, FormTextarea } from '@/components/ui/form';
import { AlertCircle, Truck, Loader2, CheckCircle2, MinusCircle, MapPin, Calendar } from 'lucide-react';
import { assetsService } from '@/api/assets';
import type { ActiveInstallation, AssetStockSummary } from '@/api/assets/assets.types';
import type { RemoveAssetDrawerProps } from '../_types';

// ---- Removal reason options -----------------------------------------------

const REMOVAL_REASONS = [
  { value: 'WORN_OUT', label: 'Worn Out' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'PREVENTIVE', label: 'Preventive Maintenance' },
  { value: 'UPGRADE', label: 'Upgrade / Replacement' },
  { value: 'RECALL', label: 'Recall' },
  { value: 'OTHER', label: 'Other' },
];

// ---- Component ------------------------------------------------------------

export default function RemoveAssetDrawer({
  open,
  onOpenChange,
  initialAssetId,
  onSuccess,
}: RemoveAssetDrawerProps) {
  // ---- Data state -----------------------------------------------------------
  const [stockSummary, setStockSummary] = useState<AssetStockSummary | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // ---- Form state -----------------------------------------------------------
  const [selectedInstallationId, setSelectedInstallationId] = useState('');
  const [odometerAtRemoval, setOdometerAtRemoval] = useState<number | ''>('');
  const [removalReason, setRemovalReason] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [notes, setNotes] = useState('');

  // ---- Submit state ---------------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ---- Derived state --------------------------------------------------------
  const activeInstallations: ActiveInstallation[] = stockSummary?.activeInstallations ?? [];
  const selectedInstallation = activeInstallations.find((i) => i.installationId === selectedInstallationId);
  const assetName = stockSummary?.assetName ?? 'Asset';

  // ---- Fetch stock summary on open ------------------------------------------
  const fetchData = useCallback(async () => {
    if (!initialAssetId) return;

    setIsLoadingData(true);
    setDataError(null);
    try {
      const summary = await assetsService.getStockSummary(initialAssetId);
      setStockSummary(summary);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load installation data';
      setDataError(msg);
    } finally {
      setIsLoadingData(false);
    }
  }, [initialAssetId]);

  // ---- Reset form on open ---------------------------------------------------
  useEffect(() => {
    if (open) {
      setSelectedInstallationId('');
      setOdometerAtRemoval('');
      setRemovalReason('');
      setStorageLocation('');
      setNotes('');
      setSubmitError(null);
      setSubmitSuccess(false);
      setStockSummary(null);
      fetchData();
    }
  }, [open, fetchData]);

  // ---- Validate -------------------------------------------------------------
  const validate = (): string[] => {
    const errs: string[] = [];
    if (!selectedInstallationId) errs.push('Please select an installation to remove.');
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
      await assetsService.removeAsset(selectedInstallationId, {
        odometerAtRemoval: odometerAtRemoval !== '' ? Number(odometerAtRemoval) : undefined,
        removalReason: removalReason || undefined,
        storageLocation: storageLocation.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setSubmitSuccess(true);
      onSuccess?.();

      // Auto-close after brief success message
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Removal failed. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Format helper --------------------------------------------------------
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // ---- Render ---------------------------------------------------------------
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-[560px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <MinusCircle className="h-5 w-5 text-orange-600" />
            Remove from Truck
          </SheetTitle>
          <SheetDescription>
            Remove {assetName} from a vehicle. The stock will be returned to inventory.
          </SheetDescription>
        </SheetHeader>

        {/* Success banner */}
        {submitSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Removal successful!</p>
              <p className="text-xs text-green-600">The asset has been removed and returned to stock.</p>
            </div>
          </div>
        )}

        {/* Loading data */}
        {isLoadingData && (
          <div className="flex items-center justify-center h-32 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm text-gray-500">Loading installations…</span>
          </div>
        )}

        {/* Data error */}
        {dataError && !isLoadingData && (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="text-sm text-red-600">{dataError}</p>
            <Button variant="outline" size="sm" onClick={fetchData}>
              Retry
            </Button>
          </div>
        )}

        {/* No active installations */}
        {!isLoadingData && !dataError && !submitSuccess && activeInstallations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <Truck className="h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No active installations found for this asset.</p>
          </div>
        )}

        {/* Form */}
        {!isLoadingData && !dataError && !submitSuccess && activeInstallations.length > 0 && (
          <div className="space-y-8">
            {/* Installation selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-500" />
                Select Installation
              </h3>
              <FormSelect
                label="Active Installation"
                value={selectedInstallationId}
                onChange={(e) => setSelectedInstallationId(e.target.value)}
                options={activeInstallations.map((i) => ({
                  value: i.installationId,
                  label: `${i.registrationNumber} — ${i.quantity} unit${i.quantity !== 1 ? 's' : ''}`,
                }))}
                placeholder="Select installation to remove"
              />

              {/* Installation details card */}
              {selectedInstallation && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Truck</span>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5 text-blue-600" />
                        {selectedInstallation.registrationNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Installed</span>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(selectedInstallation.installedAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Quantity</span>
                      <p className="text-sm font-semibold text-gray-900">{selectedInstallation.quantity}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Removal details */}
            {selectedInstallation && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Removal Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormNumberInput
                    label="Odometer at Removal (km)"
                    value={odometerAtRemoval}
                    onChange={(e) => setOdometerAtRemoval(e.target.value ? Number(e.target.value) : '')}
                    min={0}
                  />
                  <FormSelect
                    label="Removal Reason"
                    value={removalReason}
                    onChange={(e) => setRemovalReason(e.target.value)}
                    options={REMOVAL_REASONS}
                    placeholder="Select reason"
                  />
                </div>

                <FormTextarea
                  label="Storage Location"
                  id="storage-location"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  placeholder="Where will the removed part be stored? (e.g., Warehouse A, Shelf B3)"
                />

                <FormTextarea
                  label="Notes"
                  id="removal-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional details about the removal…"
                />
              </div>
            )}

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
        {!submitSuccess && !isLoadingData && activeInstallations.length > 0 && (
          <SheetFooter className="mt-8">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedInstallationId}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing…
                </>
              ) : (
                'Confirm Removal'
              )}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
