// ---------------------------------------------------------------------------
// Legacy helper components
// ---------------------------------------------------------------------------
// These were part of the original data-table.tsx single-file implementation.
// They are kept here for backward compatibility with WorkOrderTable.
// TODO: Remove once WorkOrderTable is migrated to the new DataTable API.
// ---------------------------------------------------------------------------

'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Legacy column definition interface.
 * @deprecated Use `ColumnDef` from `data-table.types` instead.
 */
export interface DataTableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * Inline link for table cells.
 * @deprecated Style links directly in `ColumnDef.cell` renderers instead.
 */
export function DataTableCellLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn('hover:text-blue-600 transition-colors', className)}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  );
}

/**
 * Simple badge for table cells.
 * @deprecated Use the `<Badge>` component from `@/components/ui/badge` instead.
 */
export function DataTableBadge({
  variant = 'default',
  children,
}: {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={cn(
        'inline-flex text-xs px-2 py-1 rounded-full',
        variants[variant],
      )}
    >
      {children}
    </span>
  );
}
