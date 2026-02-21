'use client';

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
import { rolesService } from '@/api';
import type { CreateRoleRequest, UpdateRoleRequest } from '@/api/roles/roles.types';
import type { SettingsRole, PermissionGroup, RoleFormData, RoleFormErrors } from '../_types';
import { PermissionMatrix } from './PermissionMatrix';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RoleFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: SettingsRole | null; // null = create mode
  permissionGroups: PermissionGroup[];
  onSuccess: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMPTY_FORM: RoleFormData = {
  name: '',
  description: '',
  permissionIds: [],
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(data: RoleFormData): RoleFormErrors {
  const errors: RoleFormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Role name is required';
  }

  if (data.permissionIds.length === 0) {
    errors.permissions = 'At least one permission is required';
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoleFormSheet({
  open,
  onOpenChange,
  role,
  permissionGroups,
  onSuccess,
}: RoleFormSheetProps) {
  const isCreate = !role;
  const [form, setForm] = useState<RoleFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<RoleFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Reset form when sheet opens or role changes
  useEffect(() => {
    if (open) {
      setErrors({});
      setApiError(null);
      if (role) {
        setForm({
          name: role.name,
          description: role.description,
          permissionIds: [...role.permissionIds],
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, role]);

  // Field change helper
  const setField = useCallback(
    <K extends keyof RoleFormData>(key: K, value: RoleFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      // Clear field error on change
      setErrors((prev) => {
        if (prev[key]) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
    },
    []
  );

  // Permission change handler
  const handlePermissionChange = useCallback(
    (permissionIds: string[]) => {
      setField('permissionIds', permissionIds);
      // Also clear permissions error
      setErrors((prev) => {
        if (prev.permissions) {
          const next = { ...prev };
          delete next.permissions;
          return next;
        }
        return prev;
      });
    },
    [setField]
  );

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      if (isCreate) {
        const payload: CreateRoleRequest = {
          name: form.name.trim(),
          description: form.description.trim(),
          permissionIds: form.permissionIds,
        };
        await rolesService.createRole(payload);
      } else {
        const payload: UpdateRoleRequest = {
          name: form.name.trim(),
          description: form.description.trim(),
          permissions: form.permissionIds,
        };
        await rolesService.updateRole(role.id, payload);
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="2xl" className="flex flex-col overflow-y-auto">
        <SheetHeader className="shrink-0">
          <SheetTitle>{isCreate ? 'Create New Role' : 'Edit Role'}</SheetTitle>
          <SheetDescription>
            {isCreate
              ? 'Define a new role and assign permissions.'
              : `Update details and permissions for "${role?.name}".`}
          </SheetDescription>
        </SheetHeader>

        {/* API-level error banner */}
        {apiError && (
          <div className="mx-0 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <form
          id="role-form"
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-6 py-6"
        >
          {/* ── Basic info ──────────────────────────────────────── */}
          <FormSection title="Role Details">
            <FormInput
              label="Role Name"
              required
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              error={errors.name}
              placeholder="e.g. Fleet Manager"
            />
            <FormTextarea
              label="Description"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              error={errors.description}
              placeholder="Describe what this role is for..."
              rows={3}
            />
          </FormSection>

          {/* ── Permission Matrix ──────────────────────────────── */}
          <FormSection
            title="Permissions"
            description="Select the permissions this role should have."
          >
            <PermissionMatrix
              permissionGroups={permissionGroups}
              selectedPermissionIds={form.permissionIds}
              onChange={handlePermissionChange}
              disabled={submitting}
            />
            {errors.permissions && (
              <p className="text-sm text-red-500">{errors.permissions}</p>
            )}
          </FormSection>
        </form>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <SheetFooter className="shrink-0 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="role-form" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCreate ? 'Create Role' : 'Save Changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
