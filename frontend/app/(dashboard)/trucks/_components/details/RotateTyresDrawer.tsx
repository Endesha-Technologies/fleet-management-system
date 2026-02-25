'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Loader2, AlertCircle, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tyresService } from '@/api/tyres/tyres.service';
import type {
  RotationMethod,
  RotationMove,
  TyreAxlePositions,
  PositionSummary,
  TruckTyrePositionsData,
} from '@/api/tyres/tyres.types';
import type { RotateTyresDrawerProps } from '../../_types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OccupiedPosition {
  /** Position ID */
  id: string;
  /** E.g. "S1-L-O" */
  positionCode: string;
  /** Axle name, e.g. "Front Steer" */
  axleName: string;
  /** Axle type: STEER, DRIVE, etc. */
  axleType: string;
  /** Axle index for ordering */
  axleIndex: number;
  /** LEFT or RIGHT */
  side: string;
  /** INNER or OUTER */
  slot: string;
  /** Tyre serial number */
  tyreSerial: string;
  /** Tyre brand + model */
  tyreLabel: string;
  /** Current tread depth */
  treadDepth: number | null;
  /** Target position ID (user-selected or auto-calculated) */
  targetPositionId: string;
}

interface AllPosition {
  id: string;
  positionCode: string;
  axleName: string;
  axleType: string;
  side: string;
  slot: string;
  isOccupied: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const METHOD_OPTIONS: { value: RotationMethod; label: string; description: string }[] = [
  {
    value: 'FRONT_TO_BACK',
    label: 'Front-to-Back',
    description: 'Steer axle tyres move to drive positions and vice versa, same side.',
  },
  {
    value: 'CROSS',
    label: 'Cross Pattern',
    description: 'Front tyres cross to opposite-side drive positions; drive tyres move straight to front.',
  },
  {
    value: 'SIDE_TO_SIDE',
    label: 'Side-to-Side',
    description: 'Left tyres swap with right tyres on the same axle.',
  },
  {
    value: 'CUSTOM',
    label: 'Custom',
    description: 'Manually select the target position for each tyre.',
  },
];

// ---------------------------------------------------------------------------
// Helpers – auto-rotation patterns
// ---------------------------------------------------------------------------

function buildPositionMap(
  axles: TyreAxlePositions[],
): { occupied: OccupiedPosition[]; all: AllPosition[] } {
  const occupied: OccupiedPosition[] = [];
  const all: AllPosition[] = [];

  for (const axle of axles) {
    for (const pos of axle.positions) {
      all.push({
        id: pos.id,
        positionCode: pos.positionCode,
        axleName: axle.axleName,
        axleType: axle.axleType,
        side: pos.side,
        slot: pos.slot,
        isOccupied: pos.status === 'OCCUPIED',
      });

      if (pos.status === 'OCCUPIED' && pos.currentTyre) {
        occupied.push({
          id: pos.id,
          positionCode: pos.positionCode,
          axleName: axle.axleName,
          axleType: axle.axleType,
          axleIndex: axle.axleIndex,
          side: pos.side,
          slot: pos.slot,
          tyreSerial: pos.currentTyre.serialNumber,
          tyreLabel: `${pos.currentTyre.tyreBrand} ${pos.currentTyre.tyreModel}`,
          treadDepth: pos.currentTyre.tyreTreadDepth,
          targetPositionId: '',
        });
      }
    }
  }

  return { occupied, all };
}

/**
 * Find the best matching target position for a given source.
 * Returns the position ID or '' if no match.
 */
function findTarget(
  source: OccupiedPosition,
  all: AllPosition[],
  method: RotationMethod,
  occupied: OccupiedPosition[],
): string {
  const oppositeSide = source.side === 'LEFT' ? 'RIGHT' : 'LEFT';

  if (method === 'FRONT_TO_BACK') {
    // Steer → first available Drive on same side/slot; Drive → Steer on same side/slot
    const targetAxleType = source.axleType === 'STEER' ? 'DRIVE' : 'STEER';
    const match = all.find(
      (p) =>
        p.axleType === targetAxleType &&
        p.side === source.side &&
        p.slot === source.slot,
    );
    return match?.id ?? '';
  }

  if (method === 'CROSS') {
    // Steer → Drive on opposite side/same slot; Drive → Steer on same side/same slot
    if (source.axleType === 'STEER') {
      const match = all.find(
        (p) =>
          p.axleType === 'DRIVE' &&
          p.side === oppositeSide &&
          p.slot === source.slot,
      );
      return match?.id ?? '';
    }
    // Drive → Steer same side
    const match = all.find(
      (p) =>
        p.axleType === 'STEER' &&
        p.side === source.side &&
        p.slot === source.slot,
    );
    return match?.id ?? '';
  }

  if (method === 'SIDE_TO_SIDE') {
    // Same axle, opposite side, same slot
    const match = all.find(
      (p) =>
        p.axleName === source.axleName &&
        p.side === oppositeSide &&
        p.slot === source.slot,
    );
    return match?.id ?? '';
  }

  // CUSTOM – no auto-assignment
  return '';
}

function applyAutoRotation(
  occupied: OccupiedPosition[],
  all: AllPosition[],
  method: RotationMethod,
): OccupiedPosition[] {
  return occupied.map((pos) => ({
    ...pos,
    targetPositionId: findTarget(pos, all, method, occupied),
  }));
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

export function RotateTyresDrawer({
  open,
  onOpenChange,
  truckId,
  registrationNumber,
  currentOdometer,
  tyrePositions,
  onComplete,
}: RotateTyresDrawerProps) {
  const [method, setMethod] = useState<RotationMethod>('FRONT_TO_BACK');
  const [odometer, setOdometer] = useState(currentOdometer?.toString() ?? '');
  const [notes, setNotes] = useState('');
  const [rotationRows, setRotationRows] = useState<OccupiedPosition[]>([]);
  const [allPositions, setAllPositions] = useState<AllPosition[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Build position data from the passed prop
  useEffect(() => {
    if (!open) return;

    setSubmitError(null);
    setSubmitSuccess(null);
    setNotes('');
    setOdometer(currentOdometer?.toString() ?? '');
    setMethod('FRONT_TO_BACK');

    if (!tyrePositions || tyrePositions.axles.length === 0) {
      setRotationRows([]);
      setAllPositions([]);
      return;
    }

    const { occupied, all } = buildPositionMap(tyrePositions.axles);
    setAllPositions(all);
    // Apply default method
    setRotationRows(applyAutoRotation(occupied, all, 'FRONT_TO_BACK'));
  }, [open, tyrePositions, currentOdometer]);

  // When method changes, re-apply auto-rotation
  const handleMethodChange = useCallback(
    (newMethod: RotationMethod) => {
      setMethod(newMethod);
      setSubmitError(null);
      setSubmitSuccess(null);

      if (newMethod === 'CUSTOM') {
        // Clear all targets so user can manually pick
        setRotationRows((prev) =>
          prev.map((row) => ({ ...row, targetPositionId: '' })),
        );
      } else {
        setRotationRows((prev) => applyAutoRotation(prev, allPositions, newMethod));
      }
    },
    [allPositions],
  );

  // Handle manual target assignment (CUSTOM mode)
  const handleTargetChange = useCallback((positionId: string, targetId: string) => {
    setRotationRows((prev) =>
      prev.map((row) =>
        row.id === positionId ? { ...row, targetPositionId: targetId } : row,
      ),
    );
  }, []);

  // Compute valid rotation moves (where source ≠ target and target is selected)
  const validMoves = useMemo<RotationMove[]>(() => {
    return rotationRows
      .filter((row) => row.targetPositionId && row.targetPositionId !== row.id)
      .map((row) => ({
        fromPositionId: row.id,
        toPositionId: row.targetPositionId,
      }));
  }, [rotationRows]);

  // Positions that are already used as targets (to prevent duplicates)
  const usedTargetIds = useMemo(
    () => new Set(rotationRows.map((r) => r.targetPositionId).filter(Boolean)),
    [rotationRows],
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

    if (validMoves.length === 0) {
      setSubmitError('No valid rotation moves configured. Please assign target positions.');
      return;
    }

    // Validate no duplicate targets
    const targetIds = validMoves.map((m) => m.toPositionId);
    if (new Set(targetIds).size !== targetIds.length) {
      setSubmitError('Multiple tyres cannot move to the same position. Please fix duplicate targets.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await tyresService.rotateTyres({
        truckId,
        odometerReading: odo,
        method,
        rotations: validMoves,
        notes: notes.trim() || undefined,
      });

      setSubmitSuccess(
        `Successfully rotated ${result.rotationCount} tyre${result.rotationCount !== 1 ? 's' : ''}.`,
      );

      // Close after a short delay so user sees the success message
      setTimeout(() => {
        onOpenChange(false);
        onComplete();
      }, 1200);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to rotate tyres.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [odometer, validMoves, truckId, method, notes, onOpenChange, onComplete]);

  if (!open) return null;

  const noOccupied = rotationRows.length === 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Rotate Tyres
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {registrationNumber} · Current odometer: {currentOdometer?.toLocaleString() ?? '—'} km
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {noOccupied ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <AlertCircle className="h-8 w-8 mb-3 text-gray-400" />
              <p className="text-sm font-medium">No tyres mounted</p>
              <p className="text-xs mt-1">Mount tyres first before rotating them.</p>
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

              {/* Settings row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Odometer Reading (km) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter current odometer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any observations…"
                  />
                </div>
              </div>

              {/* Method selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rotation Pattern
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {METHOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleMethodChange(opt.value)}
                      className={`text-left p-3 rounded-lg border-2 transition-all ${
                        method === opt.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span className="text-xs font-semibold text-gray-900 block">
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-gray-500 mt-0.5 block leading-tight">
                        {opt.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation plan */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Rotation Plan
                  </h3>
                  <Badge variant="outline" className="text-[10px]">
                    {validMoves.length} move{validMoves.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                          Current Position
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                          Tyre
                        </th>
                        <th className="px-4 py-2.5 text-right font-medium text-gray-600">
                          Tread
                        </th>
                        <th className="px-4 py-2.5 text-center font-medium text-gray-600 w-10">
                          {/* arrow */}
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                          Target Position
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rotationRows
                        .sort((a, b) => a.axleIndex - b.axleIndex || a.side.localeCompare(b.side))
                        .map((row) => {
                          const targetPos = allPositions.find(
                            (p) => p.id === row.targetPositionId,
                          );
                          return (
                            <tr
                              key={row.id}
                              className="border-b border-gray-50 hover:bg-gray-50/50"
                            >
                              <td className="px-4 py-2.5">
                                <div className="font-medium text-gray-900">
                                  {row.positionCode}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {row.axleName} · {row.side} {row.slot}
                                </div>
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="font-mono text-xs text-blue-600">
                                  {row.tyreSerial}
                                </span>
                                <div className="text-xs text-gray-500">
                                  {row.tyreLabel}
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                {row.treadDepth != null ? (
                                  <span
                                    className={`font-medium text-xs ${treadColor(row.treadDepth)}`}
                                  >
                                    {row.treadDepth} mm
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <ArrowRight className="h-4 w-4 text-gray-400 mx-auto" />
                              </td>
                              <td className="px-4 py-2.5">
                                {method === 'CUSTOM' ? (
                                  <select
                                    value={row.targetPositionId}
                                    onChange={(e) =>
                                      handleTargetChange(row.id, e.target.value)
                                    }
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isSubmitting}
                                  >
                                    <option value="">Select target…</option>
                                    {allPositions
                                      .filter(
                                        (p) =>
                                          p.id !== row.id &&
                                          (!usedTargetIds.has(p.id) ||
                                            p.id === row.targetPositionId),
                                      )
                                      .map((p) => (
                                        <option key={p.id} value={p.id}>
                                          {p.positionCode} — {p.axleName} ({p.side}{' '}
                                          {p.slot})
                                        </option>
                                      ))}
                                  </select>
                                ) : targetPos ? (
                                  <div>
                                    <span className="font-medium text-gray-900">
                                      {targetPos.positionCode}
                                    </span>
                                    <div className="text-xs text-gray-500">
                                      {targetPos.axleName} · {targetPos.side}{' '}
                                      {targetPos.slot}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-amber-600 italic">
                                    No matching position
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card layout */}
                <div className="sm:hidden space-y-2">
                  {rotationRows
                    .sort((a, b) => a.axleIndex - b.axleIndex || a.side.localeCompare(b.side))
                    .map((row) => {
                      const targetPos = allPositions.find(
                        (p) => p.id === row.targetPositionId,
                      );
                      return (
                        <div
                          key={row.id}
                          className="rounded-lg border border-gray-200 p-3 bg-white"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-xs font-semibold text-gray-900">
                                {row.positionCode}
                              </span>
                              <span className="text-[10px] text-gray-500 ml-1">
                                {row.axleName}
                              </span>
                            </div>
                            {row.treadDepth != null && (
                              <span
                                className={`text-[10px] font-medium ${treadColor(row.treadDepth)}`}
                              >
                                {row.treadDepth} mm
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-blue-600 font-mono mb-2">
                            {row.tyreSerial}{' '}
                            <span className="text-gray-400 font-sans">
                              {row.tyreLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
                            {method === 'CUSTOM' ? (
                              <select
                                value={row.targetPositionId}
                                onChange={(e) =>
                                  handleTargetChange(row.id, e.target.value)
                                }
                                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isSubmitting}
                              >
                                <option value="">Select target…</option>
                                {allPositions
                                  .filter(
                                    (p) =>
                                      p.id !== row.id &&
                                      (!usedTargetIds.has(p.id) ||
                                        p.id === row.targetPositionId),
                                  )
                                  .map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.positionCode} — {p.axleName}
                                    </option>
                                  ))}
                              </select>
                            ) : targetPos ? (
                              <span className="text-xs font-medium text-gray-900">
                                {targetPos.positionCode}{' '}
                                <span className="text-gray-500 font-normal">
                                  ({targetPos.axleName})
                                </span>
                              </span>
                            ) : (
                              <span className="text-xs text-amber-600 italic">
                                No match
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
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
            onClick={handleConfirm}
            disabled={isSubmitting || noOccupied || validMoves.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Rotating…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Confirm Rotation ({validMoves.length})
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
