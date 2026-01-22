'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Column Definition
export interface DataTableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

// DataTable Props
export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  emptyState?: {
    icon?: ReactNode;
    message: string;
  };
  mobileCard?: (row: T) => ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  emptyState,
  mobileCard,
  className,
  onRowClick,
}: DataTableProps<T>) {
  const renderCellContent = (column: DataTableColumn<T>, row: T) => {
    if (column.cell) {
      return column.cell(row);
    }
    if (column.accessorKey) {
      return String(row[column.accessorKey]);
    }
    return null;
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mobile Card View */}
      {mobileCard && (
        <div className="md:hidden space-y-4">
          {data.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
              {emptyState?.icon}
              <p className="mt-2">{emptyState?.message || 'No data found'}</p>
            </div>
          ) : (
            data.map((row) => (
              <div
                key={row.id}
                className={cn(
                  'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {mobileCard(row)}
              </div>
            ))
          )}
        </div>
      )}

      {/* Desktop Table View */}
      <div className={cn('bg-white border border-gray-200 rounded-lg overflow-hidden', mobileCard && 'hidden md:block')}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={cn(
                      'px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider',
                      getAlignClass(column.align),
                      column.className
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                    {emptyState?.icon}
                    <p className="mt-2">{emptyState?.message || 'No data found'}</p>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column, index) => (
                      <td
                        key={index}
                        className={cn(
                          'px-4 py-3 text-sm',
                          getAlignClass(column.align),
                          column.className
                        )}
                      >
                        {renderCellContent(column, row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper components for common patterns
export function DataTableCellLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} className={cn('hover:text-blue-600 transition-colors', className)} onClick={(e) => e.stopPropagation()}>
      {children}
    </a>
  );
}

export function DataTableBadge({ 
  variant = 'default', 
  children 
}: { 
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'; 
  children: ReactNode 
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={cn('inline-flex text-xs px-2 py-1 rounded-full', variants[variant])}>
      {children}
    </span>
  );
}
