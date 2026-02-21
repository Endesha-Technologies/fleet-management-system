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
import { FormInput, FormSelect, FormDateInput, FormSection } from '@/components/ui/form';
import type { FormSelectOption } from '@/components/ui/form';
import { usersService } from '@/api';
import type { CreateUserRequest, UpdateUserRequest } from '@/api/users/users.types';
import type { SettingsUser, UserFormData, UserFormErrors, UserType } from '../_types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: SettingsUser | null; // null / undefined = create mode
  roles: Array<{ id: string; name: string }>;
  onSuccess: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TYPE_OPTIONS: FormSelectOption[] = [
  { value: 'SYSTEM', label: 'System' },
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'DRIVER', label: 'Driver' },
  { value: 'TURN_BOY', label: 'Turn Boy' },
];

const EMPTY_FORM: UserFormData = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  type: 'ADMIN',
  roleIds: [],
  password: '',
  confirmPassword: '',
  licenseNumber: '',
  licenseExpiry: '',
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(data: UserFormData, isCreate: boolean): UserFormErrors {
  const errors: UserFormErrors = {};

  if (!data.firstName.trim()) errors.firstName = 'First name is required';
  if (!data.lastName.trim()) errors.lastName = 'Last name is required';

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.phone.trim()) errors.phone = 'Phone number is required';

  if (isCreate) {
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  if (data.type === 'DRIVER') {
    if (!data.licenseNumber.trim()) {
      errors.licenseNumber = 'License number is required for drivers';
    }
    if (!data.licenseExpiry) {
      errors.licenseExpiry = 'License expiry date is required for drivers';
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UserFormSheet({
  open,
  onOpenChange,
  user,
  roles,
  onSuccess,
}: UserFormSheetProps) {
  const isCreate = !user;
  const [form, setForm] = useState<UserFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Reset form when sheet opens or user changes
  useEffect(() => {
    if (open) {
      setErrors({});
      setApiError(null);
      if (user) {
        setForm({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone ?? '',
          type: user.type,
          roleIds: [], // roles will be matched below
          password: '',
          confirmPassword: '',
          licenseNumber: user.licenseNumber ?? '',
          licenseExpiry: user.licenseExpiry ?? '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, user]);

  // Field change helper
  const setField = useCallback(
    <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
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

  // Role toggle
  const toggleRole = useCallback((roleId: string) => {
    setForm((prev) => {
      const exists = prev.roleIds.includes(roleId);
      return {
        ...prev,
        roleIds: exists
          ? prev.roleIds.filter((id) => id !== roleId)
          : [...prev.roleIds, roleId],
      };
    });
  }, []);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validate(form, isCreate);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      if (isCreate) {
        const payload: CreateUserRequest = {
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          type: form.type as CreateUserRequest['type'],
          roleIds: form.roleIds,
          password: form.password,
        };

        if (form.type === 'DRIVER') {
          payload.licenseNumber = form.licenseNumber.trim();
          payload.licenseExpiry = form.licenseExpiry;
        }

        await usersService.createUser(payload);
      } else {
        const payload: UpdateUserRequest = {
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          type: form.type as UpdateUserRequest['type'],
          roleIds: form.roleIds,
        };

        if (form.type === 'DRIVER') {
          payload.licenseNumber = form.licenseNumber.trim();
          payload.licenseExpiry = form.licenseExpiry;
        }

        await usersService.updateUser(user.id, payload);
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
      <SheetContent side="right" size="lg" className="flex flex-col overflow-y-auto">
        <SheetHeader className="shrink-0">
          <SheetTitle>{isCreate ? 'Add New User' : 'Edit User'}</SheetTitle>
          <SheetDescription>
            {isCreate
              ? 'Fill in the details below to create a new user account.'
              : `Update details for ${user?.firstName} ${user?.lastName}.`}
          </SheetDescription>
        </SheetHeader>

        {/* API-level error banner */}
        {apiError && (
          <div className="mx-0 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <form
          id="user-form"
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-6 py-6"
        >
          {/* ── Basic info ──────────────────────────────────────── */}
          <FormSection title="Basic Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="First Name"
                required
                value={form.firstName}
                onChange={(e) => setField('firstName', e.target.value)}
                error={errors.firstName}
                placeholder="John"
              />
              <FormInput
                label="Last Name"
                required
                value={form.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
                error={errors.lastName}
                placeholder="Doe"
              />
            </div>

            <FormInput
              label="Email"
              required
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              error={errors.email}
              placeholder="john@example.com"
            />

            <FormInput
              label="Phone"
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              error={errors.phone}
              placeholder="+254 712 345 678"
            />

            <FormSelect
              label="User Type"
              required
              options={TYPE_OPTIONS}
              value={form.type}
              onChange={(e) => setField('type', e.target.value as UserType)}
              placeholder="Select type…"
            />
          </FormSection>

          {/* ── Password (create only) ──────────────────────────── */}
          {isCreate && (
            <FormSection title="Password">
              <FormInput
                label="Password"
                required
                type="password"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                error={errors.password}
                placeholder="Minimum 8 characters"
              />
              <FormInput
                label="Confirm Password"
                required
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                placeholder="Re-enter password"
              />
            </FormSection>
          )}

          {/* ── Driver-specific fields ──────────────────────────── */}
          {form.type === 'DRIVER' && (
            <FormSection
              title="Driver Details"
              description="Additional information required for driver accounts."
            >
              <FormInput
                label="License Number"
                required
                value={form.licenseNumber}
                onChange={(e) => setField('licenseNumber', e.target.value)}
                error={errors.licenseNumber}
                placeholder="e.g. DL-12345"
              />
              <FormDateInput
                label="License Expiry Date"
                required
                value={form.licenseExpiry}
                onChange={(e) => setField('licenseExpiry', e.target.value)}
                error={errors.licenseExpiry}
              />
            </FormSection>
          )}

          {/* ── Role assignment ──────────────────────────────────── */}
          <FormSection
            title="Roles"
            description="Assign one or more roles to this user."
          >
            {roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No roles available. Create roles first.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {roles.map((role) => {
                  const isChecked = form.roleIds.includes(role.id);
                  return (
                    <label
                      key={role.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                        isChecked
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
                        checked={isChecked}
                        onChange={() => toggleRole(role.id)}
                      />
                      <span className="font-medium">{role.name}</span>
                    </label>
                  );
                })}
              </div>
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
          <Button type="submit" form="user-form" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCreate ? 'Create User' : 'Save Changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
