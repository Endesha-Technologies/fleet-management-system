// ---------------------------------------------------------------------------
// Assets domain types
// ---------------------------------------------------------------------------
// Derived from assets_response.json.
// Covers: CRUD, suppliers, purchases, install/remove, transactions,
//         stock summary, disposal, low-stock alerts, tool checkout/return.
// ---------------------------------------------------------------------------

import type { ApiResponse, PaginatedData } from '../types';
import type { UserRef } from '../trucks/trucks.types';

// ---- Enums / union types --------------------------------------------------

export type AssetType = 'TYRE' | 'SPARE_PART' | 'CONSUMABLE' | 'TOOL_EQUIPMENT';

export type AssetCategory =
  | 'TYRES'
  | 'ENGINE'
  | 'FLUIDS'
  | 'BRAKES'
  | 'ELECTRICAL'
  | 'BODY'
  | 'TRANSMISSION'
  | 'SUSPENSION'
  | string; // API may return values not listed above

export type AssetStatus =
  | 'IN_INVENTORY'
  | 'INSTALLED'
  | 'IN_USE'
  | 'AVAILABLE'
  | 'DISPOSED'
  | 'SOLD';

export type SparePartCondition = 'NEW' | 'USED' | 'REFURBISHED';

export type ToolCondition = 'GOOD' | 'FAIR' | 'POOR' | 'NEEDS_REPAIR';

export type MovementType =
  | 'INITIAL'
  | 'TYRE_MOUNT'
  | 'TYRE_DISMOUNT'
  | 'INSTALL'
  | 'REMOVAL'
  | 'PURCHASE'
  | 'DISPOSAL'
  | 'ADJUSTMENT';

export type MovementDirection = 'IN' | 'OUT';

export type TransactionAction =
  | 'CREATE'
  | 'INSTALL'
  | 'REMOVE'
  | 'PURCHASE'
  | 'DISPOSE'
  | 'ADJUST';

export type PurchaseOrderStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

export type DisposalType = 'RESALE' | 'SCRAP' | 'WRITE_OFF' | 'DONATION';

export type LowStockSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type LowStockAlertType =
  | 'NO_SPARE_AVAILABLE'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'BELOW_MINIMUM';

// ---- Core asset entity ----------------------------------------------------

/** Full asset model returned by list and detail endpoints. */
export interface Asset {
  id: string;
  assetType: AssetType;
  category: AssetCategory;
  serialNumber: string | null;
  name: string;
  partNumber: string | null;
  description: string | null;
  status: AssetStatus;
  quantity: number;
  minimumStock: number;
  unitOfMeasure: string | null;
  unitCost: number | null;
  purchaseDate: string | null;
  warrantyExpiry: string | null;
  supplierId: string | null;

  // Tyre-specific
  tyreType: string | null;
  tyreBrand: string | null;
  tyreModel: string | null;
  tyreSize: string | null;
  tyreLoadIndex: string | null;
  tyreSpeedRating: string | null;
  tyreDotCode: string | null;
  tyreTreadDepth: number | null;
  tyreMaxMileage: number | null;
  tyreTotalMileage: number;

  // Spare-part-specific
  sparePartOem: string | null;
  sparePartFitsModels: string | null;
  sparePartLifeKm: number | null;
  sparePartCondition: SparePartCondition | null;

  // Consumable-specific
  consumableGrade: string | null;
  consumableVolume: string | null;
  consumableExpiryDate: string | null;

  // Tool-specific
  toolCalibrationDate: string | null;
  toolCalibrationDueDate: string | null;
  toolCondition: ToolCondition | null;
  toolCheckedOutTo: string | null;
  toolCheckoutDate: string | null;

  // Common
  storageLocation: string | null;
  customFields: Record<string, unknown> | null;
  notes: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetCounts {
  stockMovements: number;
  installations: number;
  purchaseItems: number;
  disposals: number;
  tyreInspections?: number;
}

/** Asset as it appears in the paginated list (includes relations + counts). */
export interface AssetListItem extends Asset {
  supplier: Supplier | null;
  creator: UserRef;
  updater: UserRef;
  _count: AssetCounts;
  totalStockIn: number;
  totalStockOut: number;
}

// ---- Asset detail ---------------------------------------------------------

export interface AssetTransaction {
  id: string;
  assetId: string;
  action: TransactionAction;
  fromLocation: string | null;
  toLocation: string | null;
  quantity: number;
  performedBy: string;
  odometerReading: number | null;
  notes: string | null;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  assetId: string;
  movementType: MovementType;
  direction: MovementDirection;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  performedBy: string;
  notes: string | null;
  createdAt: string;
}

/** Asset detail includes additional nested arrays not present in list. */
export interface AssetDetail extends AssetListItem {
  installations: AssetInstallation[];
  purchaseItems: PurchaseItem[];
  disposals: AssetDisposal[];
  transactions: AssetTransaction[];
  stockMovements: StockMovement[];
  tyreInspections: unknown[];
}

// ---- List summary ---------------------------------------------------------

export interface AssetTypeSummary {
  _count: number;
  assetType: AssetType;
}

export interface AssetCategorySummary {
  _count: number;
  category: AssetCategory;
}

export interface AssetStatusSummary {
  _count: number;
  status: AssetStatus;
}

export interface AssetListSummary {
  byType: AssetTypeSummary[];
  byCategory: AssetCategorySummary[];
  byStatus: AssetStatusSummary[];
  lowStockCount: number;
  totalEstimatedValue: number;
}

/** Paginated asset list payload with additional summary. */
export interface AssetListData extends PaginatedData<AssetListItem> {
  summary: AssetListSummary;
}

// ---- Create / Update requests ---------------------------------------------

export interface CreateAssetRequest {
  assetType: AssetType;
  category: AssetCategory;
  name: string;
  serialNumber?: string;
  partNumber?: string;
  description?: string;
  quantity?: number;
  minimumStock?: number;
  unitOfMeasure?: string;
  unitCost?: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  supplierId?: string;
  storageLocation?: string;
  notes?: string;

  // Tyre-specific
  tyreType?: string;
  tyreBrand?: string;
  tyreModel?: string;
  tyreSize?: string;
  tyreLoadIndex?: string;
  tyreSpeedRating?: string;
  tyreDotCode?: string;
  tyreTreadDepth?: number;
  tyreMaxMileage?: number;

  // Spare-part-specific
  sparePartOem?: string;
  sparePartFitsModels?: string;
  sparePartLifeKm?: number;
  sparePartCondition?: SparePartCondition;

  // Consumable-specific
  consumableGrade?: string;
  consumableVolume?: string;
  consumableExpiryDate?: string;

  // Tool-specific
  toolCalibrationDate?: string;
  toolCalibrationDueDate?: string;
  toolCondition?: ToolCondition;
}

export type UpdateAssetRequest = Partial<CreateAssetRequest>;

// ---- Suppliers ------------------------------------------------------------

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierListItem extends Supplier {
  _count: {
    purchaseOrders: number;
    assets: number;
  };
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

// ---- Purchases ------------------------------------------------------------

export interface PurchaseItemInput {
  assetId: string;
  quantity: number;
  unitCost: number;
  storageLocation?: string;
  notes?: string;
}

export interface CreatePurchaseRequest {
  supplierId: string;
  invoiceNumber?: string;
  purchaseDate?: string;
  storageLocation?: string;
  notes?: string;
  items: PurchaseItemInput[];
}

/** Asset ref nested inside a purchase item. */
export interface PurchaseItemAssetRef {
  id: string;
  name: string;
  assetType: AssetType;
}

export interface PurchaseItem {
  id: string;
  purchaseOrderId: string;
  assetId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  storageLocation: string | null;
  notes: string | null;
  createdAt: string;
  asset?: Asset | PurchaseItemAssetRef;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  invoiceNumber: string | null;
  purchaseDate: string | null;
  status: PurchaseOrderStatus;
  totalCost: number;
  storageLocation: string | null;
  notes: string | null;
  createdBy: string;
  receivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: PurchaseItem[];
  supplier: Supplier;
}

export interface PurchaseOrderListItem extends PurchaseOrder {
  _count: {
    items: number;
  };
}

// ---- Install / Remove -----------------------------------------------------

export interface InstallAssetRequest {
  assetId: string;
  truckId: string;
  quantity?: number;
  position?: string;
  odometerAtInstall?: number;
  notes?: string;
}

export interface AssetInstallation {
  id: string;
  assetId: string;
  truckId: string;
  quantity: number;
  installedAt: string;
  removedAt: string | null;
  odometerAtInstall: number | null;
  odometerAtRemoval: number | null;
  axle: string | null;
  position: string | null;
  treadDepthAtInstall: number | null;
  treadDepthAtRemoval: number | null;
  mileageAccrued: number;
  removalReason: string | null;
  notes: string | null;
}

export interface RemoveAssetRequest {
  odometerAtRemoval?: number;
  removalReason?: string;
  storageLocation?: string;
  notes?: string;
}

// ---- Stock summary --------------------------------------------------------

export interface StockMovementSummary {
  _sum: { quantity: number };
  _count: number;
  movementType: MovementType;
  direction: MovementDirection;
}

export interface ActiveInstallation {
  installationId: string;
  truckId: string;
  registrationNumber: string;
  quantity: number;
  installedAt: string;
}

export interface TruckHistory {
  truckId: string;
  registrationNumber: string;
  activeInstallations: number;
  totalInstallations: number;
  totalRemovals: number;
}

export interface AssetStockSummary {
  assetId: string;
  assetName: string;
  assetType: AssetType;
  status: AssetStatus;
  currentStock: number;
  currentlyInstalled: number;
  expectedStock: number;
  stockConsistent: boolean;
  totalPurchased: number;
  totalDisposed: number;
  netAdjustments: number;
  totalTimesInstalled: number;
  totalTimesReturned: number;
  totalStockIn: number;
  totalStockOut: number;
  movementsByType: StockMovementSummary[];
  activeInstallations: ActiveInstallation[];
  truckHistory: TruckHistory[];
}

// ---- Disposal -------------------------------------------------------------

export interface DisposeAssetRequest {
  disposalType: DisposalType;
  quantity?: number;
  salePrice?: number;
  buyerInfo?: string;
  reason?: string;
  notes?: string;
}

export interface AssetDisposal {
  id: string;
  assetId: string;
  disposalType: DisposalType;
  quantity: number;
  salePrice: number | null;
  buyerInfo: string | null;
  reason: string | null;
  disposalDate: string;
  notes: string | null;
  createdAt: string;
}

// ---- Low stock alerts -----------------------------------------------------

export interface LowStockAssetRef {
  id: string;
  name: string;
  serialNumber: string | null;
  assetType: AssetType;
  category: AssetCategory;
  currentStock: number;
  minimumStock: number;
  status: AssetStatus;
  supplier: Supplier | null;
}

export interface LowStockTruckRef {
  truckId: string;
  registrationNumber: string;
}

export interface LowStockAlert {
  severity: LowStockSeverity;
  alertType: LowStockAlertType;
  message: string;
  recommendation: string;
  asset: LowStockAssetRef;
  installedOn: LowStockTruckRef[];
  createdAt: string;
}

export interface LowStockByAssetType {
  assetType: AssetType;
  count: number;
}

export interface LowStockSummaryData {
  totalAlerts: number;
  critical: number;
  warning: number;
  info: number;
  byAssetType: LowStockByAssetType[];
}

export interface LowStockAlertsData {
  summary: LowStockSummaryData;
  alerts: LowStockAlert[];
}

// ---- Tool checkout / return -----------------------------------------------

export interface CheckoutToolRequest {
  assetId: string;
  notes?: string;
}

export interface ReturnToolRequest {
  assetId: string;
  condition?: ToolCondition;
  notes?: string;
}

// ---- Response aliases -----------------------------------------------------

export type AssetListResponse = ApiResponse<AssetListData>;
export type AssetDetailResponse = ApiResponse<AssetDetail>;
export type CreateAssetResponse = ApiResponse<Asset>;
export type UpdateAssetResponse = ApiResponse<Asset>;
export type SupplierListResponse = ApiResponse<SupplierListItem[]>;
export type CreateSupplierResponse = ApiResponse<Supplier>;
export type PurchaseListResponse = ApiResponse<PaginatedData<PurchaseOrderListItem>>;
export type CreatePurchaseResponse = ApiResponse<PurchaseOrder>;
export type InstallAssetResponse = ApiResponse<AssetInstallation>;
export type RemoveAssetResponse = ApiResponse<AssetInstallation>;
export type TransactionListResponse = ApiResponse<PaginatedData<AssetTransaction>>;
export type StockSummaryResponse = ApiResponse<AssetStockSummary>;
export type DisposeAssetResponse = ApiResponse<AssetDisposal>;
export type LowStockAlertsResponse = ApiResponse<LowStockAlertsData>;
export type CheckoutToolResponse = ApiResponse<Asset>;
export type ReturnToolResponse = ApiResponse<Asset>;
