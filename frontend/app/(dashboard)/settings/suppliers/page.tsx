'use client';

// ---------------------------------------------------------------------------
// Suppliers settings page — API-integrated
// ---------------------------------------------------------------------------
// Fetches suppliers via `assetsService.getSuppliers()`. Users can create / edit
// suppliers through the SupplierFormSheet, deactivate with a confirmation dialog,
// and reactivate directly.
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { assetsService } from '@/api/assets';
import type { SupplierListItem } from '@/api/assets/assets.types';
import { SettingsPageHeader } from '../_components/SettingsPageHeader';
import { SupplierTable } from '../_components/SupplierTable';
import { SupplierFormSheet } from '../_components/SupplierFormSheet';
import { DeactivateSupplierDialog } from '../_components/DeactivateSupplierDialog';
import type { SettingsSupplier } from '../_types';

// ---------------------------------------------------------------------------
// API → SettingsSupplier mapper
// ---------------------------------------------------------------------------

function mapApiSupplier(s: SupplierListItem): SettingsSupplier {
  return {
    id: s.id,
    name: s.name,
    contactPerson: s.contactPerson,
    email: s.email,
    phone: s.phone,
    address: s.address,
    notes: s.notes,
    isActive: s.isActive,
    purchaseOrderCount: s._count.purchaseOrders,
    assetCount: s._count.assets,
    createdAt: s.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function SuppliersPage() {
  // Data state
  const [suppliers, setSuppliers] = useState<SettingsSupplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Sheet state (create/edit)
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<SettingsSupplier | null>(null);

  // Deactivate dialog state
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [supplierToDeactivate, setSupplierToDeactivate] =
    useState<SettingsSupplier | null>(null);

  // ── Fetch data ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await assetsService.getSuppliers();
      setSuppliers(result.map(mapApiSupplier));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load suppliers';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleAdd = () => {
    setSelectedSupplier(null);
    setSheetOpen(true);
  };

  const handleEdit = (supplier: SettingsSupplier) => {
    setSelectedSupplier(supplier);
    setSheetOpen(true);
  };

  const handleDeactivate = (supplier: SettingsSupplier) => {
    setSupplierToDeactivate(supplier);
    setDeactivateDialogOpen(true);
  };

  const handleActivate = async (supplier: SettingsSupplier) => {
    try {
      await assetsService.updateSupplier(supplier.id, { isActive: true });
      fetchData();
    } catch {
      // Silently fail — user will see the stale state and can retry
    }
  };

  const handleSuccess = () => {
    fetchData();
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Suppliers"
        description="Manage your parts and asset suppliers"
        action={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        }
      />

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{' '}
          <button
            type="button"
            onClick={fetchData}
            className="font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <SupplierTable
        suppliers={suppliers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
        onActivate={handleActivate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <SupplierFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        supplier={selectedSupplier}
        onSuccess={handleSuccess}
      />

      <DeactivateSupplierDialog
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        supplier={supplierToDeactivate}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
