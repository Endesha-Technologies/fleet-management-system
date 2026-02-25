'use client';

// ---------------------------------------------------------------------------
// Plan Detail + Complete Maintenance page
// ---------------------------------------------------------------------------
// Shows full plan details, allows completing maintenance (inline form),
// activating/deactivating the plan, and lists past service logs.
// ---------------------------------------------------------------------------

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Truck,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  Gauge,
  Calendar,
  Clock,
  ToggleLeft,
  ToggleRight,
  Loader2,
  FileText,
  CheckCircle2,
  DollarSign,
  User,
  StickyNote,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { maintenanceService } from '@/api/maintenance';
import { usePlanDetail } from '../../_hooks';
import type { MaintenanceTaskType, CompletePlanRequest, ServiceLog } from '../../_types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtOdometer(km: number | null): string {
  if (km == null) return '—';
  return `${km.toLocaleString()} km`;
}

function fmtCurrency(value: number): string {
  if (!value) return '—';
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(value);
}

function fmtInterval(km: number | null | undefined, days: number | null | undefined): string {
  const parts: string[] = [];
  if (km != null) parts.push(`${km.toLocaleString()} km`);
  if (days != null) parts.push(`${days} days`);
  return parts.length > 0 ? parts.join(' / ') : '—';
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** Check if the plan is overdue by date or odometer. */
function isOverdue(
  nextServiceDate: string | null,
  nextServiceOdometer: number | null,
  currentOdometer?: number,
): boolean {
  const now = new Date();
  if (nextServiceDate && new Date(nextServiceDate) < now) return true;
  if (
    nextServiceOdometer != null &&
    currentOdometer != null &&
    nextServiceOdometer < currentOdometer
  )
    return true;
  return false;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function PulseLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <PulseLine className="h-8 w-8 rounded-md" />
        <div className="space-y-2">
          <PulseLine className="h-6 w-48" />
          <PulseLine className="h-4 w-32" />
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <PulseLine className="h-4 w-36" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <PulseLine key={i} className="h-4 w-28" />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <PulseLine className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <PulseLine key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Type badge
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
// Detail field
// ---------------------------------------------------------------------------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{children}</dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: plan, isLoading, error, refetch } = usePlanDetail(id);

  // Toggle active state
  const [toggling, setToggling] = useState(false);

  // Complete maintenance form
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completeForm, setCompleteForm] = useState({
    serviceDate: todayISO(),
    odometerAtService: '',
    cost: '',
    serviceProviderName: '',
    summary: '',
    notes: '',
  });

  async function toggleActive() {
    if (!plan) return;
    try {
      setToggling(true);
      await maintenanceService.updatePlan(id, { isActive: !plan.isActive });
      refetch();
    } catch {
      // silently fail — user can retry
    } finally {
      setToggling(false);
    }
  }

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    if (!plan) return;

    const data: CompletePlanRequest = {
      serviceDate: completeForm.serviceDate,
      odometerAtService: Number(completeForm.odometerAtService),
    };
    if (completeForm.cost) data.cost = Number(completeForm.cost);
    if (completeForm.serviceProviderName) data.serviceProviderName = completeForm.serviceProviderName;
    if (completeForm.summary) data.summary = completeForm.summary;
    if (completeForm.notes) data.notes = completeForm.notes;

    try {
      setCompleting(true);
      setCompleteError(null);
      await maintenanceService.completePlan(id, data);
      setShowCompleteForm(false);
      setCompleteForm({
        serviceDate: todayISO(),
        odometerAtService: '',
        cost: '',
        serviceProviderName: '',
        summary: '',
        notes: '',
      });
      refetch();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to complete maintenance';
      setCompleteError(message);
    } finally {
      setCompleting(false);
    }
  }

  // ---- Loading / error states ----
  if (isLoading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          href="/maintenance/plans"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Plans
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const overdue =
    plan.isActive &&
    isOverdue(plan.nextServiceDate, plan.nextServiceOdometer, plan.truck.currentOdometer);

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/maintenance/plans">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {plan.truck.registrationNumber}
              </h1>
              <span className="text-lg text-gray-400">·</span>
              <span className="text-lg text-gray-600">{plan.schedule.name}</span>
              <Badge variant={plan.isActive ? 'success' : 'secondary'}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {overdue && (
                <Badge variant="destructive">Overdue</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Plan details and service history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {plan.isActive && (
            <Button
              variant="default"
              onClick={() => setShowCompleteForm((v) => !v)}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {showCompleteForm ? 'Cancel' : 'Complete Maintenance'}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={toggleActive}
            disabled={toggling}
            className="gap-2"
          >
            {toggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : plan.isActive ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            {plan.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      {/* ---- Plan Details Card ---- */}
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Plan Details</h2>

        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {/* Truck info */}
          <Field label="Truck">
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-gray-400" />
              {plan.truck.registrationNumber}
            </span>
            {(plan.truck.make || plan.truck.model) && (
              <span className="block text-xs text-gray-500">
                {[plan.truck.make, plan.truck.model].filter(Boolean).join(' ')}
              </span>
            )}
          </Field>

          <Field label="Current Odometer">
            <span className="flex items-center gap-1">
              <Gauge className="h-4 w-4 text-gray-400" />
              {plan.truck.currentOdometer != null
                ? fmtOdometer(plan.truck.currentOdometer)
                : '—'}
            </span>
          </Field>

          {/* Schedule info */}
          <Field label="Schedule">
            <span className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-gray-400" />
              {plan.schedule.name}
            </span>
            {plan.schedule.taskType && (
              <span className="block mt-1">
                <TypeBadge type={plan.schedule.taskType} />
              </span>
            )}
          </Field>

          <Field label="Schedule Interval">
            <span className="flex items-center gap-1">
              {plan.schedule.intervalKm != null && <Gauge className="h-4 w-4 text-gray-400" />}
              {plan.schedule.intervalDays != null && <Calendar className="h-4 w-4 text-gray-400" />}
              {fmtInterval(plan.schedule.intervalKm, plan.schedule.intervalDays)}
            </span>
          </Field>

          {plan.schedule.estimatedDurationHours != null && (
            <Field label="Estimated Duration">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-400" />
                {plan.schedule.estimatedDurationHours < 1
                  ? `${Math.round(plan.schedule.estimatedDurationHours * 60)} min`
                  : `${plan.schedule.estimatedDurationHours} hr${plan.schedule.estimatedDurationHours !== 1 ? 's' : ''}`}
              </span>
            </Field>
          )}

          {/* Next service */}
          <Field label="Next Service Date">
            <span
              className={`flex items-center gap-1 ${
                overdue && plan.nextServiceDate ? 'text-red-600 font-medium' : ''
              }`}
            >
              <Calendar className="h-4 w-4 text-gray-400" />
              {fmtDate(plan.nextServiceDate)}
            </span>
          </Field>

          <Field label="Next Service Odometer">
            <span
              className={`flex items-center gap-1 ${
                overdue && plan.nextServiceOdometer != null ? 'text-red-600 font-medium' : ''
              }`}
            >
              <Gauge className="h-4 w-4 text-gray-400" />
              {fmtOdometer(plan.nextServiceOdometer)}
            </span>
          </Field>

          {/* Last service */}
          <Field label="Last Service Date">
            {fmtDate(plan.lastServiceDate)}
          </Field>

          <Field label="Last Service Odometer">
            {fmtOdometer(plan.lastServiceOdometer)}
          </Field>

          {/* Dates */}
          <Field label="Created">
            {fmtDate(plan.createdAt)}
          </Field>

          <Field label="Updated">
            {fmtDate(plan.updatedAt)}
          </Field>
        </dl>

        {/* Notes */}
        {plan.notes && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Notes
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {plan.notes}
            </p>
          </div>
        )}
      </div>

      {/* ---- Complete Maintenance Form ---- */}
      {showCompleteForm && (
        <div className="rounded-xl border border-green-200 shadow-sm bg-green-50/50 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Complete Maintenance
          </h2>

          <form onSubmit={handleComplete} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Service Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={completeForm.serviceDate}
                  onChange={(e) =>
                    setCompleteForm((f) => ({ ...f, serviceDate: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Odometer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Odometer at Service <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="km"
                    value={completeForm.odometerAtService}
                    onChange={(e) =>
                      setCompleteForm((f) => ({
                        ...f,
                        odometerAtService: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost (optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={completeForm.cost}
                    onChange={(e) =>
                      setCompleteForm((f) => ({ ...f, cost: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Service Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Provider (optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Provider name"
                    value={completeForm.serviceProviderName}
                    onChange={(e) =>
                      setCompleteForm((f) => ({
                        ...f,
                        serviceProviderName: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary (optional)
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of work performed…"
                value={completeForm.summary}
                onChange={(e) =>
                  setCompleteForm((f) => ({ ...f, summary: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                rows={2}
                placeholder="Additional notes…"
                value={completeForm.notes}
                onChange={(e) =>
                  setCompleteForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Error */}
            {completeError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {completeError}
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCompleteForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={completing || !completeForm.serviceDate || !completeForm.odometerAtService}
              >
                {completing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Maintenance
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ---- Service Logs ---- */}
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-400" />
          Service Logs
          <span className="text-sm font-normal text-gray-500">
            ({plan.serviceLogs.length})
          </span>
        </h2>

        {plan.serviceLogs.length === 0 ? (
          <div className="py-8 text-center">
            <StickyNote className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              No service logs recorded yet.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Odometer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Summary
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {plan.serviceLogs.map((log: ServiceLog) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {fmtDate(log.serviceDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {fmtOdometer(log.odometerAtService)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {fmtCurrency(log.cost)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {log.serviceProviderName || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[300px] truncate">
                        {log.summary || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {plan.serviceLogs.map((log: ServiceLog) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-gray-100 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {fmtDate(log.serviceDate)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {fmtOdometer(log.odometerAtService)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>
                      <span className="block text-gray-400">Cost</span>
                      {fmtCurrency(log.cost)}
                    </div>
                    <div>
                      <span className="block text-gray-400">Provider</span>
                      {log.serviceProviderName || '—'}
                    </div>
                  </div>
                  {log.summary && (
                    <p className="text-xs text-gray-600 truncate">{log.summary}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
