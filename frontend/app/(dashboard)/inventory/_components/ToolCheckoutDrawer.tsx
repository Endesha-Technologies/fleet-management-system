'use client';

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FormTextarea } from '@/components/ui/form';
import { AlertCircle, LogOut, Loader2, CheckCircle2 } from 'lucide-react';
import { assetsService } from '@/api/assets';

export interface ToolCheckoutDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The asset ID to check out. */
  assetId: string;
  /** Display name of the asset (for the description). */
  assetName?: string;
  /** Called after a successful checkout to refresh the parent data. */
  onSuccess?: () => void;
}

export default function ToolCheckoutDrawer({
  open,
  onOpenChange,
  assetId,
  assetName,
  onSuccess,
}: ToolCheckoutDrawerProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reset form on open
  useEffect(() => {
    if (open) {
      setNotes('');
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await assetsService.checkoutTool({
        assetId,
        notes: notes.trim() || undefined,
      });

      setSubmitSuccess(true);
      onSuccess?.();

      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Checkout failed. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-[480px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-orange-600" />
            Check Out Tool
          </SheetTitle>
          <SheetDescription>
            Check out {assetName ? <span className="font-medium">{assetName}</span> : 'this tool'} for use. It will be marked as checked out to you.
          </SheetDescription>
        </SheetHeader>

        {/* Success banner */}
        {submitSuccess && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Tool checked out successfully!</p>
              <p className="text-xs text-green-600">Remember to return it when you&apos;re done.</p>
            </div>
          </div>
        )}

        {!submitSuccess && (
          <div className="space-y-6">
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
              <p className="text-sm text-orange-800">
                This tool will be marked as checked out. Please return it when no longer needed.
              </p>
            </div>

            <FormTextarea
              label="Notes"
              id="checkout-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Purpose of checkout, expected return date, etc…"
            />

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

        {!submitSuccess && (
          <SheetFooter className="mt-8">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking out…
                </>
              ) : (
                'Confirm Checkout'
              )}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
