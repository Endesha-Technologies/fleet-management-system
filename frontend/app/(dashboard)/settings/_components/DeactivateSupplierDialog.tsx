'use client';

// ---------------------------------------------------------------------------
// DeactivateSupplierDialog — Confirmation dialog before deactivating a supplier
// ---------------------------------------------------------------------------

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { assetsService } from '@/api/assets';
import type { SettingsSupplier } from '../_types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DeactivateSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: SettingsSupplier | null;
  onSuccess: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DeactivateSupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: DeactivateSupplierDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeactivate = async () => {
    if (!supplier) return;
    setLoading(true);
    setError(null);

    try {
      await assetsService.updateSupplier(supplier.id, { isActive: false });
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to deactivate supplier';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center">
            Deactivate Supplier
          </DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to deactivate{' '}
            <span className="font-semibold text-foreground">
              {supplier.name}
            </span>
            ? They will no longer appear in active supplier lists. You can
            reactivate them later.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleDeactivate}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
