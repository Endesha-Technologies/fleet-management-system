'use client';

import { useMemo } from 'react';
import { Pencil, Trash2, Users } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SettingsUser, UserType } from '../_types';
import { USER_TYPE_OPTIONS, USER_TYPE_LABELS } from '../_types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface UserTableProps {
  users: SettingsUser[];
  isLoading: boolean;
  onEdit: (user: SettingsUser) => void;
  onDelete: (user: SettingsUser) => void;
  selectedType: UserType | 'ALL';
  onTypeChange: (type: UserType | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// ---------------------------------------------------------------------------
// Badge colour helpers
// ---------------------------------------------------------------------------

const TYPE_BADGE_CLASSES: Record<UserType, string> = {
  SYSTEM: 'bg-purple-100 text-purple-700 border-purple-200',
  DRIVER: 'bg-orange-100 text-orange-700 border-orange-200',
  TURN_BOY: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  MECHANIC: 'bg-blue-100 text-blue-700 border-blue-200',
};

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return status === 'active' ? (
    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
      Active
    </Badge>
  ) : (
    <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
      Inactive
    </Badge>
  );
}

function TypeBadge({ type }: { type: UserType }) {
  return (
    <Badge
      className={`${TYPE_BADGE_CLASSES[type]} hover:${TYPE_BADGE_CLASSES[type].split(' ')[0]}`}
    >
      {USER_TYPE_LABELS[type]}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(
  onEdit: (user: SettingsUser) => void,
  onDelete: (user: SettingsUser) => void,
): ColumnDef<SettingsUser>[] {
  return [
    {
      id: 'name',
      header: 'Name',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-gray-900">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      sortable: true,
      cell: (row) => <span className="text-gray-600">{row.email || '—'}</span>,
    },
    {
      id: 'phone',
      header: 'Phone',
      accessorKey: 'phone',
      sortable: true,
      cell: (row) => (
        <span className="text-gray-600">{row.phone || '—'}</span>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      searchable: false,
      cell: (row) => <TypeBadge type={row.type} />,
    },
    {
      id: 'roles',
      header: 'Roles',
      accessorFn: (row) => row.roles.join(', '),
      searchable: false,
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.length > 0 ? (
            row.roles.map((role) => (
              <Badge key={role} variant="secondary" className="text-xs">
                {role}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      searchable: false,
      cell: (row) => <StatusBadge status={row.status} />,
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
            aria-label={`Edit ${row.firstName} ${row.lastName}`}
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
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            aria-label={`Delete ${row.firstName} ${row.lastName}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Type filter pills toolbar
// ---------------------------------------------------------------------------

function TypeFilterPills({
  users,
  selectedType,
  onTypeChange,
}: {
  users: SettingsUser[];
  selectedType: UserType | 'ALL';
  onTypeChange: (type: UserType | 'ALL') => void;
}) {
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: users.length };
    for (const u of users) {
      counts[u.type] = (counts[u.type] ?? 0) + 1;
    }
    return counts;
  }, [users]);

  return (
    <div className="flex flex-wrap gap-2">
      {USER_TYPE_OPTIONS.map((opt) => {
        const isActive = selectedType === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onTypeChange(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {opt.label}
            <span
              className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                isActive
                  ? 'bg-blue-500/30 text-white'
                  : 'bg-white text-gray-500'
              }`}
            >
              {typeCounts[opt.value] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UserTable({
  users,
  isLoading,
  onEdit,
  onDelete,
  selectedType,
  onTypeChange,
  searchQuery,
  onSearchChange,
}: UserTableProps) {
  const columns = useMemo(() => buildColumns(onEdit, onDelete), [onEdit, onDelete]);

  // Pre-filter by type — DataTable handles search filtering
  const typeFilteredUsers = useMemo(() => {
    if (selectedType === 'ALL') return users;
    return users.filter((u) => u.type === selectedType);
  }, [users, selectedType]);

  return (
    <DataTable
      columns={columns}
      data={typeFilteredUsers}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search users by name or email…"
      toolbarExtra={
        <TypeFilterPills
          users={users}
          selectedType={selectedType}
          onTypeChange={onTypeChange}
        />
      }
      emptyState={{
        icon: Users,
        title: 'No users found',
        description:
          searchQuery || selectedType !== 'ALL'
            ? 'Try adjusting your search or filter criteria.'
            : 'Get started by adding a new user.',
      }}
    />
  );
}
