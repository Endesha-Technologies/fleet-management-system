// ---------------------------------------------------------------------------
// DataTable types
// ---------------------------------------------------------------------------
// Generic type definitions for the reusable DataTable component.
// These types are designed to be flexible enough for any table in the app
// while providing full TypeScript safety.
// ---------------------------------------------------------------------------

import type { ReactNode, ComponentType, SVGProps } from 'react';

// ---------------------------------------------------------------------------
// Column definition
// ---------------------------------------------------------------------------

/** How a column's content should be aligned. */
export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * Defines a single column in the DataTable.
 *
 * @typeParam TData - The row data type.
 *
 * @example
 * ```ts
 * const columns: ColumnDef<User>[] = [
 *   {
 *     id: 'name',
 *     header: 'Full Name',
 *     accessorFn: (row) => `${row.firstName} ${row.lastName}`,
 *     sortable: true,
 *   },
 *   {
 *     id: 'email',
 *     header: 'Email',
 *     accessorKey: 'email',
 *   },
 *   {
 *     id: 'actions',
 *     header: 'Actions',
 *     align: 'right',
 *     cell: (row) => <ActionButtons user={row} />,
 *   },
 * ];
 * ```
 */
export interface ColumnDef<TData> {
  /** Unique identifier for the column. */
  id: string;

  /** Column header text or ReactNode. */
  header: ReactNode;

  /**
   * Key on the data object to access the cell value.
   * Mutually exclusive with `accessorFn`.
   */
  accessorKey?: keyof TData & string;

  /**
   * Function to derive the cell value from the row data.
   * Mutually exclusive with `accessorKey`.
   */
  accessorFn?: (row: TData) => unknown;

  /**
   * Custom cell renderer. Receives the row data and the resolved cell value.
   * If not provided, the cell value is rendered as-is (toString).
   */
  cell?: (row: TData, value: unknown) => ReactNode;

  /** Column alignment. Default: `'left'`. */
  align?: ColumnAlign;

  /** Whether this column is sortable. Default: `false`. */
  sortable?: boolean;

  /** Whether this column should be included in client-side search. Default: `true`. */
  searchable?: boolean;

  /** Column min-width CSS value. */
  minWidth?: string;

  /** Column max-width CSS value. */
  maxWidth?: string;

  /** Additional className for the `<th>` and `<td>` elements. */
  className?: string;

  /** Whether to hide this column on mobile viewports. Default: `false`. */
  hideOnMobile?: boolean;
}

// ---------------------------------------------------------------------------
// Sort state
// ---------------------------------------------------------------------------

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  /** Column `id` currently being sorted. */
  columnId: string;
  /** Sort direction. */
  direction: SortDirection;
}

// ---------------------------------------------------------------------------
// Pagination state
// ---------------------------------------------------------------------------

export interface PaginationState {
  /** Current page (1-based). */
  page: number;
  /** Rows per page. */
  pageSize: number;
  /** Total number of rows (for server-side pagination). */
  total?: number;
}

// ---------------------------------------------------------------------------
// Empty state config
// ---------------------------------------------------------------------------

export interface EmptyStateConfig {
  /** Icon component to display (e.g. a Lucide icon). */
  icon?: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
  /** Title text. */
  title?: string;
  /** Description text. */
  description?: string;
  /** Optional action button. */
  action?: ReactNode;
}

// ---------------------------------------------------------------------------
// DataTable props
// ---------------------------------------------------------------------------

export interface DataTableProps<TData> {
  /** Column definitions. */
  columns: ColumnDef<TData>[];

  /** Row data to display. */
  data: TData[];

  /** Unique key extractor for each row. */
  getRowId: (row: TData) => string;

  // ---- Search ---------------------------------------------------------------

  /** Whether to show the built-in search input. Default: `true`. */
  searchable?: boolean;

  /** Placeholder text for the search input. */
  searchPlaceholder?: string;

  /**
   * Controlled search value. When provided, the component is controlled.
   * When omitted, the component manages its own search state internally.
   */
  searchValue?: string;

  /** Callback when the search value changes (controlled mode). */
  onSearchChange?: (value: string) => void;

  // ---- Sorting --------------------------------------------------------------

  /** Current sort state (controlled). */
  sort?: SortState | null;

  /** Callback when sort changes (controlled). */
  onSortChange?: (sort: SortState | null) => void;

  // ---- Pagination -----------------------------------------------------------

  /** Pagination state (controlled). Omit to disable pagination. */
  pagination?: PaginationState;

  /** Callback when page changes. */
  onPageChange?: (page: number) => void;

  /** Callback when page size changes. */
  onPageSizeChange?: (pageSize: number) => void;

  /** Available page size options. Default: `[10, 20, 50]`. */
  pageSizeOptions?: number[];

  // ---- Loading & empty states -----------------------------------------------

  /** Whether the table is in a loading state. */
  isLoading?: boolean;

  /** Number of skeleton rows to show when loading. Default: `5`. */
  skeletonRowCount?: number;

  /** Configuration for the empty state. */
  emptyState?: EmptyStateConfig;

  // ---- Toolbar & extras -----------------------------------------------------

  /**
   * Additional toolbar content rendered between the search input and the table.
   * Use this for custom filters, action buttons, etc.
   */
  toolbar?: ReactNode;

  /**
   * Content rendered below the toolbar row, above the table.
   */
  toolbarExtra?: ReactNode;

  // ---- Mobile card view -----------------------------------------------------

  /**
   * When provided, renders a card view on mobile instead of the table.
   * Each card is rendered by this function.
   */
  mobileCard?: (row: TData) => ReactNode;

  // ---- Row interactions -----------------------------------------------------

  /** Called when a row is clicked. */
  onRowClick?: (row: TData) => void;

  /** Additional className for the root wrapper. */
  className?: string;
}
