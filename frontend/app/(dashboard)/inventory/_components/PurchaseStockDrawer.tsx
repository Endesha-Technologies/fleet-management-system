'use client';

// ---------------------------------------------------------------------------
// PurchaseStockDrawer — Record a purchase order for assets
// ---------------------------------------------------------------------------
// Supports two initialisation modes:
//   • initialAssetId  – pre-fills a single asset by ID (fetched from API)
//   • initialAssets   – pre-fills multiple assets directly (e.g. after creation)
// Both are optional; without either the user starts with an empty line-item
// list and adds assets manually.
//
// Uses real API integration:
//   • assetsService.getSuppliers()   – supplier dropdown
//   • assetsService.getAssets()      – asset search / selection
//   • assetsService.createPurchase() – submit purchase order
// ---------------------------------------------------------------------------

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormDateInput,
  FormNumberInput,
} from '@/components/ui/form';
import {
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  ShoppingCart,
  Package,
  Wrench,
  Droplets,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { assetsService } from '@/api/assets';
import type {
  AssetType,
  AssetListItem,
  SupplierListItem,
  CreatePurchaseRequest,
  PurchaseItemInput,
} from '@/api/assets/assets.types';
import type { PurchaseStockDrawerProps } from '../_types';

// ===========================================================================
// Visual meta per asset type
// ===========================================================================

const TYPE_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  TYRE:           { label: 'Tyre',             color: 'bg-blue-100 text-blue-700',    icon: Package  },
  SPARE_PART:     { label: 'Spare Part',       color: 'bg-amber-100 text-amber-700',  icon: Wrench   },
  CONSUMABLE:     { label: 'Consumable',       color: 'bg-green-100 text-green-700',  icon: Droplets },
  TOOL_EQUIPMENT: { label: 'Tool / Equipment', color: 'bg-purple-100 text-purple-700', icon: Settings },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? { label: type || 'Asset', color: 'bg-gray-100 text-gray-500', icon: Package };
}

// ===========================================================================
// Internal line-item state
// ===========================================================================

// Serialized asset types always have quantity = 1
const SERIALIZED_ASSET_TYPES = new Set<string>(['TYRE', 'SPARE_PART', 'TOOL_EQUIPMENT']);

interface LineItem {
  id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  quantity: number;
  unitCost: number;
  notes: string;
}

function emptyLineItem(): LineItem {
  return {
    id: crypto.randomUUID(),
    assetId: '',
    assetName: '',
    assetType: '',
    quantity: 1,
    unitCost: 0,
    notes: '',
  };
}

// ===========================================================================
// Component
// ===========================================================================

export default function PurchaseStockDrawer({
  open,
  onOpenChange,
  initialAssetId,
  initialAssets,
  onSuccess,
}: PurchaseStockDrawerProps) {
  // ---- Reference data (suppliers + assets for dropdown) --------------------
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([]);
  const [availableAssets, setAvailableAssets] = useState<AssetListItem[]>([]);
  const [loadingRef, setLoadingRef] = useState(false);

  // ---- Form state ----------------------------------------------------------
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // ---- Collapse state for line items ----------------------------------------
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // ---- Submit state --------------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  // =========================================================================
  // Fetch reference data once
  // =========================================================================

  useEffect(() => {
    if (open && suppliers.length === 0) {
      setLoadingRef(true);
      Promise.all([
        assetsService.getSuppliers().catch(() => [] as SupplierListItem[]),
        assetsService.getAssets({ page: 1, limit: 200 }).catch(() => null),
      ]).then(([supplierData, assetData]) => {
        setSuppliers(supplierData);
        if (assetData) setAvailableAssets(assetData.data);
      }).finally(() => setLoadingRef(false));
    }
  }, [open, suppliers.length]);

  // =========================================================================
  // Reset / prefill when drawer opens
  // =========================================================================

  useEffect(() => {
    if (!open) return;

    // Reset form
    setSupplierId('');
    setInvoiceNumber('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setErrors([]);
    setSuccess(false);
    setExpandedItems(new Set());

    // Pre-fill line items from initialAssets (array — e.g. after bulk creation)
    if (initialAssets && initialAssets.length > 0) {
      const items = initialAssets.map((a) => ({
        id: crypto.randomUUID(),
        assetId: a.id,
        assetName: a.name,
        assetType: a.assetType,
        quantity: 1,
        unitCost: 0,
        notes: '',
      }));
      setLineItems(items);
      // Expand all prefilled items
      setExpandedItems(new Set(items.map((i) => i.id)));
      return;
    }

    // Pre-fill from initialAssetId (single asset — e.g. from detail page)
    if (initialAssetId) {
      // Try to find asset in the already-loaded list, otherwise fetch
      const found = availableAssets.find((a) => a.id === initialAssetId);
      if (found) {
        const itemId = crypto.randomUUID();
        setLineItems([
          {
            id: itemId,
            assetId: found.id,
            assetName: found.name,
            assetType: found.assetType,
            quantity: 1,
            unitCost: found.unitCost ?? 0,
            notes: '',
          },
        ]);
        setExpandedItems(new Set([itemId]));
      } else {
        // Fetch the specific asset
        assetsService
          .getAssetById(initialAssetId)
          .then((asset) => {
            const itemId = crypto.randomUUID();
            setLineItems([
              {
                id: itemId,
                assetId: asset.id,
                assetName: asset.name,
                assetType: asset.assetType,
                quantity: 1,
                unitCost: asset.unitCost ?? 0,
                notes: '',
              },
            ]);
            setExpandedItems(new Set([itemId]));
          })
          .catch(() => {
            const item = emptyLineItem();
            setLineItems([item]);
            setExpandedItems(new Set([item.id]));
          });
      }
      return;
    }

    // No pre-fill — start empty
    setLineItems([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialAssetId, initialAssets]);

  // =========================================================================
  // Line-item handlers
  // =========================================================================

  const addLineItem = useCallback(() => {
    const newItem = emptyLineItem();
    setLineItems((prev) => [...prev, newItem]);
    // Auto-expand newly added items
    setExpandedItems((prev) => new Set(prev).add(newItem.id));
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateLineItem = useCallback(
    (id: string, field: keyof LineItem, value: string | number) => {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, [field]: value };

          // When asset selection changes, fill in name & type
          if (field === 'assetId' && typeof value === 'string') {
            const asset = availableAssets.find((a) => a.id === value);
            if (asset) {
              updated.assetName = asset.name;
              updated.assetType = asset.assetType;
              updated.unitCost = asset.unitCost ?? 0;
              // Serialized assets must always have quantity = 1
              if (SERIALIZED_ASSET_TYPES.has(asset.assetType)) {
                updated.quantity = 1;
              }
            }
          }

          // Enforce quantity = 1 for serialized asset types
          if (field === 'quantity' && SERIALIZED_ASSET_TYPES.has(updated.assetType)) {
            updated.quantity = 1;
          }

          return updated;
        }),
      );
    },
    [availableAssets],
  );

  // =========================================================================
  // Derived values
  // =========================================================================

  const grandTotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0,
  );

  const supplierOptions = suppliers
    .filter((s) => s.isActive)
    .map((s) => ({ value: s.id, label: s.name }));

  const assetOptions = availableAssets.map((a) => ({
    value: a.id,
    label: `${a.name} (${getTypeMeta(a.assetType).label})`,
  }));

  // =========================================================================
  // Validation
  // =========================================================================

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!supplierId) errs.push('Supplier is required');
    if (lineItems.length === 0) errs.push('At least one line item is required');
    lineItems.forEach((item, i) => {
      if (!item.assetId) errs.push(`Item ${i + 1}: Asset is required`);
      if (item.quantity <= 0)
        errs.push(`Item ${i + 1}: Quantity must be greater than 0`);
      if (item.unitCost < 0)
        errs.push(`Item ${i + 1}: Unit cost cannot be negative`);
    });
    return errs;
  };

  // =========================================================================
  // Submit
  // =========================================================================

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const items: PurchaseItemInput[] = lineItems.map((item) => {
        const pi: PurchaseItemInput = {
          assetId: item.assetId,
          quantity: SERIALIZED_ASSET_TYPES.has(item.assetType) ? 1 : item.quantity,
          unitCost: item.unitCost,
        };
        if (item.notes.trim()) pi.notes = item.notes.trim();
        return pi;
      });

      const request: CreatePurchaseRequest = {
        supplierId,
        items,
      };
      if (invoiceNumber.trim()) request.invoiceNumber = invoiceNumber.trim();
      if (purchaseDate) request.purchaseDate = purchaseDate;
      if (formNotes.trim()) request.notes = formNotes.trim();

      await assetsService.createPurchase(request);

      setSuccess(true);
      onSuccess?.();

      // Close after brief success display
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create purchase order';
      setErrors([msg]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="4xl" className="overflow-y-auto flex flex-col">
        {/* ── Header ───────────────────────────────────────────── */}
        <SheetHeader className="pb-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <SheetTitle className="text-xl font-semibold text-gray-900">
                Purchase Stock
              </SheetTitle>
              <SheetDescription className="text-gray-600">
                Record new stock arrival from suppliers.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── Error banner ──────────────────────────────────────── */}
        {errors.length > 0 && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 shrink-0">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              <AlertCircle className="h-5 w-5" />
              Validation Errors
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Success banner ────────────────────────────────────── */}
        {success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 flex items-start gap-3 shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 font-medium">
              Purchase order created successfully!
            </p>
          </div>
        )}

        {/* ── Form content ──────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto py-6 space-y-8">
          {/* ── Supplier Information ─────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <h3 className="text-base font-semibold text-gray-900">
                Supplier Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
              <FormSelect
                label="Supplier"
                required
                id="purchase-supplier"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                options={supplierOptions}
                placeholder={
                  loadingRef ? 'Loading suppliers…' : 'Select supplier'
                }
              />
              <FormInput
                label="Invoice Number"
                id="purchase-invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g., INV-2026-001"
              />
              <FormDateInput
                label="Purchase Date"
                id="purchase-date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
              <div className="md:col-span-2">
                <FormTextarea
                  label="Notes"
                  id="purchase-notes"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Optional notes about this purchase…"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* ── Line Items ──────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-blue-600 rounded-full" />
                <h3 className="text-base font-semibold text-gray-900">
                  Line Items
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addLineItem}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>

            <div className="space-y-3 pl-3">
              {lineItems.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-500">No items added yet.</p>
                  <Button
                    variant="link"
                    onClick={addLineItem}
                    className="text-blue-600 font-medium"
                  >
                    Click to add your first item
                  </Button>
                </div>
              ) : (
                lineItems.map((item, index) => {
                  const meta = getTypeMeta(item.assetType);
                  const Icon = meta.icon;
                  const lineTotal = item.quantity * item.unitCost;
                  const isPrefilled = !!item.assetName && !!item.assetId;
                  const isExpanded = expandedItems.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg bg-white shadow-sm hover:border-gray-300 transition-colors"
                    >
                      {/* Collapsible header — always visible */}
                      <div
                        className="flex justify-between items-center px-4 py-3 cursor-pointer select-none"
                        onClick={() => toggleExpanded(item.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                          )}
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
                            Item #{index + 1}
                          </span>
                          {item.assetType && (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium shrink-0',
                                meta.color,
                              )}
                            >
                              <Icon className="h-3 w-3" />
                              {meta.label}
                            </span>
                          )}
                          {/* Collapsed summary */}
                          {!isExpanded && item.assetName && (
                            <span className="text-sm text-gray-700 truncate font-medium">
                              {item.assetName}
                            </span>
                          )}
                          {!isExpanded && lineTotal > 0 && (
                            <span className="text-sm font-semibold text-gray-900 ml-auto shrink-0">
                              UGX {lineTotal.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLineItem(item.id);
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full shrink-0 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Expanded body */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Asset Selection — 5 cols */}
                            <div className="md:col-span-5">
                              {isPrefilled ? (
                                <div>
                                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                                    Asset
                                  </label>
                                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-900">
                                    <Icon className="h-4 w-4 text-gray-500 shrink-0" />
                                    <span className="truncate font-medium">{item.assetName}</span>
                                  </div>
                                </div>
                              ) : (
                                <FormSelect
                                  label="Asset"
                                  id={`asset-${item.id}`}
                                  value={item.assetId}
                                  onChange={(e) =>
                                    updateLineItem(item.id, 'assetId', e.target.value)
                                  }
                                  options={assetOptions}
                                  placeholder={
                                    loadingRef ? 'Loading assets…' : 'Select asset'
                                  }
                                />
                              )}
                            </div>

                            {/* Quantity — 2 cols */}
                            <div className="md:col-span-2">
                              <FormNumberInput
                                label="Qty"
                                id={`qty-${item.id}`}
                                value={String(item.quantity)}
                                onChange={(e) =>
                                  updateLineItem(
                                    item.id,
                                    'quantity',
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                placeholder="1"
                                disabled={SERIALIZED_ASSET_TYPES.has(item.assetType)}
                              />
                              {SERIALIZED_ASSET_TYPES.has(item.assetType) && (
                                <p className="text-xs text-gray-400 mt-1">Fixed at 1 for serialized assets</p>
                              )}
                            </div>

                            {/* Unit Cost — 3 cols */}
                            <div className="md:col-span-3">
                              <FormNumberInput
                                label="Unit Cost"
                                id={`cost-${item.id}`}
                                value={String(item.unitCost)}
                                onChange={(e) =>
                                  updateLineItem(
                                    item.id,
                                    'unitCost',
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                placeholder="0.00"
                              />
                            </div>

                            {/* Line Total — 2 cols */}
                            <div className="md:col-span-2 flex items-end">
                              <div className="w-full bg-gray-50 rounded-lg p-3 text-right">
                                <span className="text-xs font-medium text-gray-500 uppercase block">
                                  Total
                                </span>
                                <span className="text-lg font-bold text-gray-900">
                                  {lineTotal.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-400 ml-1">
                                  UGX
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Optional: item notes */}
                          <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                            <FormInput
                              label="Item Notes"
                              id={`notes-${item.id}`}
                              value={item.notes}
                              onChange={(e) =>
                                updateLineItem(item.id, 'notes', e.target.value)
                              }
                              placeholder="Optional…"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Item button at the bottom of the list */}
            {lineItems.length > 0 && (
              <div className="pl-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 border-dashed"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Another Item
                </Button>
              </div>
            )}

            {/* Grand total */}
            {lineItems.length > 0 && (
              <div className="flex justify-end pl-3">
                <div className="bg-gray-50 rounded-lg px-6 py-3 text-right">
                  <span className="text-gray-600 mr-3">Grand Total:</span>
                  <span className="text-xl font-bold text-gray-900">
                    UGX {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 pb-2 mt-auto shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || success}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting || success || lineItems.length === 0}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Purchase
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
