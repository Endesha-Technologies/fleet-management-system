// ---------------------------------------------------------------------------
// API → UI type adapters for the Asset Detail page
// ---------------------------------------------------------------------------
// Transforms API response types (AssetDetail, AssetStockSummary) into the
// local UI types consumed by tab components (OverviewTab, StockUnitsTab, etc.)
// ---------------------------------------------------------------------------

import type { AssetDetail, AssetStockSummary, StockMovement, AssetInstallation } from '@/api/assets';
import type {
  Asset,
  StockUnit,
  AssetMovement as LocalAssetMovement,
  AssetAssignment,
  AssetType as LocalAssetType,
  AssetCondition,
  AssetStatus as LocalAssetStatus,
  StockStatus,
  TrackingMethod,
} from '@/types/asset';

// ---- Enum mappers ---------------------------------------------------------

const ASSET_TYPE_MAP: Record<string, LocalAssetType> = {
  TYRE: 'Spare Part',
  SPARE_PART: 'Spare Part',
  CONSUMABLE: 'Consumable',
  TOOL_EQUIPMENT: 'Equipment',
};

const ASSET_STATUS_MAP: Record<string, LocalAssetStatus> = {
  IN_INVENTORY: 'Available',
  INSTALLED: 'Assigned',
  IN_USE: 'In Use',
  AVAILABLE: 'Available',
  DISPOSED: 'Discontinued',
  SOLD: 'Discontinued',
};

const TRACKING_MAP: Record<string, TrackingMethod> = {
  TYRE: 'Serial Number',
  SPARE_PART: 'Batch',
  CONSUMABLE: 'FIFO',
  TOOL_EQUIPMENT: 'Serial Number',
};

const MOVEMENT_TYPE_MAP: Record<string, LocalAssetMovement['type']> = {
  INITIAL: 'Purchase',
  PURCHASE: 'Purchase',
  TYRE_MOUNT: 'Assignment',
  INSTALL: 'Assignment',
  TYRE_DISMOUNT: 'Removal',
  REMOVAL: 'Removal',
  DISPOSAL: 'Disposal',
  ADJUSTMENT: 'Adjustment',
};

// ---- Helpers --------------------------------------------------------------

function deriveStockStatus(
  currentStock: number,
  minimumStock: number,
): StockStatus {
  if (currentStock === 0) return 'Out of Stock';
  if (currentStock <= minimumStock) return 'Low Stock';
  return 'In Stock';
}

function deriveCondition(status: string): AssetCondition {
  if (status === 'DISPOSED' || status === 'SOLD') return 'Poor';
  return 'New';
}

// ---- Main adapters --------------------------------------------------------

/**
 * Transform an API `AssetDetail` (+ optional stock summary) into the local
 * `Asset` type consumed by OverviewTab, StockUnitsTab, and drawer components.
 */
export function toLocalAsset(
  detail: AssetDetail,
  stockSummary?: AssetStockSummary | null,
): Asset {
  const inStock = stockSummary?.currentStock ?? detail.quantity;
  const assigned = stockSummary?.currentlyInstalled ?? 0;
  const minimumStock = detail.minimumStock;

  return {
    id: detail.id,
    name: detail.name,
    type: ASSET_TYPE_MAP[detail.assetType] ?? 'Spare Part',
    sku: detail.serialNumber || detail.partNumber || detail.id.slice(0, 12).toUpperCase(),
    description: detail.description ?? undefined,
    tracking: TRACKING_MAP[detail.assetType] ?? 'Batch',
    inStock,
    assigned,
    conditionMix: [{ condition: deriveCondition(detail.status), count: inStock }],
    reorderLevel: minimumStock,
    unitPrice: detail.unitCost ?? 0,
    status: ASSET_STATUS_MAP[detail.status] ?? 'Available',
    stockStatus: deriveStockStatus(inStock, minimumStock),
    location: detail.storageLocation ?? 'Not specified',
    supplier: detail.supplier?.name ?? undefined,
    lastRestocked: detail.purchaseDate ?? undefined,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
  };
}

/**
 * Transform API `StockMovement[]` into the local `AssetMovement[]` shape
 * consumed by the MovementsTab component.
 */
export function toLocalMovements(
  movements: StockMovement[],
): LocalAssetMovement[] {
  return movements.map((m) => ({
    id: m.id,
    date: m.createdAt,
    type: MOVEMENT_TYPE_MAP[m.movementType] ?? 'Adjustment',
    reference: m.referenceId ?? m.id.slice(0, 8).toUpperCase(),
    quantity: m.quantity,
    from: m.direction === 'OUT' ? 'Stock' : (m.notes?.match(/from (.+)/i)?.[1] ?? 'External'),
    to: m.direction === 'IN' ? 'Stock' : (m.notes?.match(/on (.+)/i)?.[1] ?? 'External'),
    performedBy: m.performedBy.slice(0, 8) + '…',
    notes: m.notes ?? undefined,
  }));
}

/**
 * Transform API `AssetInstallation[]` into the local `AssetAssignment[]` shape
 * consumed by the AssignmentsTab component. Uses `truckHistory` from the stock
 * summary to resolve truck registration numbers when available.
 */
export function toLocalAssignments(
  installations: AssetInstallation[],
  assetId: string,
  stockSummary?: AssetStockSummary | null,
): AssetAssignment[] {
  // Build a lookup from truckId → registration number
  const truckNameMap: Record<string, string> = {};
  if (stockSummary?.truckHistory) {
    for (const th of stockSummary.truckHistory) {
      truckNameMap[th.truckId] = th.registrationNumber;
    }
  }
  if (stockSummary?.activeInstallations) {
    for (const ai of stockSummary.activeInstallations) {
      truckNameMap[ai.truckId] = ai.registrationNumber;
    }
  }

  return installations.map((inst) => ({
    id: inst.id,
    assetId,
    serialNumber: undefined,
    truckId: inst.truckId,
    truckPlate: truckNameMap[inst.truckId] ?? inst.truckId.slice(0, 8).toUpperCase(),
    position: inst.position ?? undefined,
    mountDate: inst.installedAt,
    mountOdometer: inst.odometerAtInstall ?? 0,
    status: inst.removedAt ? 'History' : 'Active',
    dismountDate: inst.removedAt ?? undefined,
    dismountOdometer: inst.odometerAtRemoval ?? undefined,
  }));
}

/**
 * Derive local `StockUnit[]` from the API asset detail.
 *
 * For serial-tracked assets (TYRE / TOOL_EQUIPMENT), we synthesise a single
 * stock unit from the asset's own data since the API treats each serial item
 * as a separate asset record.
 */
export function toLocalStockUnits(
  detail: AssetDetail,
): StockUnit[] {
  // Only serial-tracked types get individual stock units
  if (detail.assetType !== 'TYRE' && detail.assetType !== 'TOOL_EQUIPMENT') {
    return [];
  }

  // For serial-tracked, each asset IS a stock unit
  const statusMap: Record<string, StockUnit['status']> = {
    IN_INVENTORY: 'In Stock',
    INSTALLED: 'Mounted',
    IN_USE: 'Mounted',
    AVAILABLE: 'In Stock',
    DISPOSED: 'Disposed',
    SOLD: 'Sold',
  };

  return [
    {
      id: detail.id,
      assetId: detail.id,
      serialNumber: detail.serialNumber ?? detail.id.slice(0, 12).toUpperCase(),
      condition: deriveCondition(detail.status),
      status: statusMap[detail.status] ?? 'In Stock',
      location: detail.storageLocation ?? 'Not specified',
      kmUsed: detail.assetType === 'TYRE' ? detail.tyreTotalMileage : undefined,
      purchaseDate: detail.purchaseDate ?? detail.createdAt,
    },
  ];
}
