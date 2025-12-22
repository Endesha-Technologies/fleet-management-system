export type InventoryStatus = 'In Storage' | 'Sold' | 'Disposed' | 'Used in Maintenance' | 'Installed in Truck';

export type DisposalMethod = 'Recycled' | 'Scrapped' | 'Donated' | 'Returned to Supplier';

export type PartCondition = 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';

export interface InventoryItem {
  id: string;
  partName: string;
  partNumber: string;
  category: string;
  condition: PartCondition;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  removedFromVehicle: string; // Vehicle plate number
  removalDate: string;
  removalReason: string;
  storageLocation: string;
  status: InventoryStatus;
  addedBy: string;
  notes?: string;
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  partName: string;
  partNumber: string;
  transactionType: 'Added' | 'Sold' | 'Disposed' | 'Used' | 'Returned';
  quantity: number;
  fromLocation: string;
  toLocation?: string;
  vehicleId?: string; // If used in maintenance or returned to truck
  maintenanceId?: string; // If used in maintenance
  saleAmount?: number;
  disposalMethod?: DisposalMethod;
  disposalReason?: string;
  transactionDate: string;
  performedBy: string;
  notes?: string;
}
