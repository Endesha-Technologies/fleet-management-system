'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usersService, rolesService } from '@/api';
import type { User } from '@/api/users/users.types';
import type { Role } from '@/api/roles/roles.types';
import { SettingsPageHeader } from '../_components/SettingsPageHeader';
import { UserTable } from '../_components/UserTable';
import { UserFormSheet } from '../_components/UserFormSheet';
import { DeleteUserDialog } from '../_components/DeleteUserDialog';
import type { SettingsUser, UserType } from '../_types';

// ---------------------------------------------------------------------------
// API → SettingsUser mapper
// ---------------------------------------------------------------------------

function mapApiUser(u: User): SettingsUser {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone || undefined,
    type: u.type as UserType,
    roles: u.roles.map((r) => r.role.name),
    status: u.status === 'ACTIVE' ? 'active' : 'inactive',
    createdAt: u.createdAt,
    licenseNumber: u.driverProfile?.licenseNumber,
    licenseExpiry: u.driverProfile?.licenseExpiry,
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function UsersPage() {
  // Data state
  const [users, setUsers] = useState<SettingsUser[]>([]);
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<UserType | 'ALL'>('ALL');

  // Sheet / dialog state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SettingsUser | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SettingsUser | null>(null);

  // ── Fetch data ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        usersService.getUsers({ limit: 200 }),
        rolesService.getRoles(),
      ]);

      setUsers(usersResponse.data.map(mapApiUser));
      setRoles(
        (rolesResponse as Role[]).map((r) => ({ id: r.id, name: r.name }))
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load users';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleAddUser = () => {
    setSelectedUser(null);
    setSheetOpen(true);
  };

  const handleEditUser = (user: SettingsUser) => {
    setSelectedUser(user);
    setSheetOpen(true);
  };

  const handleDeleteUser = (user: SettingsUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchData();
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <SettingsPageHeader
        title="Users & Access"
        description="Manage system users, drivers, and turn boys"
        backHref="/settings"
        action={
          <Button onClick={handleAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{' '}
          <button
            type="button"
            onClick={fetchData}
            className="font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <UserTable
        users={users}
        isLoading={isLoading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <UserFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        user={selectedUser}
        roles={roles}
        onSuccess={handleSuccess}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={userToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
