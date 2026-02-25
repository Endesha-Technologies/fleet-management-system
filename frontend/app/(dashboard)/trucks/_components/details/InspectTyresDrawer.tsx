'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  Check,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tyresService } from '@/api/tyres/tyres.service';
import type {
  TyreCondition,
  TyreAxlePositions,
  PositionSummary,
} from '@/api/tyres/tyres.types';
import type { InspectTyresDrawerProps } from '../../_types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TyreInspectionRow {
  /** The tyre asset ID (needed for the API call) */
  assetId: string;
  /** Position code, e.g. "S1-L-O" */
  positionCode: string;
  /** Axle name */
  axleName: string;
  /** Tyre serial number */
  tyreSerial: string;
  /** Tyre brand + model for display */
  tyreLabel: string;
  /** Current tread depth from the position data */
  currentTreadDepth: number | null;
  /** Tyre size */
  tyreSize: string;

  // ── Inspection form fields ──
  treadDepth: string;
  pressure: string;
  visualCondition: TyreCondition;
  passed: boolean;
  notes: string;

  /** Whether the row is expanded for editing */
  expanded: boolean;
  /** Per-row submission state */
  status: 'pending' | 'submitting' | 'success' | 'error';
  /** Per-row error message */
  errorMessage: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONDITION_OPTIONS: { value: TyreCondition; label: string; color: string }[] = [
  { value: 'good', label: 'Good', color: 'text-green-600' },
  { value: 'fair', label: 'Fair', color: 'text-yellow-600' },
  { value: 'poor', label: 'Poor', color: 'text-red-600' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildInspectionRows(axles: TyreAxlePositions[]): TyreInspectionRow[] {
  const rows: TyreInspectionRow[] = [];

  for (const axle of axles) {
    for (const pos of axle.positions) {
      if (pos.status !== 'OCCUPIED' || !pos.currentTyre) continue;

      rows.push({
        assetId: pos.currentTyre.id,
        positionCode: pos.positionCode,
        axleName: axle.axleName,
        tyreSerial: pos.currentTyre.serialNumber,
        tyreLabel: `${pos.currentTyre.tyreBrand} ${pos.currentTyre.tyreModel}`,
        currentTreadDepth: pos.currentTyre.tyreTreadDepth,
        tyreSize: pos.currentTyre.tyreSize,

        // Default form values
        treadDepth: pos.currentTyre.tyreTreadDepth != null
          ? String(pos.currentTyre.tyreTreadDepth)
          : '',
        pressure: '',
        visualCondition: 'good',
        passed: true,
        notes: '',

        expanded: false,
        status: 'pending',
        errorMessage: null,
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

export function InspectTyresDrawer({
  open,
  onOpenChange,
  truckId,
  registrationNumber,
  tyrePositions,
  onComplete,
}: InspectTyresDrawerProps) {
  const [inspectorName, setInspectorName] = useState('');
  const [rows, setRows] = useState<TyreInspectionRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  // Initialize rows when drawer opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;

    setGlobalError(null);
    setGlobalSuccess(null);
    setInspectorName('');

    if (!tyrePositions || tyrePositions.axles.length === 0) {
      setRows([]);
      return;
    }

    const inspectionRows = buildInspectionRows(tyrePositions.axles);
    // Expand all rows by default for quick inspection
    setRows(inspectionRows.map((r) => ({ ...r, expanded: true })));
  }, [open, tyrePositions]);

  // Toggle row expansion
  const toggleRow = useCallback((assetId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.assetId === assetId ? { ...r, expanded: !r.expanded } : r,
      ),
    );
  }, []);

  // Update a field for a specific row
  const updateRow = useCallback(
    (assetId: string, field: keyof TyreInspectionRow, value: string | boolean) => {
      setRows((prev) =>
        prev.map((r) =>
          r.assetId === assetId ? { ...r, [field]: value } : r,
        ),
      );
    },
    [],
  );

  // Count pending/completed rows
  const completedCount = useMemo(
    () => rows.filter((r) => r.status === 'success').length,
    [rows],
  );
  const pendingCount = useMemo(
    () => rows.filter((r) => r.status === 'pending' || r.status === 'error').length,
    [rows],
  );

  // Submit all pending inspections
  const handleSubmitAll = useCallback(async () => {
    setGlobalError(null);
    setGlobalSuccess(null);

    if (!inspectorName.trim()) {
      setGlobalError('Please enter the inspector name.');
      return;
    }

    // Validate each pending row
    const pendingRows = rows.filter(
      (r) => r.status === 'pending' || r.status === 'error',
    );

    if (pendingRows.length === 0) {
      setGlobalError('No pending inspections to submit.');
      return;
    }

    for (const row of pendingRows) {
      const td = parseFloat(row.treadDepth);
      if (isNaN(td) || td < 0) {
        setGlobalError(
          `Tread depth for ${row.positionCode} (${row.tyreSerial}) is invalid.`,
        );
        return;
      }
      const pr = parseFloat(row.pressure);
      if (isNaN(pr) || pr < 0) {
        setGlobalError(
          `Pressure for ${row.positionCode} (${row.tyreSerial}) is invalid.`,
        );
        return;
      }
    }

    setIsSubmitting(true);

    // Mark all pending as submitting
    setRows((prev) =>
      prev.map((r) =>
        r.status === 'pending' || r.status === 'error'
          ? { ...r, status: 'submitting' as const, errorMessage: null }
          : r,
      ),
    );

    let successCount = 0;
    let failCount = 0;

    // Submit each inspection individually (API is per-tyre)
    for (const row of pendingRows) {
      try {
        await tyresService.inspectTyre(row.assetId, {
          inspectorName: inspectorName.trim(),
          treadDepth: parseFloat(row.treadDepth),
          pressure: parseFloat(row.pressure),
          visualCondition: row.visualCondition,
          passed: row.passed,
          notes: row.notes.trim() || undefined,
        });

        setRows((prev) =>
          prev.map((r) =>
            r.assetId === row.assetId
              ? { ...r, status: 'success' as const, errorMessage: null }
              : r,
          ),
        );
        successCount++;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to inspect tyre.';
        setRows((prev) =>
          prev.map((r) =>
            r.assetId === row.assetId
              ? { ...r, status: 'error' as const, errorMessage: message }
              : r,
          ),
        );
        failCount++;
      }
    }

    setIsSubmitting(false);

    if (failCount === 0) {
      setGlobalSuccess(
        `Successfully inspected ${successCount} tyre${successCount !== 1 ? 's' : ''}.`,
      );
      // Close after a short delay
      setTimeout(() => {
        onOpenChange(false);
        onComplete();
      }, 1200);
    } else {
      setGlobalError(
        `${successCount} inspection${successCount !== 1 ? 's' : ''} succeeded, ${failCount} failed. Fix errors and retry.`,
      );
    }
  }, [inspectorName, rows, onOpenChange, onComplete]);

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
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              Inspect Tyres
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {registrationNumber} · {rows.length} tyre{rows.length !== 1 ? 's' : ''} to inspect
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
                Mount tyres first before inspecting them.
              </p>
            </div>
          ) : (
            <>
              {/* Alerts */}
              {globalSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="text-sm text-green-800">{globalSuccess}</p>
                </div>
              )}
              {globalError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-800">{globalError}</p>
                </div>
              )}

              {/* Inspector name (shared across all inspections) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspector Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter inspector name"
                  disabled={isSubmitting}
                />
              </div>

              {/* Progress bar */}
              {completedCount > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(completedCount / rows.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {completedCount}/{rows.length} done
                  </span>
                </div>
              )}

              {/* Tyre inspection cards */}
              <div className="space-y-2">
                {rows.map((row) => (
                  <InspectionCard
                    key={row.assetId}
                    row={row}
                    onToggle={() => toggleRow(row.assetId)}
                    onUpdate={(field, value) =>
                      updateRow(row.assetId, field, value)
                    }
                    disabled={isSubmitting || row.status === 'success'}
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmitAll}
            disabled={isSubmitting || noTyres || pendingCount === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Inspecting…
              </>
            ) : (
              <>
                <ClipboardCheck className="h-4 w-4 mr-1.5" />
                Submit Inspections ({pendingCount})
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Inspection Card
// ---------------------------------------------------------------------------

function InspectionCard({
  row,
  onToggle,
  onUpdate,
  disabled,
}: {
  row: TyreInspectionRow;
  onToggle: () => void;
  onUpdate: (field: keyof TyreInspectionRow, value: string | boolean) => void;
  disabled: boolean;
}) {
  const statusBorder =
    row.status === 'success'
      ? 'border-green-200 bg-green-50/30'
      : row.status === 'error'
        ? 'border-red-200 bg-red-50/30'
        : row.status === 'submitting'
          ? 'border-blue-200 bg-blue-50/30'
          : 'border-gray-200 bg-white';

  return (
    <div className={`rounded-lg border ${statusBorder} overflow-hidden`}>
      {/* Card header (always visible) */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 text-left hover:bg-gray-50/50 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Status indicator */}
          {row.status === 'success' ? (
            <Check className="h-4 w-4 text-green-600 shrink-0" />
          ) : row.status === 'error' ? (
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          ) : row.status === 'submitting' ? (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" />
          )}

          <div className="min-w-0">
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
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {row.currentTreadDepth != null && (
            <span
              className={`text-xs font-medium ${treadColor(row.currentTreadDepth)}`}
            >
              {row.currentTreadDepth} mm
            </span>
          )}
          {row.expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Card body (expandable form) */}
      {row.expanded && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-1 border-t border-gray-100">
          {row.errorMessage && (
            <div className="text-xs text-red-600 bg-red-50 rounded px-2 py-1.5 mb-3">
              {row.errorMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Tread Depth */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tread Depth (mm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={row.treadDepth}
                onChange={(e) => onUpdate('treadDepth', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 8.5"
                disabled={disabled}
              />
            </div>

            {/* Pressure */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Pressure (PSI) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={row.pressure}
                onChange={(e) => onUpdate('pressure', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 110"
                disabled={disabled}
              />
            </div>

            {/* Visual Condition */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Visual Condition
              </label>
              <select
                value={row.visualCondition}
                onChange={(e) =>
                  onUpdate('visualCondition', e.target.value)
                }
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

            {/* Pass / Fail */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Result
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onUpdate('passed', true)}
                  disabled={disabled}
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium border-2 transition ${
                    row.passed
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  Pass
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate('passed', false)}
                  disabled={disabled}
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium border-2 transition ${
                    !row.passed
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  Fail
                </button>
              </div>
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
