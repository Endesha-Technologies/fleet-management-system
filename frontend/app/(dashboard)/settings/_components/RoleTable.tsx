'use client';

import { Lock, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table';
import type { SettingsRole } from '../_types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RoleTableProps {
  roles: SettingsRole[];
  isLoading: boolean;
  onEdit: (role: SettingsRole) => void;
  onDelete: (role: SettingsRole) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoleTable({
  roles,
  isLoading,
  onEdit,
  onDelete,
  searchQuery,
  onSearchChange,
}: RoleTableProps) {
  const columns: ColumnDef<SettingsRole>[] = [
    {
      id: 'name',
      header: 'Role Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      id: 'description',
      header: 'Description',
      accessorKey: 'description',
      maxWidth: '280px',
      cell: (row) => (
        <span className="truncate text-muted-foreground">
          {row.description || '—'}
        </span>
      ),
    },
    {
      id: 'userCount',
      header: 'Users',
      accessorKey: 'userCount',
      align: 'center',
      searchable: false,
      cell: (row) => (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          {row.userCount}
        </Badge>
      ),
    },
    {
      id: 'permissions',
      header: 'Permissions',
      accessorFn: (row) => row.permissionIds.length,
      align: 'center',
      searchable: false,
      cell: (row) => (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          {row.permissionIds.length}
        </Badge>
      ),
    },
    {
      id: 'isSystem',
      header: 'System',
      accessorKey: 'isSystem',
      align: 'center',
      searchable: false,
      cell: (row) =>
        row.isSystem ? (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
            <Lock className="mr-1 h-3 w-3" />
            System
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      searchable: false,
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
            title="Edit role"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row);
            }}
            disabled={row.isSystem}
            title={
              row.isSystem
                ? 'System roles cannot be deleted'
                : 'Delete role'
            }
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={roles}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search roles..."
      emptyState={{
        icon: ShieldCheck,
        title: 'No roles found',
        description: searchQuery
          ? 'Try adjusting your search query.'
          : 'Get started by adding a new role.',
      }}
    />
  );
}
