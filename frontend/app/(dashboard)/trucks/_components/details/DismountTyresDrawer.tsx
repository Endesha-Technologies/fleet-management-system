'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  Check,
  ArrowUpFromLine,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tyresService } from '@/api/tyres/tyres.service';
import type {
  TyreCondition,
  TyreAxlePositions,
  DismountInput,
} from '@/api/tyres/tyres.types';
import type { DismountTyresDrawerProps } from '../../_types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DismountRow {
  /** Position ID (used for the API call) */
  positionId: string;
  /** Position code, e.g. "S1-L-O" */
  positionCode: string;
  /** Axle name */
  axleName: string;
  /** Tyre serial number */
  tyreSerial: string;
  /** Tyre brand + model for display */
  tyreLabel: string;
  /** Tyre size */
  tyreSize: string;
  /** Current tread depth */
  currentTreadDepth: number | null;
  /** Total mileage on tyre */
  tyreMileage: number;

  // ── Form fields ──
  selected: boolean;
  treadDepthMm: string;
  condition: TyreCondition;
  reason: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONDITION_OPTIONS: { value: TyreCondition; label: string }[] = [
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const REASON_OPTIONS = [
  'Scheduled replacement',
  'Worn out',
  'Damaged',
  'Puncture',
  'Vehicle decommission',
  'Rotation swap',
  'Other',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildDismountRows(axles: TyreAxlePositions[]): DismountRow[] {
  const rows: DismountRow[] = [];

  for (const axle of axles) {
    for (const pos of axle.positions) {
      if (pos.status !== 'OCCUPIED' || !pos.currentTyre) continue;

      rows.push({
        positionId: pos.id,
        positionCode: pos.positionCode,
        axleName: axle.axleName,
        tyreSerial: pos.currentTyre.serialNumber,
        tyreLabel: `${pos.currentTyre.tyreBrand} ${pos.currentTyre.tyreModel}`,
        tyreSize: pos.currentTyre.tyreSize,
        currentTreadDepth: pos.currentTyre.tyreTreadDepth,
        tyreMileage: pos.currentTyre.tyreTotalMileage,

        selected: false,
        treadDepthMm: pos.currentTyre.tyreTreadDepth != null
          ? String(pos.currentTyre.tyreTreadDepth)
          : '',
        condition: 'good',
        reason: '',
        notes: '',
      });
    }
  }

  return rows;
}

function treadColor(depth: number | null): string {
  if (depth === null) return 'text-gray-400';
  if (depth < 4) return 'text-red-600';
  if (depth < 8) return 'text-yellow-600';
  return 'text-green-600';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DismountTyresDrawer({
  open,
  onOpenChange,
  truckId,
  registrationNumber,
  currentOdometer,
  tyrePositions,
  onComplete,
}: DismountTyresDrawerProps) {
  const [rows, setRows] = useState<DismountRow[]>([]);
  const [odometer, setOdometer] = useState(currentOdometer?.toString() ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Initialize when drawer opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;

    setSubmitError(null);
    setSubmitSuccess(null);
    setOdometer(currentOdometer?.toString() ?? '');

    if (!tyrePositions || tyrePositions.axles.length === 0) {
      setRows([]);
      return;
    }

    setRows(buildDismountRows(tyrePositions.axles));
  }, [open, tyrePositions, currentOdometer]);

  // Toggle selection
  const toggleSelect = useCallback((positionId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.positionId === positionId ? { ...r, selected: !r.selected } : r,
      ),
    );
  }, []);

  // Toggle all
  const toggleAll = useCallback(() => {
    setRows((prev) => {
      const allSelected = prev.every((r) => r.selected);
      return prev.map((r) => ({ ...r, selected: !allSelected }));
    });
  }, []);

  // Update a field for a specific row
  const updateRow = useCallback(
    (positionId: string, field: keyof DismountRow, value: string | boolean) => {
      setRows((prev) =>
        prev.map((r) =>
          r.positionId === positionId ? { ...r, [field]: value } : r,
        ),
      );
    },
    [],
  );

  // Selected rows
  const selectedRows = useMemo(() => rows.filter((r) => r.selected), [rows]);
  const allSelected = useMemo(
    () => rows.length > 0 && rows.every((r) => r.selected),
    [rows],
  );

  // Handle submit
  const handleConfirm = useCallback(async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    const odo = parseInt(odometer, 10);
    if (isNaN(odo) || odo < 0) {
      setSubmitError('Please enter a valid odometer reading.');
      return;
    }

    if (selectedRows.length === 0) {
      setSubmitError('Please select at least one tyre to dismount.');
      return;
    }

    const dismounts: DismountInput[] = selectedRows.map((row) => ({
      positionId: row.positionId,
      treadDepthMm: row.treadDepthMm ? parseFloat(row.treadDepthMm) : undefined,
      tyreMileage: row.tyreMileage,
      condition: row.condition,
      reason: row.reason || undefined,
      notes: row.notes.trim() || undefined,
    }));

    setIsSubmitting(true);

    try {
      const result = await tyresService.dismountTyres({
        truckId,
        odometerReading: odo,
        dismounts,
      });

      setSubmitSuccess(
        `Successfully dismounted ${result.dismountCount} tyre${result.dismountCount !== 1 ? 's' : ''}.`,
      );

      setTimeout(() => {
        onOpenChange(false);
        onComplete();
      }, 1200);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to dismount tyres.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [odometer, selectedRows, truckId, onOpenChange, onComplete]);

  if (!open) return null;

  const noTyres = rows.length === 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5 text-amber-600" />
              Dismount Tyres
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {registrationNumber} · Select tyres to remove from the truck
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition ml-2 shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {noTyres ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <AlertCircle className="h-8 w-8 mb-3 text-gray-400" />
              <p className="text-sm font-medium">No tyres mounted</p>
              <p className="text-xs mt-1">
                There are no tyres to dismount.
              </p>
            </div>
          ) : (
            <>
              {/* Alerts */}
              {submitSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="text-sm text-green-800">{submitSuccess}</p>
                </div>
              )}
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-800">{submitError}</p>
                </div>
              )}

              {/* Odometer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Odometer Reading (km) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter current odometer"
                  disabled={isSubmitting}
                />
              </div>

              {/* Select all toggle */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {allSelected ? 'Deselect all' : 'Select all'}
                </button>
                <Badge variant="outline" className="text-[10px]">
                  {selectedRows.length} of {rows.length} selected
                </Badge>
              </div>

              {/* Tyre rows */}
              <div className="space-y-2">
                {rows.map((row) => (
                  <DismountCard
                    key={row.positionId}
                    row={row}
                    onToggle={() => toggleSelect(row.positionId)}
                    onUpdate={(field, value) =>
                      updateRow(row.positionId, field, value)
                    }
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleConfirm}
            disabled={isSubmitting || noTyres || selectedRows.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Dismounting…
              </>
            ) : (
              <>
                <ArrowUpFromLine className="h-4 w-4 mr-1.5" />
                Dismount ({selectedRows.length})
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Dismount Card
// ---------------------------------------------------------------------------

function DismountCard({
  row,
  onToggle,
  onUpdate,
  disabled,
}: {
  row: DismountRow;
  onToggle: () => void;
  onUpdate: (field: keyof DismountRow, value: string | boolean) => void;
  disabled: boolean;
}) {
  return (
    <div
      className={`rounded-lg border overflow-hidden transition ${
        row.selected
          ? 'border-amber-300 bg-amber-50/30'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Card header — clickable to toggle selection */}
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="w-full flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 text-left hover:bg-gray-50/50 transition"
      >
        {row.selected ? (
          <CheckSquare className="h-4 w-4 text-amber-600 shrink-0" />
        ) : (
          <Square className="h-4 w-4 text-gray-400 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {row.positionCode}
            </span>
            <span className="text-xs text-gray-500">{row.axleName}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-blue-600 font-mono">
              {row.tyreSerial}
            </span>
            <span className="text-[10px] text-gray-400">
              {row.tyreLabel} · {row.tyreSize}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-right">
          {row.currentTreadDepth != null && (
            <span className={`text-xs font-medium ${treadColor(row.currentTreadDepth)}`}>
              {row.currentTreadDepth} mm
            </span>
          )}
          <span className="text-xs text-gray-500 font-mono">
            {row.tyreMileage.toLocaleString()} km
          </span>
        </div>
      </button>

      {/* Expanded form (when selected) */}
      {row.selected && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-1 border-t border-amber-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Tread Depth at dismount */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tread Depth (mm)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={row.treadDepthMm}
                onChange={(e) => onUpdate('treadDepthMm', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 6.5"
                disabled={disabled}
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Condition
              </label>
              <select
                value={row.condition}
                onChange={(e) => onUpdate('condition', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={disabled}
              >
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Reason
              </label>
              <select
                value={row.reason}
                onChange={(e) => onUpdate('reason', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={disabled}
              >
                <option value="">Select reason…</option>
                {REASON_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={row.notes}
              onChange={(e) => onUpdate('notes', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any observations…"
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}
