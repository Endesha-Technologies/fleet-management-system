// ---------------------------------------------------------------------------
// DataTable barrel export
// ---------------------------------------------------------------------------

export { DataTable } from './DataTable';

export type {
  ColumnDef,
  ColumnAlign,
  SortState,
  SortDirection,
  PaginationState,
  EmptyStateConfig,
  DataTableProps,
} from './data-table.types';

// Legacy helpers — kept for backward compat with WorkOrderTable
// TODO: Remove once all tables are migrated to the new DataTable API.
export {
  DataTableCellLink,
  DataTableBadge,
} from './legacy-helpers';
export type { DataTableColumn } from './legacy-helpers';
