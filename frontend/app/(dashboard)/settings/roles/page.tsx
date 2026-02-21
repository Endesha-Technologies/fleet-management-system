'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rolesService } from '@/api';
import type { Role, Permission as ApiPermission } from '@/api/roles/roles.types';
import type { SettingsRole, PermissionGroup } from '../_types';
import {
  SettingsPageHeader,
  RoleTable,
  RoleFormSheet,
  DeleteRoleDialog,
} from '../_components';

// ---------------------------------------------------------------------------
// Helpers — map API types to UI view-model types
// ---------------------------------------------------------------------------

function mapRoleToSettingsRole(role: Role): SettingsRole {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissionIds: role.permissions.map((rp) => rp.permissionId),
    userCount: role._count?.users ?? 0,
    isSystem: role.isSystem,
    createdAt: role.createdAt,
  };
}

function groupPermissions(permissions: ApiPermission[]): PermissionGroup[] {
  const groupMap = new Map<string, PermissionGroup>();

  for (const perm of permissions) {
    const existing = groupMap.get(perm.resource);
    const uiPerm = {
      id: perm.id,
      name: `${perm.resource.toLowerCase()}:${perm.action.toLowerCase()}`,
      description: perm.description,
      resource: perm.resource,
      action: perm.action,
    };

    if (existing) {
      existing.permissions.push(uiPerm);
    } else {
      groupMap.set(perm.resource, {
        resource: perm.resource,
        permissions: [uiPerm],
      });
    }
  }

  // Sort groups alphabetically by resource name
  return Array.from(groupMap.values()).sort((a, b) =>
    a.resource.localeCompare(b.resource)
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function RolesPage() {
  // Data state
  const [roles, setRoles] = useState<SettingsRole[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SettingsRole | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<SettingsRole | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const [rolesData, permissionsData] = await Promise.all([
        rolesService.getRoles(),
        rolesService.getPermissions(),
      ]);

      setRoles(rolesData.map(mapRoleToSettingsRole));
      setPermissionGroups(groupPermissions(permissionsData));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load roles data';
      setFetchError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleAddRole = useCallback(() => {
    setSelectedRole(null);
    setSheetOpen(true);
  }, []);

  const handleEditRole = useCallback((role: SettingsRole) => {
    setSelectedRole(role);
    setSheetOpen(true);
  }, []);

  const handleDeleteRole = useCallback((role: SettingsRole) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteSuccess = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <SettingsPageHeader
        title="Roles & Permissions"
        description="Configure roles and manage access control"
        backHref="/settings"
        action={
          <Button onClick={handleAddRole}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        }
      />

      {/* Error state */}
      {fetchError && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Failed to load data</p>
            <p>{fetchError}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="ml-auto shrink-0"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading spinner (full-page initial load) */}
      {isLoading && roles.length === 0 && !fetchError && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading roles…</p>
        </div>
      )}

      {/* Roles table */}
      {(!isLoading || roles.length > 0) && !fetchError && (
        <RoleTable
          roles={roles}
          isLoading={isLoading}
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Role form sheet (create / edit) */}
      <RoleFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        role={selectedRole}
        permissionGroups={permissionGroups}
        onSuccess={handleFormSuccess}
      />

      {/* Delete confirmation dialog */}
      <DeleteRoleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        role={roleToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
