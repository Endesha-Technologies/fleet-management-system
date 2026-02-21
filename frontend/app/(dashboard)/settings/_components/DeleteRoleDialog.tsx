'use client';

import { useState } from 'react';
import { AlertTriangle, Lock, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { rolesService } from '@/api';
import type { SettingsRole } from '../_types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DeleteRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: SettingsRole | null;
  onSuccess: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DeleteRoleDialog({
  open,
  onOpenChange,
  role,
  onSuccess,
}: DeleteRoleDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!role || role.isSystem) return;
    setDeleting(true);
    setError(null);

    try {
      await rolesService.deleteRole(role.id);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete role';
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  if (!role) return null;

  // System roles: show error state — cannot be deleted
  if (role.isSystem) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Lock className="h-6 w-6 text-purple-600" />
            </div>
            <DialogTitle className="text-center">Cannot Delete System Role</DialogTitle>
            <DialogDescription className="text-center">
              <span className="font-semibold text-foreground">{role.name}</span>{' '}
              is a built-in system role and cannot be deleted. System roles are
              required for the application to function correctly.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center">Delete Role</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete the{' '}
            <span className="font-semibold text-foreground">{role.name}</span>{' '}
            role?
          </DialogDescription>
        </DialogHeader>

        {/* Warning about user impact */}
        {role.userCount > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>{role.userCount}</strong>{' '}
            {role.userCount === 1 ? 'user is' : 'users are'} currently assigned
            to this role. They will lose all permissions granted by this role.
          </div>
        )}

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
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
