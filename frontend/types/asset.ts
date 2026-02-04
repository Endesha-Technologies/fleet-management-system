export type AssetType = 'Spare Part' | 'Tool' | 'Equipment' | 'Consumable' | 'Accessory';

export type AssetCondition = 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked';

export type AssetStatus = 'Available' | 'Assigned' | 'In Use' | 'Reserved' | 'Discontinued';

export type TrackingMethod = 'Serial Number' | 'Batch' | 'FIFO' | 'None';

export interface ConditionMix {
  condition: AssetCondition;
  count: number;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  sku: string;
  description?: string;
  tracking: TrackingMethod;
  inStock: number;
  assigned: number;
  conditionMix: ConditionMix[];
  reorderLevel: number;
  unitPrice: number;
  status: AssetStatus;
  stockStatus: StockStatus;
  location: string;
  supplier?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetTransaction {
  id: string;
  assetId: string;
  assetName: string;
  transactionType: 'Purchase' | 'Assign' | 'Remove' | 'Sell' | 'Dispose' | 'Return';
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  truckId?: string;
  truckPlate?: string;
  saleAmount?: number;
  disposalReason?: string;
  condition?: AssetCondition;
  transactionDate: string;
  performedBy: string;
  notes?: string;
}

export interface LowStockAlert {
  assetId: string;
  assetName: string;
  currentStock: number;
  reorderLevel: number;
  deficit: number;
}

export interface StockUnit {
  id: string;
  assetId: string;
  serialNumber: string;
  condition: AssetCondition;
  status: 'In Stock' | 'Mounted' | 'Sold' | 'Disposed' | 'Consumable';
  location: string;
  kmUsed?: number;
  purchaseDate: string;
}

export interface AssetMovement {
  id: string;
  date: string;
  type: 'Purchase' | 'Assignment' | 'Removal' | 'Sale' | 'Disposal' | 'Adjustment';
  reference: string;
  quantity?: number;
  serialNumber?: string;
  from: string;
  to: string;
  performedBy: string;
  notes?: string;
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  serialNumber?: string; // If applicable
  truckId: string;
  truckPlate: string;
  position?: string; // E.g., for Tyres
  mountDate: string;
  mountOdometer: number;
  status: 'Active' | 'History';
  dismountDate?: string;
  dismountOdometer?: number;
}