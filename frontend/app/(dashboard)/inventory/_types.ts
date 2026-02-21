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

/** Asset type discriminator for the Add Asset form */
export type AssetType = 'Tyre' | 'Spare Part' | 'Consumable' | 'Tool';

/** Props for the AddAssetDrawer */
export interface AddAssetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: import('@/types/asset').Asset | null;
}

/** Props for the AssetTable component */
export interface AssetTableProps {
  assets: import('@/types/asset').Asset[];
}

/** Props for the AssignAssetDrawer */
export interface AssignAssetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: import('@/types/asset').Asset;
}

/** Props for the DisposeAssetDrawer */
export interface DisposeAssetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: import('@/types/asset').Asset | null;
  stockUnits?: import('@/types/asset').StockUnit[];
  allAssets?: import('@/types/asset').Asset[];
  allStockUnits?: import('@/types/asset').StockUnit[];
}

/** Line item in a disposal transaction */
export interface DisposeLineItem {
  id: string;
  assetId: string;
  assetName: string;
  tracking: string;
  quantity: number;
  maxQuantity: number;
  selectedSerialIds: Set<string>;
}

/** Props for the LowStockBanner component */
export interface LowStockBannerProps {
  alerts: import('@/types/asset').LowStockAlert[];
}

/** Props for the PurchaseStockDrawer */
export interface PurchaseStockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAssetId?: string;
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
  asset: import('@/types/asset').Asset;
}

/** Props for the SellAssetDrawer */
export interface SellAssetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: import('@/types/asset').Asset | null;
  stockUnits?: import('@/types/asset').StockUnit[];
  allAssets?: import('@/types/asset').Asset[];
  allStockUnits?: import('@/types/asset').StockUnit[];
}

/** Line item in a sale transaction */
export interface SaleLineItem {
  id: string;
  assetId: string;
  assetName: string;
  tracking: string;
  quantity: number;
  maxQuantity: number;
  selectedSerialIds: Set<string>;
  unitPrices: Record<string, number>;
  unitPrice: number;
  total: number;
}

// ---------- Tab component props ----------

/** Props for AssignmentsTab */
export interface AssignmentsTabProps {
  assignments: import('@/types/asset').AssetAssignment[];
}

/** Props for MovementsTab */
export interface MovementsTabProps {
  movements: import('@/types/asset').AssetMovement[];
}

/** Props for OverviewTab */
export interface OverviewTabProps {
  asset: import('@/types/asset').Asset;
}

/** Props for StockUnitsTab */
export interface StockUnitsTabProps {
  asset: import('@/types/asset').Asset;
  stockUnits: import('@/types/asset').StockUnit[];
}
