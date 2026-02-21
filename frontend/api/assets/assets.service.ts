// ---------------------------------------------------------------------------
// Assets service
// ---------------------------------------------------------------------------
// Thin, typed wrappers around apiClient for every assets endpoint.
// Each method returns the unwrapped `.data` from the API envelope.
// ---------------------------------------------------------------------------

import { apiClient, type RequestConfig } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { PaginatedData, PaginationParams } from '../types';

/** Helper to safely pass a typed params object to RequestConfig. */
const withParams = (
  params?: Record<string, string | number | boolean | undefined>,
): RequestConfig | undefined => (params ? { params } : undefined);

import type {
  Asset,
  AssetDetail,
  AssetDisposal,
  AssetInstallation,
  AssetListData,
  AssetStockSummary,
  AssetTransaction,
  CheckoutToolRequest,
  CreateAssetRequest,
  CreatePurchaseRequest,
  CreateSupplierRequest,
  DisposeAssetRequest,
  InstallAssetRequest,
  LowStockAlertsData,
  PurchaseOrder,
  PurchaseOrderListItem,
  RemoveAssetRequest,
  ReturnToolRequest,
  Supplier,
  SupplierListItem,
  UpdateAssetRequest,
} from './assets.types';

// ---- Query-param interfaces -----------------------------------------------

export interface AssetListParams extends PaginationParams {
  assetType?: string;
  category?: string;
  status?: string;
  supplierId?: string;
}

export interface PurchaseListParams extends PaginationParams {
  status?: string;
  supplierId?: string;
}

export interface TransactionListParams extends PaginationParams {
  action?: string;
}

// ---- Service --------------------------------------------------------------

export const assetsService = {
  // -- CRUD -----------------------------------------------------------------

  /** Paginated asset list with summary breakdown. */
  async getAssets(params?: AssetListParams): Promise<AssetListData> {
    const res = await apiClient.get<AssetListData>(
      ENDPOINTS.ASSETS.LIST,
      withParams(params as RequestConfig['params']),
    );
    return res.data;
  },

  /** Full asset detail including installations, movements, etc. */
  async getAssetById(id: string): Promise<AssetDetail> {
    const res = await apiClient.get<AssetDetail>(ENDPOINTS.ASSETS.DETAIL(id));
    return res.data;
  },

  /** Create a new asset (any type). */
  async createAsset(data: CreateAssetRequest): Promise<Asset> {
    const res = await apiClient.post<Asset>(ENDPOINTS.ASSETS.CREATE, data);
    return res.data;
  },

  /** Update an existing asset. */
  async updateAsset(id: string, data: UpdateAssetRequest): Promise<Asset> {
    const res = await apiClient.put<Asset>(ENDPOINTS.ASSETS.UPDATE(id), data);
    return res.data;
  },

  // -- Suppliers ------------------------------------------------------------

  /** List all suppliers (non-paginated). */
  async getSuppliers(): Promise<SupplierListItem[]> {
    const res = await apiClient.get<SupplierListItem[]>(
      ENDPOINTS.ASSETS.SUPPLIERS_LIST,
    );
    return res.data;
  },

  /** Create a new supplier. */
  async createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
    const res = await apiClient.post<Supplier>(
      ENDPOINTS.ASSETS.SUPPLIERS_CREATE,
      data,
    );
    return res.data;
  },

  // -- Purchases ------------------------------------------------------------

  /** Paginated list of purchase orders. */
  async getPurchases(
    params?: PurchaseListParams,
  ): Promise<PaginatedData<PurchaseOrderListItem>> {
    const res = await apiClient.get<PaginatedData<PurchaseOrderListItem>>(
      ENDPOINTS.ASSETS.PURCHASES_LIST,
      withParams(params as RequestConfig['params']),
    );
    return res.data;
  },

  /** Create a purchase order with items. */
  async createPurchase(data: CreatePurchaseRequest): Promise<PurchaseOrder> {
    const res = await apiClient.post<PurchaseOrder>(
      ENDPOINTS.ASSETS.PURCHASES_CREATE,
      data,
    );
    return res.data;
  },

  // -- Install / Remove -----------------------------------------------------

  /** Install an asset onto a truck. */
  async installAsset(data: InstallAssetRequest): Promise<AssetInstallation> {
    const res = await apiClient.post<AssetInstallation>(
      ENDPOINTS.ASSETS.INSTALL,
      data,
    );
    return res.data;
  },

  /** Remove a previously installed asset. */
  async removeAsset(
    installationId: string,
    data?: RemoveAssetRequest,
  ): Promise<AssetInstallation> {
    const res = await apiClient.post<AssetInstallation>(
      ENDPOINTS.ASSETS.REMOVE(installationId),
      data ?? {},
    );
    return res.data;
  },

  // -- Transactions ---------------------------------------------------------

  /** Paginated transaction history for a specific asset. */
  async getTransactionHistory(
    assetId: string,
    params?: TransactionListParams,
  ): Promise<PaginatedData<AssetTransaction>> {
    const res = await apiClient.get<PaginatedData<AssetTransaction>>(
      ENDPOINTS.ASSETS.TRANSACTIONS(assetId),
      withParams(params as RequestConfig['params']),
    );
    return res.data;
  },

  // -- Stock summary --------------------------------------------------------

  /** Detailed stock summary for a specific asset. */
  async getStockSummary(assetId: string): Promise<AssetStockSummary> {
    const res = await apiClient.get<AssetStockSummary>(
      ENDPOINTS.ASSETS.STOCK_SUMMARY(assetId),
    );
    return res.data;
  },

  // -- Disposal -------------------------------------------------------------

  /** Dispose or sell an asset. */
  async disposeAsset(
    assetId: string,
    data: DisposeAssetRequest,
  ): Promise<AssetDisposal> {
    const res = await apiClient.post<AssetDisposal>(
      ENDPOINTS.ASSETS.DISPOSE(assetId),
      data,
    );
    return res.data;
  },

  // -- Low stock alerts -----------------------------------------------------

  /** Get all low-stock alerts with summary. */
  async getLowStockAlerts(): Promise<LowStockAlertsData> {
    const res = await apiClient.get<LowStockAlertsData>(
      ENDPOINTS.ASSETS.LOW_STOCK,
    );
    return res.data;
  },

  // -- Tool checkout / return -----------------------------------------------

  /** Check out a tool/equipment asset. */
  async checkoutTool(data: CheckoutToolRequest): Promise<Asset> {
    const res = await apiClient.post<Asset>(
      ENDPOINTS.ASSETS.TOOLS_CHECKOUT,
      data,
    );
    return res.data;
  },

  /** Return a previously checked-out tool. */
  async returnTool(data: ReturnToolRequest): Promise<Asset> {
    const res = await apiClient.post<Asset>(
      ENDPOINTS.ASSETS.TOOLS_RETURN,
      data,
    );
    return res.data;
  },
} as const;
