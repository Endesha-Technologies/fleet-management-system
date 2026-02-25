'use client';

// ---------------------------------------------------------------------------
// Create Maintenance Schedule — form page
// ---------------------------------------------------------------------------
// Submits a new schedule rule via maintenanceService.createSchedules().
// ---------------------------------------------------------------------------

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarClock,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { maintenanceService } from '@/api/maintenance';
import type { CreateScheduleInput, MaintenanceTaskType } from '../../_types';

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface FormState {
  name: string;
  description: string;
  taskType: MaintenanceTaskType;
  intervalKm: string;
  intervalDays: string;
  estimatedDurationHours: string;
  applicableTruckMakes: string;
  notes: string;
}

const INITIAL: FormState = {
  name: '',
  description: '',
  taskType: 'PREVENTIVE',
  intervalKm: '',
  intervalDays: '',
  estimatedDurationHours: '',
  applicableTruckMakes: '',
  notes: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CreateSchedulePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generic change handler
  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    const payload: CreateScheduleInput = {
      name: form.name.trim(),
      taskType: form.taskType,
    };

    if (form.description.trim()) payload.description = form.description.trim();
    if (form.intervalKm) payload.intervalKm = Number(form.intervalKm);
    if (form.intervalDays) payload.intervalDays = Number(form.intervalDays);
    if (form.estimatedDurationHours)
      payload.estimatedDurationHours = Number(form.estimatedDurationHours);
    if (form.applicableTruckMakes.trim())
      payload.applicableTruckMakes = form.applicableTruckMakes.trim();
    if (form.notes.trim()) payload.notes = form.notes.trim();

    try {
      setSubmitting(true);
      await maintenanceService.createSchedules({ schedules: [payload] });
      router.push('/maintenance/schedules');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create schedule.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Field styling helpers
  // ---------------------------------------------------------------------------

  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const inputCls =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50';
  const selectCls =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* ---- Header ---- */}
      <div className="flex items-center gap-3">
        <Link href="/maintenance/schedules">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Create Schedule
          </h1>
          <p className="text-sm text-gray-500">
            Define a new maintenance rule template.
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

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelCls}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Brief description of this maintenance task…"
            value={form.description}
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
          <p className="mt-1 text-xs text-gray-400">Comma-separated list of makes</p>
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
          <Link href="/maintenance/schedules">
            <Button type="button" variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? 'Creating…' : 'Create Schedule'}
          </Button>
        </div>
      </form>
    </div>
  );
}
