'use client';

// ---------------------------------------------------------------------------
// SupplierTable — DataTable wrapper for the Suppliers list
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { Pencil, Package, ShoppingCart, MoreHorizontal, Power, PowerOff } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SettingsSupplier } from '../_types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SupplierTableProps {
  suppliers: SettingsSupplier[];
  isLoading: boolean;
  onEdit: (supplier: SettingsSupplier) => void;
  onDeactivate: (supplier: SettingsSupplier) => void;
  onActivate: (supplier: SettingsSupplier) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SupplierTable({
  suppliers,
  isLoading,
  onEdit,
  onDeactivate,
  onActivate,
  searchQuery,
  onSearchChange,
}: SupplierTableProps) {
  const columns = useMemo<ColumnDef<SettingsSupplier>[]>(
    () => [
      {
        id: 'name',
        header: 'Supplier Name',
        accessorKey: 'name',
        sortable: true,
        cell: (row) => (
          <div>
            <span className="font-medium text-gray-900">{row.name}</span>
            {row.contactPerson && (
              <span className="block text-xs text-gray-500">{row.contactPerson}</span>
            )}
          </div>
        ),
      },
      {
        id: 'contact',
        header: 'Contact',
        cell: (row) => (
          <div className="text-sm space-y-0.5">
            {row.email && (
              <a
                href={`mailto:${row.email}`}
                className="block text-blue-600 hover:underline truncate max-w-[180px]"
                title={row.email}
              >
                {row.email}
              </a>
            )}
            {row.phone && <span className="block text-gray-600">{row.phone}</span>}
            {!row.email && !row.phone && (
              <span className="text-gray-400 italic">No contact info</span>
            )}
          </div>
        ),
        hideOnMobile: true,
      },
      {
        id: 'assets',
        header: 'Assets',
        align: 'center',
        cell: (row) => (
          <div className="flex items-center justify-center gap-1.5 text-sm text-gray-600">
            <Package className="h-3.5 w-3.5 text-gray-400" />
            {row.assetCount}
          </div>
        ),
      },
      {
        id: 'orders',
        header: 'Orders',
        align: 'center',
        cell: (row) => (
          <div className="flex items-center justify-center gap-1.5 text-sm text-gray-600">
            <ShoppingCart className="h-3.5 w-3.5 text-gray-400" />
            {row.purchaseOrderCount}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        align: 'center',
        cell: (row) =>
          row.isActive ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              Active
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100">
              Inactive
            </Badge>
          ),
      },
      {
        id: 'actions',
        header: '',
        align: 'right',
        searchable: false,
        cell: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {row.isActive ? (
                <DropdownMenuItem
                  className="text-amber-600 focus:text-amber-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeactivate(row);
                  }}
                >
                  <PowerOff className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-emerald-600 focus:text-emerald-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onActivate(row);
                  }}
                >
                  <Power className="mr-2 h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onEdit, onDeactivate, onActivate],
  );

  return (
    <DataTable<SettingsSupplier>
      columns={columns}
      data={suppliers}
      getRowId={(row) => row.id}
      searchable
      searchPlaceholder="Search suppliers…"
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      isLoading={isLoading}
      onRowClick={onEdit}
      emptyState={{
        title: 'No suppliers yet',
        description: 'Add your first supplier to get started with purchasing.',
      }}
    />
  );
}
