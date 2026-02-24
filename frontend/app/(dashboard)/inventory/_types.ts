// Re-export shared inventory types for co-location convenience
export type {
  InventoryItem,
  InventoryTransaction,
  InventoryStatus,
  DisposalMethod,
  PartCondition,
} from '@/types/inventory';

// Re-export asset types used by drawer/tab components
export type {
  Asset,
  StockUnit,
  LowStockAlert,
  AssetCondition,
  AssetAssignment,
  AssetMovement,
} from '@/types/asset';

// ---------- Route-specific types ----------

/** Props for inventory route pages that receive a dynamic [id] param */
export interface InventoryPageProps {
  params: Promise<{ id: string }>;
}

/** Transaction type used in the move-inventory flow */
export type MoveTransactionType = 'sold' | 'disposed' | 'used';

/** Shape of the move-inventory form state */
export interface MoveFormData {
  quantity: string;
  saleAmount: string;
  buyer: string;
  disposalMethod: string;
  disposalReason: string;
  vehicleId: string;
  maintenanceId: string;
  performedBy: string;
  notes: string;
  transactionDate: string;
}

/** Shape of the add-inventory form state */
export interface AddFormData {
  partName: string;
  partNumber: string;
  category: string;
  condition: string;
  quantity: string;
  unitPrice: string;
  removedFromVehicle: string;
  removalDate: string;
  removalReason: string;
  storageLocation: string;
  addedBy: string;
  notes: string;
}

/** Shape of the disposal form state */
export interface DisposalFormData {
  inventoryItemId: string;
  quantity: string;
  disposalMethod: string;
  disposalReason: string;
  disposedTo: string;
  disposalCost: string;
  transactionDate: string;
  performedBy: string;
  approvedBy: string;
  notes: string;
}

/** Shape of the sale form state */
export interface SaleFormData {
  inventoryItemId: string;
  quantity: string;
  saleAmount: string;
  buyer: string;
  buyerContact: string;
  paymentMethod: string;
  invoiceNumber: string;
  transactionDate: string;
  performedBy: string;
  notes: string;
}

/** Props for the InventoryTable component */
export interface InventoryTableProps {
  items: import('@/types/inventory').InventoryItem[];
}

// ---------- Asset drawer / tab types ----------

/** Props for the AddAssetDrawer */
export interface AddAssetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing asset to edit (API type). When set, the drawer is in edit mode. */
  asset?: import('@/api/assets/assets.types').Asset | null;
  /** Called after a successful create or update to refresh the parent list. */
  onSuccess?: () => void;
}

// AssetTableProps is now exported directly from AssetTable.tsx with controlled filter/search props.
// See: app/(dashboard)/inventory/_components/AssetTable.tsx

/** Props for the AssignAssetDrawer */
export interface AssignAssetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill a single asset by ID (from detail page). */
  initialAssetId?: string;
  /** Called after a successful installation to refresh the parent data. */
  onSuccess?: () => void;
}

/** Props for the DisposeAssetDrawer */
export interface DisposeAssetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill a single asset by ID (from detail page). */
  initialAssetId?: string;
  /** Called after a successful disposal to refresh the parent list. */
  onSuccess?: () => void;
}

/** Props for the LowStockBanner component */
export interface LowStockBannerProps {
  alerts: import('@/types/asset').LowStockAlert[];
}

/** Minimal asset info for pre-filling purchase line items. */
export interface PurchaseAssetInfo {
  id: string;
  name: string;
  assetType: import('@/api/assets/assets.types').AssetType;
}

/** Props for the PurchaseStockDrawer */
export interface PurchaseStockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill a single asset by ID (fetched from API). */
  initialAssetId?: string;
  /** Pre-fill multiple assets directly (e.g. after bulk creation). */
  initialAssets?: PurchaseAssetInfo[];
  /** Called after a successful purchase to refresh the parent list. */
  onSuccess?: () => void;
}

/** Line item in a purchase transaction */
export interface PurchaseLineItem {
  id: string;
  assetId: string;
  assetName: string;
  tracking: string;
  condition: string;
  quantity: number;
  unitCost: number;
  serialNumbers: string;
  total: number;
}

/** Props for the RemoveAssetDrawer */
export interface RemoveAssetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill a single asset by ID (from detail page). */
  initialAssetId?: string;
  /** Called after a successful removal to refresh the parent data. */
  onSuccess?: () => void;
}

/** Props for the SellAssetDrawer */
export interface SellAssetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill a single asset by ID (fetched from API). */
  initialAssetId?: string;
  /** Called after a successful sale to refresh the parent list. */
  onSuccess?: () => void;
}

// ---------- Tab component props ----------

/** Props for AssignmentsTab */
export interface AssignmentsTabProps {
  assignments: import('@/types/asset').AssetAssignment[];
}

/** Props for MovementsTab */
export interface MovementsTabProps {
  /** Asset ID — used to fetch transaction history from the API. */
  assetId: string;
  /** Aggregated movement summaries from stock summary API (optional). */
  movementSummary?: import('@/api/assets/assets.types').StockMovementSummary[];
}

/** Props for OverviewTab */
export interface OverviewTabProps {
  asset: import('@/types/asset').Asset;
  /** Number of disposed units — sourced from stock summary API. */
  disposedCount?: number;
}

/** Props for StockUnitsTab */
export interface StockUnitsTabProps {
  asset: import('@/types/asset').Asset;
  stockUnits: import('@/types/asset').StockUnit[];
}
