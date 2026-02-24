'use client';

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FormSelect, FormTextarea } from '@/components/ui/form';
import { AlertCircle, LogIn, Loader2, CheckCircle2 } from 'lucide-react';
import { assetsService } from '@/api/assets';
import type { ToolCondition } from '@/api/assets/assets.types';

const TOOL_CONDITIONS: { value: ToolCondition; label: string }[] = [
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
  { value: 'NEEDS_REPAIR', label: 'Needs Repair' },
];

export interface ToolReturnDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The asset ID to return. */
  assetId: string;
  /** Display name of the asset (for the description). */
  assetName?: string;
  /** Called after a successful return to refresh the parent data. */
  onSuccess?: () => void;
}

export default function ToolReturnDrawer({
  open,
  onOpenChange,
  assetId,
  assetName,
  onSuccess,
}: ToolReturnDrawerProps) {
  const [condition, setCondition] = useState<ToolCondition | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reset form on open
  useEffect(() => {
    if (open) {
      setCondition('');
      setNotes('');
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await assetsService.returnTool(assetId, {
        condition: condition || undefined,
        notes: notes.trim() || undefined,
      });

      setSubmitSuccess(true);
      onSuccess?.();

      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Return failed. Please try again.';
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
            <LogIn className="h-5 w-5 text-green-600" />
            Return Tool
          </SheetTitle>
          <SheetDescription>
            Return {assetName ? <span className="font-medium">{assetName}</span> : 'this tool'} back to inventory.
          </SheetDescription>
        </SheetHeader>

        {/* Success banner */}
        {submitSuccess && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Tool returned successfully!</p>
              <p className="text-xs text-green-600">The tool is now available in inventory.</p>
            </div>
          </div>
        )}

        {!submitSuccess && (
          <div className="space-y-6">
            <FormSelect
              label="Condition on Return"
              value={condition}
              onChange={(e) => setCondition(e.target.value as ToolCondition | '')}
              options={TOOL_CONDITIONS}
              placeholder="Select condition"
            />

            <FormTextarea
              label="Notes"
              id="return-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any issues, damage notes, or observations…"
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
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Returning…
                </>
              ) : (
                'Confirm Return'
              )}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
