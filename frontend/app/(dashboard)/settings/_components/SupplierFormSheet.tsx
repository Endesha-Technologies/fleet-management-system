'use client';

// ---------------------------------------------------------------------------
// SupplierFormSheet — Create / Edit supplier slide-over
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FormInput, FormTextarea, FormSection } from '@/components/ui/form';
import { assetsService } from '@/api/assets';
import type {
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from '@/api/assets/assets.types';
import type {
  SettingsSupplier,
  SupplierFormData,
  SupplierFormErrors,
} from '../_types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SupplierFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: SettingsSupplier | null;
  onSuccess: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMPTY_FORM: SupplierFormData = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SupplierFormSheet({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: SupplierFormSheetProps) {
  const isEditMode = !!supplier;

  const [form, setForm] = useState<SupplierFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<SupplierFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // ── Populate form on open ──────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      if (supplier) {
        setForm({
          name: supplier.name,
          contactPerson: supplier.contactPerson ?? '',
          email: supplier.email ?? '',
          phone: supplier.phone ?? '',
          address: supplier.address ?? '',
          notes: supplier.notes ?? '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [open, supplier]);

  // ── Field change handler ───────────────────────────────────────────────
  const handleChange = useCallback(
    (field: keyof SupplierFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      },
    [],
  );

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const next: SupplierFormErrors = {};

    if (!form.name.trim()) {
      next.name = 'Supplier name is required';
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      if (isEditMode && supplier) {
        const request: UpdateSupplierRequest = {
          name: form.name.trim(),
          contactPerson: form.contactPerson.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          address: form.address.trim() || undefined,
          notes: form.notes.trim() || undefined,
        };
        await assetsService.updateSupplier(supplier.id, request);
      } else {
        const request: CreateSupplierRequest = {
          name: form.name.trim(),
          contactPerson: form.contactPerson.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          address: form.address.trim() || undefined,
          notes: form.notes.trim() || undefined,
        };
        await assetsService.createSupplier(request);
      }

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save supplier';
      setErrors({ name: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? 'Edit Supplier' : 'Add Supplier'}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? 'Update supplier details below.'
              : 'Enter the details for your new supplier.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* ── Basic Info ──────────────────────────────────────────────── */}
          <FormSection title="Supplier Details">
            <FormInput
              label="Supplier Name"
              placeholder="e.g. AutoParts Uganda Ltd"
              value={form.name}
              onChange={handleChange('name')}
              error={errors.name}
              required
            />
            <FormInput
              label="Contact Person"
              placeholder="e.g. John Mukisa"
              value={form.contactPerson}
              onChange={handleChange('contactPerson')}
              error={errors.contactPerson}
            />
          </FormSection>

          {/* ── Contact Details ─────────────────────────────────────────── */}
          <FormSection title="Contact Information">
            <FormInput
              label="Email"
              type="email"
              placeholder="supplier@example.com"
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
            />
            <FormInput
              label="Phone"
              type="tel"
              placeholder="+256 700 000 000"
              value={form.phone}
              onChange={handleChange('phone')}
              error={errors.phone}
            />
            <FormInput
              label="Address"
              placeholder="Plot 12, Industrial Area, Kampala"
              value={form.address}
              onChange={handleChange('address')}
              error={errors.address}
            />
          </FormSection>

          {/* ── Notes ───────────────────────────────────────────────────── */}
          <FormSection title="Additional Notes">
            <FormTextarea
              label="Notes"
              placeholder="Payment terms, delivery schedule, etc."
              value={form.notes}
              onChange={handleChange('notes')}
              error={errors.notes}
              rows={3}
            />
          </FormSection>
        </div>

        <SheetFooter className="mt-8 flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Add Supplier'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
