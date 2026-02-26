'use client';

// ---------------------------------------------------------------------------
// Edit Maintenance Schedule — form page
// ---------------------------------------------------------------------------
// Loads an existing schedule, pre-populates the form, and only sends changed
// fields to the API via maintenanceService.updateSchedule().
// ---------------------------------------------------------------------------

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { maintenanceService } from '@/api/maintenance';
import { useScheduleDetail } from '../../../_hooks';
import type {
  MaintenanceTaskType,
  UpdateScheduleRequest,
  MaintenanceScheduleDetail,
} from '../../../_types';

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface FormState {
  name: string;
  taskType: MaintenanceTaskType;
  intervalKm: string;
  intervalDays: string;
  estimatedDurationHours: string;
  applicableTruckMakes: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scheduleToForm(s: MaintenanceScheduleDetail): FormState {
  return {
    name: s.name,
    taskType: s.taskType,
    intervalKm: s.intervalKm != null ? String(s.intervalKm) : '',
    intervalDays: s.intervalDays != null ? String(s.intervalDays) : '',
    estimatedDurationHours:
      s.estimatedDurationHours != null
        ? String(s.estimatedDurationHours)
        : '',
    applicableTruckMakes: s.applicableTruckMakes ?? '',
    notes: s.notes ?? '',
  };
}

function buildDiff(
  original: FormState,
  current: FormState,
): UpdateScheduleRequest {
  const diff: UpdateScheduleRequest = {};

  if (current.name.trim() !== original.name.trim()) {
    diff.name = current.name.trim();
  }
  if (current.taskType !== original.taskType) {
    diff.taskType = current.taskType;
  }
  if (current.intervalKm !== original.intervalKm) {
    diff.intervalKm = current.intervalKm ? Number(current.intervalKm) : undefined;
  }
  if (current.intervalDays !== original.intervalDays) {
    diff.intervalDays = current.intervalDays
      ? Number(current.intervalDays)
      : undefined;
  }
  if (current.estimatedDurationHours !== original.estimatedDurationHours) {
    diff.estimatedDurationHours = current.estimatedDurationHours
      ? Number(current.estimatedDurationHours)
      : undefined;
  }
  if (
    current.applicableTruckMakes.trim() !==
    original.applicableTruckMakes.trim()
  ) {
    diff.applicableTruckMakes =
      current.applicableTruckMakes.trim() || undefined;
  }
  if (current.notes.trim() !== original.notes.trim()) {
    diff.notes = current.notes.trim() || undefined;
  }

  return diff;
}

// ---------------------------------------------------------------------------
// Skeleton (loading state)
// ---------------------------------------------------------------------------

function PulseLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

function EditSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <PulseLine className="h-8 w-8 rounded-md" />
        <div className="space-y-2">
          <PulseLine className="h-6 w-48" />
          <PulseLine className="h-4 w-64" />
        </div>
      </div>
      {/* Form card skeleton */}
      <div className="rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <PulseLine className="h-4 w-24" />
            <PulseLine className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EditSchedulePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: schedule, isLoading, error: fetchError } = useScheduleDetail(id);

  const [form, setForm] = useState<FormState | null>(null);
  const initialFormRef = useRef<FormState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-populate form when schedule loads
  useEffect(() => {
    if (schedule && !initialFormRef.current) {
      const initial = scheduleToForm(schedule);
      initialFormRef.current = initial;
      setForm({ ...initial });
    }
  }, [schedule]);

  // Generic change handler
  function onChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm((prev) =>
      prev ? { ...prev, [e.target.name]: e.target.value } : prev,
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form || !initialFormRef.current) return;

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    const diff = buildDiff(initialFormRef.current, form);

    // Nothing changed — just go back
    if (Object.keys(diff).length === 0) {
      router.push(`/maintenance/schedules/${id}`);
      return;
    }

    try {
      setSubmitting(true);
      await maintenanceService.updateSchedule(id, diff);
      router.push(`/maintenance/schedules/${id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update schedule.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------

  if (isLoading) return <EditSkeleton />;

  if (fetchError) {
    return (
      <div className="space-y-4">
        <Link
          href="/maintenance/schedules"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Schedules
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {fetchError}
        </div>
      </div>
    );
  }

  if (!form) return null;

  // ---------------------------------------------------------------------------
  // Field styling helpers
  // ---------------------------------------------------------------------------

  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const inputCls =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50';
  const selectCls =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50';

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex items-center gap-3">
        <Link href="/maintenance/schedules">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Edit Schedule
          </h1>
          <p className="text-sm text-gray-500">
            Update the details of this maintenance rule.
          </p>
        </div>
      </div>

      {/* ---- Error banner ---- */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ---- Form ---- */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 space-y-5"
      >
        {/* Name */}
        <div>
          <label htmlFor="name" className={labelCls}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Oil Change"
            value={form.name}
            onChange={onChange}
            disabled={submitting}
            className={inputCls}
          />
        </div>

        {/* Task Type */}
        <div>
          <label htmlFor="taskType" className={labelCls}>
            Task Type <span className="text-red-500">*</span>
          </label>
          <select
            id="taskType"
            name="taskType"
            value={form.taskType}
            onChange={onChange}
            disabled={submitting}
            className={selectCls}
          >
            <option value="PREVENTIVE">Preventive</option>
            <option value="CORRECTIVE">Corrective</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="INSPECTION">Inspection</option>
          </select>
        </div>

        {/* Intervals row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="intervalKm" className={labelCls}>
              Interval (km)
            </label>
            <input
              id="intervalKm"
              name="intervalKm"
              type="number"
              min={0}
              placeholder="e.g. 10000"
              value={form.intervalKm}
              onChange={onChange}
              disabled={submitting}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="intervalDays" className={labelCls}>
              Interval (days)
            </label>
            <input
              id="intervalDays"
              name="intervalDays"
              type="number"
              min={0}
              placeholder="e.g. 90"
              value={form.intervalDays}
              onChange={onChange}
              disabled={submitting}
              className={inputCls}
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="estimatedDurationHours" className={labelCls}>
            Estimated Duration (hours)
          </label>
          <input
            id="estimatedDurationHours"
            name="estimatedDurationHours"
            type="number"
            min={0}
            step={0.25}
            placeholder="e.g. 2"
            value={form.estimatedDurationHours}
            onChange={onChange}
            disabled={submitting}
            className={inputCls}
          />
        </div>

        {/* Applicable Truck Makes */}
        <div>
          <label htmlFor="applicableTruckMakes" className={labelCls}>
            Applicable Truck Makes
          </label>
          <input
            id="applicableTruckMakes"
            name="applicableTruckMakes"
            type="text"
            placeholder="e.g. Volvo, Scania, MAN"
            value={form.applicableTruckMakes}
            onChange={onChange}
            disabled={submitting}
            className={inputCls}
          />
          <p className="mt-1 text-xs text-gray-400">
            Comma-separated list of makes
          </p>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className={labelCls}>
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Additional notes…"
            value={form.notes}
            onChange={onChange}
            disabled={submitting}
            className={inputCls}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={`/maintenance/schedules/${id}`}>
            <Button type="button" variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
