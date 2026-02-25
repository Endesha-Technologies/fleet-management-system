'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { X, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tyresService } from '@/api/tyres/tyres.service';
import { assetsService } from '@/api/assets/assets.service';
import type { TyreAxlePositions, PositionSummary } from '@/api/tyres/tyres.types';
import type { AssetListItem } from '@/api/assets/assets.types';
import type { TyreAssignmentDialogProps } from '../../_types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PositionRow {
  /** API position ID */
  id: string;
  /** Human-readable label, e.g. "Front Steer – Left (Outer)" */
  label: string;
  /** Axle group for visual grouping */
  axleName: string;
  /** Side + slot */
  detail: string;
  /** The tyre size hint from the axle config */
  tyreSize: string;
  /** Whether a tyre is already mounted */
  status: 'EMPTY' | 'OCCUPIED';
  /** Currently mounted tyre info (if any) */
  currentTyre: string | null;
}

/** Tyre option for the select dropdown */
interface TyreOption {
  id: string;
  label: string;
  serialNumber: string;
  size: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TyreAssignmentDialog({
  open,
  onOpenChange,
  truckId,
  onComplete,
}: TyreAssignmentDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    occupied: number;
    empty: number;
  }>({ total: 0, occupied: 0, empty: 0 });

  // Available tyres from inventory
  const [availableTyres, setAvailableTyres] = useState<TyreOption[]>([]);
  const [isTyresLoading, setIsTyresLoading] = useState(false);

  // Mounting state: positionId → assetId
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [odometerReading, setOdometerReading] = useState('');
  const [isMounting, setIsMounting] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);
  const [mountSuccess, setMountSuccess] = useState<string | null>(null);

  // Compute which tyre IDs are already selected (for filtering from other dropdowns)
  const selectedTyreIds = useMemo(() => new Set(Object.values(selections).filter(Boolean)), [selections]);

  // Count of selections made
  const selectionCount = useMemo(() => Object.values(selections).filter(Boolean).length, [selections]);

  // --------------------------------------------------------------------------
  // Fetch tyre positions
  // --------------------------------------------------------------------------
  const fetchPositions = useCallback(async () => {
    if (!truckId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await tyresService.getTruckTyrePositions(truckId);

      const rows: PositionRow[] = [];
      for (const axle of data.axles) {
        for (const pos of axle.positions) {
          rows.push(mapPositionRow(axle, pos));
        }
      }

      setPositions(rows);
      setSummary({
        total: data.summary.totalPositions,
        occupied: data.summary.occupiedPositions,
        empty: data.summary.emptyPositions,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load tyre positions.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [truckId]);

  // --------------------------------------------------------------------------
  // Fetch available tyres from inventory
  // --------------------------------------------------------------------------
  const fetchAvailableTyres = useCallback(async () => {
    setIsTyresLoading(true);
    try {
      const data = await assetsService.getAssets({
        assetType: 'TYRE',
        status: 'IN_INVENTORY',
        limit: 200, // Fetch a large batch
      });

      const options: TyreOption[] = data.data.map((asset: AssetListItem) => ({
        id: asset.id,
        label: formatTyreLabel(asset),
        serialNumber: asset.serialNumber ?? '',
        size: asset.tyreSize ?? '',
      }));

      setAvailableTyres(options);
    } catch {
      // Non-critical – the user can still view positions, just can't mount
      setAvailableTyres([]);
    } finally {
      setIsTyresLoading(false);
    }
  }, []);

  // --------------------------------------------------------------------------
  // Initial load
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!open || !truckId) return;

    let cancelled = false;

    async function load() {
      await Promise.all([
        fetchPositions(),
        fetchAvailableTyres(),
      ]);
      if (cancelled) return;
    }

    // Reset state
    setSelections({});
    setOdometerReading('');
    setMountError(null);
    setMountSuccess(null);

    load();

    return () => {
      cancelled = true;
    };
  }, [open, truckId, fetchPositions, fetchAvailableTyres]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  const handleSelectTyre = useCallback((positionId: string, assetId: string) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (assetId) {
        next[positionId] = assetId;
      } else {
        delete next[positionId];
      }
      return next;
    });
    // Clear any previous success message on new selection
    setMountSuccess(null);
  }, []);

  const handleMount = useCallback(async () => {
    setMountError(null);
    setMountSuccess(null);

    const odometer = parseInt(odometerReading, 10);
    if (isNaN(odometer) || odometer < 0) {
      setMountError('Please enter a valid odometer reading.');
      return;
    }

    const mounts = Object.entries(selections)
      .filter(([, assetId]) => Boolean(assetId))
      .map(([positionId, assetId]) => ({
        positionId,
        assetId,
      }));

    if (mounts.length === 0) {
      setMountError('Please select at least one tyre to mount.');
      return;
    }

    setIsMounting(true);

    try {
      const result = await tyresService.mountTyres({
        truckId,
        odometerReading: odometer,
        mounts,
      });

      setMountSuccess(
        `Successfully mounted ${result.mountCount} tyre${result.mountCount !== 1 ? 's' : ''}.`,
      );

      // Reset selections and refresh positions
      setSelections({});
      await fetchPositions();
      // Refresh available tyres (mounted ones are no longer available)
      await fetchAvailableTyres();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to mount tyres.';
      setMountError(message);
    } finally {
      setIsMounting(false);
    }
  }, [selections, odometerReading, truckId, fetchPositions, fetchAvailableTyres]);

  const handleDone = useCallback(async () => {
    // If there are pending selections, mount them first before completing
    const mounts = Object.entries(selections)
      .filter(([, assetId]) => Boolean(assetId))
      .map(([positionId, assetId]) => ({
        positionId,
        assetId,
      }));

    if (mounts.length > 0) {
      const odometer = parseInt(odometerReading, 10);
      if (isNaN(odometer) || odometer < 0) {
        setMountError('Please enter a valid odometer reading before completing.');
        return;
      }

      setIsMounting(true);
      setMountError(null);

      try {
        await tyresService.mountTyres({
          truckId,
          odometerReading: odometer,
          mounts,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to mount tyres.';
        setMountError(message);
        setIsMounting(false);
        return;
      } finally {
        setIsMounting(false);
      }
    }

    onComplete();
  }, [onComplete, selections, odometerReading, truckId]);

  if (!open) return null;

  // Check if there are any empty positions
  const hasEmptyPositions = positions.some((p) => p.status === 'EMPTY');

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog — full-screen on mobile, centered card on larger screens */}
      <div className="fixed inset-0 sm:inset-4 bg-white sm:rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col sm:max-w-4xl sm:mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              Tyre Positions
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              View positions and mount tyres from your inventory.
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p className="text-sm">Loading tyre positions…</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 sm:p-6 max-w-md text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <p className="text-sm text-red-800 font-medium mb-1">
                  Could not load positions
                </p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Summary bar */}
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 sm:px-4 sm:py-3 mb-4 sm:mb-6">
                <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1 text-xs sm:text-sm">
                  <span className="font-medium text-blue-900">
                    {summary.total} position{summary.total !== 1 ? 's' : ''}
                  </span>
                  <span className="text-blue-700">
                    {summary.empty} empty
                  </span>
                  <span className="text-blue-700">
                    {summary.occupied} occupied
                  </span>
                </div>
              </div>

              {/* Mount success message */}
              {mountSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 sm:px-4 sm:py-3 mb-4 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="text-xs sm:text-sm text-green-800">{mountSuccess}</p>
                </div>
              )}

              {/* Mount error message */}
              {mountError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 sm:px-4 sm:py-3 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs sm:text-sm text-red-800">{mountError}</p>
                </div>
              )}

              {/* Positions — table on desktop, cards on mobile */}
              {positions.length > 0 ? (
                <>
                  {/* Desktop table (hidden on small screens) */}
                  <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left font-medium text-gray-700">
                            Position
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">
                            Axle
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">
                            Side / Slot
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">
                            Tyre Size
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">
                            {hasEmptyPositions ? 'Tyre / Mount' : 'Current Tyre'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((pos) => (
                          <tr
                            key={pos.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {pos.label}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {pos.axleName}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {pos.detail}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {pos.tyreSize || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  pos.status === 'EMPTY'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {pos.status === 'EMPTY' ? 'Empty' : 'Occupied'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {pos.status === 'OCCUPIED' ? (
                                <span className="text-gray-600">
                                  {pos.currentTyre || '—'}
                                </span>
                              ) : (
                                <TyreSelect
                                  positionId={pos.id}
                                  positionSize={pos.tyreSize}
                                  availableTyres={availableTyres}
                                  selectedTyreIds={selectedTyreIds}
                                  value={selections[pos.id] ?? ''}
                                  onChange={handleSelectTyre}
                                  isLoading={isTyresLoading}
                                  disabled={isMounting}
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile card layout (visible only on small screens) */}
                  <div className="sm:hidden space-y-3">
                    {positions.map((pos) => (
                      <div
                        key={pos.id}
                        className={`rounded-lg border p-3 ${
                          pos.status === 'EMPTY'
                            ? 'border-yellow-200 bg-yellow-50/30'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        {/* Card header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {pos.label}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              pos.status === 'EMPTY'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {pos.status === 'EMPTY' ? 'Empty' : 'Occupied'}
                          </span>
                        </div>

                        {/* Card details */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                          <span>{pos.axleName}</span>
                          <span>{pos.detail}</span>
                          {pos.tyreSize && <span>{pos.tyreSize}</span>}
                        </div>

                        {/* Tyre select or current tyre */}
                        {pos.status === 'OCCUPIED' ? (
                          <div className="text-xs text-gray-700 bg-gray-50 rounded px-2 py-1.5">
                            🛞 {pos.currentTyre || '—'}
                          </div>
                        ) : (
                          <TyreSelect
                            positionId={pos.id}
                            positionSize={pos.tyreSize}
                            availableTyres={availableTyres}
                            selectedTyreIds={selectedTyreIds}
                            value={selections[pos.id] ?? ''}
                            onChange={handleSelectTyre}
                            isLoading={isTyresLoading}
                            disabled={isMounting}
                            isMobile
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500 py-8 text-sm">
                  No tyre positions found for this truck.
                </p>
              )}

              {/* Odometer + Mount section */}
              {hasEmptyPositions && availableTyres.length > 0 && (
                <div className="mt-4 sm:mt-6 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1 sm:max-w-xs">
                      <label
                        htmlFor="odometer-reading"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                      >
                        Odometer Reading (km) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="odometer-reading"
                        type="number"
                        min="0"
                        value={odometerReading}
                        onChange={(e) => {
                          setOdometerReading(e.target.value);
                          setMountError(null);
                        }}
                        placeholder="e.g. 45000"
                        disabled={isMounting}
                        className="flex h-9 sm:h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <Button
                      onClick={handleMount}
                      disabled={selectionCount === 0 || isMounting}
                      className="bg-[#020887] hover:bg-[#020887]/90 text-white shrink-0 w-full sm:w-auto"
                    >
                      {isMounting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mounting…
                        </>
                      ) : (
                        `Mount ${selectionCount} Tyre${selectionCount !== 1 ? 's' : ''}`
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Help text when no tyres available */}
              {hasEmptyPositions && availableTyres.length === 0 && !isTyresLoading && (
                <div className="mt-4 sm:mt-6 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 sm:px-4 sm:py-3">
                  <p className="text-xs sm:text-sm text-amber-800">
                    No tyres found in inventory. Add tyres via the{' '}
                    <strong>Inventory</strong> page before mounting.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 sm:p-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-initial">
            Close
          </Button>
          <Button
            onClick={handleDone}
            className="bg-[#020887] hover:bg-[#020887]/90 text-white flex-1 sm:flex-initial"
          >
            Done
          </Button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// TyreSelect – dropdown for picking a tyre for a position
// ---------------------------------------------------------------------------

interface TyreSelectProps {
  positionId: string;
  positionSize: string;
  availableTyres: TyreOption[];
  selectedTyreIds: Set<string>;
  value: string;
  onChange: (positionId: string, assetId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  /** When true, renders full-width without min-width constraint */
  isMobile?: boolean;
}

function TyreSelect({
  positionId,
  positionSize,
  availableTyres,
  selectedTyreIds,
  value,
  onChange,
  isLoading,
  disabled,
  isMobile = false,
}: TyreSelectProps) {
  // Filter: show tyres not already selected elsewhere (unless it's the current selection)
  // Optionally prioritize matching tyre size
  const options = useMemo(() => {
    const matching: TyreOption[] = [];
    const other: TyreOption[] = [];

    for (const tyre of availableTyres) {
      // Skip if already selected for another position
      if (selectedTyreIds.has(tyre.id) && tyre.id !== value) continue;

      if (positionSize && tyre.size === positionSize) {
        matching.push(tyre);
      } else {
        other.push(tyre);
      }
    }

    return { matching, other };
  }, [availableTyres, selectedTyreIds, value, positionSize]);

  if (isLoading) {
    return <span className="text-xs text-gray-400">Loading…</span>;
  }

  if (availableTyres.length === 0) {
    return <span className="text-xs text-gray-400">No tyres available</span>;
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(positionId, e.target.value)}
      disabled={disabled}
      className={`w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
        isMobile ? '' : 'min-w-[200px]'
      }`}
    >
      <option value="">Select tyre…</option>
      {options.matching.length > 0 && (
        <optgroup label={`Matching size (${positionSize})`}>
          {options.matching.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </optgroup>
      )}
      {options.other.length > 0 && (
        <optgroup label={options.matching.length > 0 ? 'Other sizes' : 'Available tyres'}>
          {options.other.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapPositionRow(
  axle: TyreAxlePositions,
  pos: PositionSummary,
): PositionRow {
  const sideLabel = pos.side === 'LEFT' ? 'Left' : 'Right';
  const slotLabel = pos.slot === 'OUTER' ? 'Outer' : 'Inner';

  return {
    id: pos.id,
    label: pos.positionCode,
    axleName: axle.axleName,
    detail: `${sideLabel} · ${slotLabel}`,
    tyreSize: axle.tyreSize,
    status: pos.status,
    currentTyre: pos.currentTyre
      ? `${pos.currentTyre.serialNumber} (${pos.currentTyre.tyreBrand})`
      : null,
  };
}

function formatTyreLabel(asset: AssetListItem): string {
  const parts: string[] = [];
  if (asset.serialNumber) parts.push(asset.serialNumber);
  const brandModel = [asset.tyreBrand, asset.tyreModel].filter(Boolean).join(' ');
  if (brandModel) parts.push(brandModel);
  if (asset.tyreSize) parts.push(asset.tyreSize);
  return parts.join(' — ') || asset.name;
}
