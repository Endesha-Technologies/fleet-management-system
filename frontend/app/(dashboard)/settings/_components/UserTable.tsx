'use client';

import { useMemo } from 'react';
import { Search, Pencil, Trash2, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  ADMIN: 'bg-blue-100 text-blue-700 border-blue-200',
  MANAGER: 'bg-green-100 text-green-700 border-green-200',
  DRIVER: 'bg-orange-100 text-orange-700 border-orange-200',
  TURN_BOY: 'bg-yellow-100 text-yellow-700 border-yellow-200',
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
// Skeleton rows for loading state
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </TableCell>
      ))}
    </TableRow>
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
  // Compute counts per type for the filter pills
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: users.length };
    for (const u of users) {
      counts[u.type] = (counts[u.type] ?? 0) + 1;
    }
    return counts;
  }, [users]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = users;

    // Filter by type
    if (selectedType !== 'ALL') {
      list = list.filter((u) => u.type === selectedType);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    return list;
  }, [users, selectedType, searchQuery]);

  return (
    <div className="space-y-4">
      {/* ── Search ───────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* ── Type filter pills ────────────────────────────────────── */}
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
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {opt.label}
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-background text-muted-foreground'
                }`}
              >
                {typeCounts[opt.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Table ────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Loading */}
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}

            {/* Empty state */}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-gray-900">
                      No users found
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchQuery || selectedType !== 'ALL'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Get started by adding a new user.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!isLoading &&
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <TypeBadge type={user.type} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <Badge
                            key={role}
                            variant="secondary"
                            className="text-xs"
                          >
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(user)}
                        aria-label={`Edit ${user.firstName} ${user.lastName}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(user)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        aria-label={`Delete ${user.firstName} ${user.lastName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
