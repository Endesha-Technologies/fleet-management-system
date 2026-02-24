'use client';

// ---------------------------------------------------------------------------
// DataTable — Reusable table component
// ---------------------------------------------------------------------------
// A single, consistent table component used across the entire application.
//
// Features:
//   • Type-safe column definitions with accessor keys or functions
//   • Built-in search with client-side filtering
//   • Sortable columns with ascending/descending toggle
//   • Pagination with configurable page sizes
//   • Loading skeleton state
//   • Customizable empty state
//   • Toolbar slot for custom filters and actions
//   • Mobile card view via render prop
//   • Row click handler
//
// Usage:
//
//   <DataTable
//     columns={columns}
//     data={users}
//     getRowId={(row) => row.id}
//     searchPlaceholder="Search users..."
//     emptyState={{ icon: Users, title: 'No users found' }}
//     toolbar={<FilterPills />}
//   />
// ---------------------------------------------------------------------------

import { useState, useMemo, useCallback } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type {
  DataTableProps,
  ColumnDef,
  SortState,
  SortDirection,
} from './data-table.types';

// ---------------------------------------------------------------------------
// Cell value resolver
// ---------------------------------------------------------------------------

function getCellValue<TData>(row: TData, column: ColumnDef<TData>): unknown {
  if (column.accessorFn) return column.accessorFn(row);
  if (column.accessorKey) return (row as Record<string, unknown>)[column.accessorKey];
  return undefined;
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

// ---------------------------------------------------------------------------
// Alignment class helper
// ---------------------------------------------------------------------------

function alignClass(align?: 'left' | 'center' | 'right'): string {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    default:
      return 'text-left';
  }
}

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------

function SkeletonRow<TData>({ columns }: { columns: ColumnDef<TData>[] }) {
  return (
    <TableRow>
      {columns.map((col) => (
        <TableCell
          key={col.id}
          className={cn(col.hideOnMobile && 'hidden md:table-cell', col.className)}
        >
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        </TableCell>
      ))}
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  // Search
  searchable = true,
  searchPlaceholder = 'Search…',
  searchValue: controlledSearch,
  onSearchChange,
  // Sort
  sort: controlledSort,
  onSortChange,
  // Pagination
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  // Loading & empty
  isLoading = false,
  skeletonRowCount = 5,
  minRows = 0,
  emptyState,
  // Toolbar
  toolbar,
  toolbarExtra,
  // Mobile
  mobileCard,
  // Row
  onRowClick,
  className,
}: DataTableProps<TData>) {
  // ---- Internal state (uncontrolled mode) -----------------------------------
  const [internalSearch, setInternalSearch] = useState('');
  const [internalSort, setInternalSort] = useState<SortState | null>(null);
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(
    pageSizeOptions[0] ?? 10,
  );

  // Resolve controlled vs uncontrolled
  const searchQuery = controlledSearch ?? internalSearch;
  const setSearchQuery = onSearchChange ?? setInternalSearch;

  const sortState = controlledSort !== undefined ? controlledSort : internalSort;
  const setSortState = onSortChange ?? setInternalSort;

  const currentPage = pagination?.page ?? internalPage;
  const pageSize = pagination?.pageSize ?? internalPageSize;
  const setCurrentPage = onPageChange ?? setInternalPage;
  const setPageSize = onPageSizeChange ?? setInternalPageSize;

  // ---- Searchable columns ---------------------------------------------------
  const searchableColumns = useMemo(
    () => columns.filter((col) => col.searchable !== false),
    [columns],
  );

  // ---- Filtered data (client-side search) -----------------------------------
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();

    return data.filter((row) =>
      searchableColumns.some((col) => {
        const value = getCellValue(row, col);
        return cellToString(value).toLowerCase().includes(q);
      }),
    );
  }, [data, searchQuery, searchableColumns]);

  // ---- Sorted data ----------------------------------------------------------
  const sortedData = useMemo(() => {
    if (!sortState) return filteredData;

    const col = columns.find((c) => c.id === sortState.columnId);
    if (!col) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = getCellValue(a, col);
      const bVal = getCellValue(b, col);

      const aStr = cellToString(aVal);
      const bStr = cellToString(bVal);

      // Try numeric comparison
      const aNum = Number(aStr);
      const bNum = Number(bStr);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortState.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // Fallback to string comparison
      const cmp = aStr.localeCompare(bStr);
      return sortState.direction === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [filteredData, sortState, columns]);

  // ---- Paginated data -------------------------------------------------------
  const hasPagination = pagination !== undefined || data.length > pageSize;
  const totalRows = pagination?.total ?? sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  const paginatedData = useMemo(() => {
    // If server-side pagination is used (pagination.total is set), data is
    // already the correct page slice from the API.
    if (pagination?.total !== undefined) return sortedData;

    // Client-side pagination
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination?.total]);

  // ---- Handlers -------------------------------------------------------------

  const handleSort = useCallback(
    (columnId: string) => {
      if (!sortState || sortState.columnId !== columnId) {
        setSortState({ columnId, direction: 'asc' });
      } else if (sortState.direction === 'asc') {
        setSortState({ columnId, direction: 'desc' });
      } else {
        setSortState(null);
      }
      // Reset to first page on sort change
      setCurrentPage(1);
    },
    [sortState, setSortState, setCurrentPage],
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setPageSize(newSize);
      setCurrentPage(1);
    },
    [setPageSize, setCurrentPage],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
    },
    [setSearchQuery, setCurrentPage],
  );

  // ---- Sort icon helper -----------------------------------------------------

  function SortIcon({ columnId }: { columnId: string }) {
    if (!sortState || sortState.columnId !== columnId) {
      return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-gray-400" />;
    }
    return sortState.direction === 'asc' ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-gray-700" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-gray-700" />
    );
  }

  // ---- Empty state config ---------------------------------------------------

  const EmptyIcon = emptyState?.icon ?? Inbox;
  const emptyTitle = emptyState?.title ?? 'No data found';
  const emptyDescription =
    emptyState?.description ??
    (searchQuery
      ? 'Try adjusting your search or filter criteria.'
      : 'There are no records to display.');

  // ---- Column count (for colSpan) -------------------------------------------
  const colCount = columns.length;

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className={cn('space-y-4', className)}>
      {/* ── Toolbar row ──────────────────────────────────────────── */}
      {(searchable || toolbar) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          {searchable && (
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {/* Custom toolbar content (filters, buttons, etc.) */}
          {toolbar && (
            <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
          )}
        </div>
      )}

      {/* ── Extra toolbar content ────────────────────────────────── */}
      {toolbarExtra}

      {/* ── Mobile card view ─────────────────────────────────────── */}
      {mobileCard && (
        <div className="space-y-3 md:hidden">
          {isLoading && (
            <>
              {Array.from({ length: skeletonRowCount }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="mb-3 h-4 w-2/3 rounded bg-gray-200" />
                  <div className="mb-2 h-3 w-1/2 rounded bg-gray-200" />
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                </div>
              ))}
            </>
          )}

          {!isLoading && paginatedData.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 text-center">
              <EmptyIcon className="h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-900">
                {emptyTitle}
              </p>
              <p className="mt-1 text-xs text-gray-500">{emptyDescription}</p>
              {emptyState?.action && (
                <div className="mt-4">{emptyState.action}</div>
              )}
            </div>
          )}

          {!isLoading &&
            paginatedData.map((row) => (
              <div key={getRowId(row)}>{mobileCard(row)}</div>
            ))}
        </div>
      )}

      {/* ── Desktop table ────────────────────────────────────────── */}
      <div
        className={cn(
          'rounded-lg border border-gray-200 bg-white',
          mobileCard && 'hidden md:block',
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(
                    alignClass(col.align),
                    col.hideOnMobile && 'hidden md:table-cell',
                    col.className,
                  )}
                  style={{
                    minWidth: col.minWidth,
                    maxWidth: col.maxWidth,
                  }}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-0.5 hover:text-gray-700"
                      onClick={() => handleSort(col.id)}
                    >
                      {col.header}
                      <SortIcon columnId={col.id} />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Loading skeleton */}
            {isLoading &&
              Array.from({ length: skeletonRowCount }).map((_, i) => (
                <SkeletonRow key={i} columns={columns} />
              ))}

            {/* Empty state */}
            {!isLoading && paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={colCount}>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <EmptyIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-gray-900">
                      {emptyTitle}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {emptyDescription}
                    </p>
                    {emptyState?.action && (
                      <div className="mt-4">{emptyState.action}</div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!isLoading &&
              paginatedData.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => {
                    const value = getCellValue(row, col);
                    return (
                      <TableCell
                        key={col.id}
                        className={cn(
                          alignClass(col.align),
                          col.hideOnMobile && 'hidden md:table-cell',
                          col.className,
                        )}
                        style={{
                          minWidth: col.minWidth,
                          maxWidth: col.maxWidth,
                        }}
                      >
                        {col.cell
                          ? col.cell(row, value)
                          : cellToString(value)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

            {/* Filler rows — pad the table when there are fewer rows than minRows */}
            {!isLoading &&
              paginatedData.length > 0 &&
              paginatedData.length < minRows &&
              Array.from({ length: minRows - paginatedData.length }).map((_, i) => (
                <TableRow key={`filler-${i}`} className="pointer-events-none">
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      className={cn(
                        col.hideOnMobile && 'hidden md:table-cell',
                        col.className,
                      )}
                    >
                      &nbsp;
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ───────────────────────────────────────────── */}
      {hasPagination && !isLoading && paginatedData.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          {/* Row count */}
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium">
              {Math.min((currentPage - 1) * pageSize + 1, totalRows)}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, totalRows)}
            </span>{' '}
            of <span className="font-medium">{totalRows}</span> results
          </p>

          <div className="flex items-center gap-4">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows:</span>
              <select
                className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="px-2 text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
