'use client';

// ---------------------------------------------------------------------------
// Assign Maintenance Plans — form page
// ---------------------------------------------------------------------------
// Allows assigning one or more maintenance schedules to a specific truck.
// Fetches trucks and schedules on mount, builds an AssignPlansRequest, and
// submits via maintenanceService.assignPlans().
// ---------------------------------------------------------------------------

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Truck,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  Gauge,
  Calendar,
  Plus,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { maintenanceService } from '@/api/maintenance';
import { trucksService } from '@/api/trucks';

import type { MaintenanceScheduleListItem } from '@/api/maintenance';
import type { Truck as TruckType } from '@/api/trucks';
import type { AssignPlansRequest, AssignPlanInput, MaintenanceTaskType } from '../../_types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtInterval(km: number | null, days: number | null): string {
  const parts: string[] = [];
  if (km != null) parts.push(`${km.toLocaleString()} km`);
  if (days != null) parts.push(`${days} days`);
  return parts.length > 0 ? parts.join(' / ') : '—';
}

// ---------------------------------------------------------------------------
// Per-schedule form state
// ---------------------------------------------------------------------------

interface ScheduleSelection {
  scheduleId: string;
  lastServiceDate: string;
  lastServiceOdometer: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Type badge (small helper)
// ---------------------------------------------------------------------------

function TypeBadge({ type }: { type?: MaintenanceTaskType }) {
  if (!type) return null;
  return type === 'PREVENTIVE' ? (
    <Badge variant="info" className="gap-1">
      <Wrench className="h-3 w-3" />
      Preventive
    </Badge>
  ) : (
    <Badge variant="warning" className="gap-1">
      <ClipboardCheck className="h-3 w-3" />
      Inspection
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function PulseLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 space-y-4">
        <PulseLine className="h-5 w-32" />
        <PulseLine className="h-10 w-full" />
      </div>
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 space-y-4">
        <PulseLine className="h-5 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <PulseLine key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AssignPlansPage() {
  const router = useRouter();

  // Data fetching state
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceScheduleListItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [truckId, setTruckId] = useState('');
  const [selections, setSelections] = useState<ScheduleSelection[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch trucks & schedules on mount
  useEffect(() => {
    async function load() {
      try {
        setIsLoadingData(true);
        const [trucksRes, schedulesRes] = await Promise.all([
          trucksService.getTrucks({ limit: 500 }),
          maintenanceService.getSchedules(),
        ]);
        setTrucks(trucksRes.data);
        setSchedules(schedulesRes.filter((s) => s.isActive));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load data';
        setLoadError(message);
      } finally {
        setIsLoadingData(false);
      }
    }
    load();
  }, []);

  // Add a schedule to selection
  function addSchedule(scheduleId: string) {
    if (selections.some((s) => s.scheduleId === scheduleId)) return;
    setSelections((prev) => [
      ...prev,
      { scheduleId, lastServiceDate: '', lastServiceOdometer: '', notes: '' },
    ]);
  }

  // Remove a schedule from selection
  function removeSchedule(scheduleId: string) {
    setSelections((prev) => prev.filter((s) => s.scheduleId !== scheduleId));
  }

  // Update a schedule selection field
  function updateSelection(
    scheduleId: string,
    field: keyof Omit<ScheduleSelection, 'scheduleId'>,
    value: string,
  ) {
    setSelections((prev) =>
      prev.map((s) => (s.scheduleId === scheduleId ? { ...s, [field]: value } : s)),
    );
  }

  // Look up schedule by id
  function getSchedule(id: string): MaintenanceScheduleListItem | undefined {
    return schedules.find((s) => s.id === id);
  }

  // Available schedules (not yet selected)
  const availableSchedules = schedules.filter(
    (s) => !selections.some((sel) => sel.scheduleId === s.id),
  );

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!truckId || selections.length === 0) return;

    const plans: AssignPlanInput[] = selections.map((sel) => {
      const plan: AssignPlanInput = { scheduleId: sel.scheduleId };
      if (sel.lastServiceDate) plan.lastServiceDate = sel.lastServiceDate;
      if (sel.lastServiceOdometer)
        plan.lastServiceOdometer = Number(sel.lastServiceOdometer);
      if (sel.notes) plan.notes = sel.notes;
      return plan;
    });

    const data: AssignPlansRequest = { truckId, plans };

    try {
      setSubmitting(true);
      setSubmitError(null);
      await maintenanceService.assignPlans(data);
      router.push('/maintenance/plans');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to assign plans';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Loading / error for initial data ----
  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/maintenance/plans">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Assign Plans
            </h1>
            <p className="text-sm text-gray-500">Loading trucks and schedules…</p>
          </div>
        </div>
        <FormSkeleton />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <Link
          href="/maintenance/plans"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Plans
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex items-center gap-3">
        <Link href="/maintenance/plans">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Assign Plans
          </h1>
          <p className="text-sm text-gray-500">
            Assign maintenance schedules to a truck.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ---- Truck Selection ---- */}
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-gray-400" />
            Select Truck
          </h2>

          <select
            value={truckId}
            onChange={(e) => setTruckId(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Choose a truck…</option>
            {trucks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.registrationNumber} — {[t.make, t.model].filter(Boolean).join(' ')}
              </option>
            ))}
          </select>
        </div>

        {/* ---- Schedule Selection ---- */}
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-gray-400" />
            Select Schedules
          </h2>

          {/* Available schedules to add */}
          {availableSchedules.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Schedules
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableSchedules.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addSchedule(s.id)}
                    className="w-full text-left rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {s.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <TypeBadge type={s.taskType} />
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            {s.intervalKm != null && <Gauge className="h-3 w-3" />}
                            {s.intervalDays != null && <Calendar className="h-3 w-3" />}
                            {fmtInterval(s.intervalKm, s.intervalDays)}
                          </span>
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-blue-500 shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected schedules with per-schedule options */}
          {selections.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Schedules ({selections.length})
              </label>
              <div className="space-y-4">
                {selections.map((sel) => {
                  const schedule = getSchedule(sel.scheduleId);
                  return (
                    <div
                      key={sel.scheduleId}
                      className="rounded-lg border border-blue-200 bg-blue-50/50 p-4"
                    >
                      {/* Schedule header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {schedule?.name ?? sel.scheduleId}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {schedule?.taskType && (
                              <TypeBadge type={schedule.taskType} />
                            )}
                            {schedule && (
                              <span className="text-xs text-gray-500">
                                {fmtInterval(
                                  schedule.intervalKm ?? null,
                                  schedule.intervalDays ?? null,
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSchedule(sel.scheduleId)}
                          className="p-1 rounded hover:bg-red-100 transition-colors"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </div>

                      {/* Per-schedule options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Last Service Date (optional)
                          </label>
                          <input
                            type="date"
                            value={sel.lastServiceDate}
                            onChange={(e) =>
                              updateSelection(sel.scheduleId, 'lastServiceDate', e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Last Service Odometer (optional)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="km"
                            value={sel.lastServiceOdometer}
                            onChange={(e) =>
                              updateSelection(
                                sel.scheduleId,
                                'lastServiceOdometer',
                                e.target.value,
                              )
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Notes (optional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Additional notes…"
                          value={sel.notes}
                          onChange={(e) =>
                            updateSelection(sel.scheduleId, 'notes', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selections.length === 0 && availableSchedules.length === 0 && (
            <div className="py-8 text-center">
              <CalendarClock className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                No active schedules available.
              </p>
            </div>
          )}
        </div>

        {/* ---- Error ---- */}
        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* ---- Submit ---- */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/maintenance/plans">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting || !truckId || selections.length === 0}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign {selections.length > 0 ? `${selections.length} Plan${selections.length !== 1 ? 's' : ''}` : 'Plans'}
          </Button>
        </div>
      </form>
    </div>
  );
}
