'use client';

import { Search, Lock, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
// Loading skeleton
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

export function RoleTable({
  roles,
  isLoading,
  onEdit,
  onDelete,
  searchQuery,
  onSearchChange,
}: RoleTableProps) {
  // Filter roles by search query
  const filtered = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Users</TableHead>
              <TableHead className="text-center">Permissions</TableHead>
              <TableHead className="text-center">System</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Loading state */}
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}

            {/* Empty state */}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheck className="h-10 w-10 text-gray-300" />
                    <p className="text-sm font-medium">No roles found</p>
                    <p className="text-xs">
                      {searchQuery
                        ? 'Try adjusting your search query.'
                        : 'Get started by adding a new role.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!isLoading &&
              filtered.map((role) => (
                <TableRow key={role.id}>
                  {/* Name */}
                  <TableCell className="font-medium">{role.name}</TableCell>

                  {/* Description */}
                  <TableCell className="max-w-[280px] truncate text-muted-foreground">
                    {role.description || '—'}
                  </TableCell>

                  {/* User count badge */}
                  <TableCell className="text-center">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {role.userCount}
                    </Badge>
                  </TableCell>

                  {/* Permission count badge */}
                  <TableCell className="text-center">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      {role.permissionIds.length}
                    </Badge>
                  </TableCell>

                  {/* System role indicator */}
                  <TableCell className="text-center">
                    {role.isSystem ? (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                        <Lock className="mr-1 h-3 w-3" />
                        System
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(role)}
                        title="Edit role"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(role)}
                        disabled={role.isSystem}
                        title={
                          role.isSystem
                            ? 'System roles cannot be deleted'
                            : 'Delete role'
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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
