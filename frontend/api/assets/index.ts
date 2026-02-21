export { assetsService } from './assets.service';
export type {
  AssetListParams,
  PurchaseListParams,
  TransactionListParams,
} from './assets.service';

export type {
  // Enums / unions
  AssetType,
  AssetCategory,
  AssetStatus,
  SparePartCondition,
  ToolCondition,
  MovementType,
  MovementDirection,
  TransactionAction,
  PurchaseOrderStatus,
  DisposalType,
  LowStockSeverity,
  LowStockAlertType,

  // Core entities
  Asset,
  AssetCounts,
  AssetListItem,
  AssetDetail,
  AssetTransaction,
  StockMovement,

  // List summary
  AssetTypeSummary,
  AssetCategorySummary,
  AssetStatusSummary,
  AssetListSummary,
  AssetListData,

  // Suppliers
  Supplier,
  SupplierListItem,
  CreateSupplierRequest,

  // Purchases
  PurchaseItemInput,
  CreatePurchaseRequest,
  PurchaseItemAssetRef,
  PurchaseItem,
  PurchaseOrder,
  PurchaseOrderListItem,

  // Install / Remove
  InstallAssetRequest,
  AssetInstallation,
  RemoveAssetRequest,

  // Stock summary
  StockMovementSummary,
  ActiveInstallation,
  TruckHistory,
  AssetStockSummary,

  // Disposal
  DisposeAssetRequest,
  AssetDisposal,

  // Low stock
  LowStockAssetRef,
  LowStockTruckRef,
  LowStockAlert,
  LowStockByAssetType,
  LowStockSummaryData,
  LowStockAlertsData,

  // Tool checkout / return
  CheckoutToolRequest,
  ReturnToolRequest,

  // Request / Response aliases
  CreateAssetRequest,
  UpdateAssetRequest,
  AssetListResponse,
  AssetDetailResponse,
  CreateAssetResponse,
  UpdateAssetResponse,
  SupplierListResponse,
  CreateSupplierResponse,
  PurchaseListResponse,
  CreatePurchaseResponse,
  InstallAssetResponse,
  RemoveAssetResponse,
  TransactionListResponse,
  StockSummaryResponse,
  DisposeAssetResponse,
  LowStockAlertsResponse,
  CheckoutToolResponse,
  ReturnToolResponse,
} from './assets.types';
