'use client';

// ---------------------------------------------------------------------------
// Schedule Detail page
// ---------------------------------------------------------------------------
// Displays full details of a single maintenance schedule and its assigned
// plans. Allows toggling active/inactive.
// ---------------------------------------------------------------------------

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  Gauge,
  Calendar,
  Wrench,
  ClipboardCheck,
  ToggleLeft,
  ToggleRight,
  Loader2,
  FileText,
  Truck,
  Pencil,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { maintenanceService } from '@/api/maintenance';
import { useScheduleDetail } from '../../_hooks';
import type { MaintenanceTaskType, MaintenancePlan } from '../../_types';

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

function fmtInterval(km: number | null, days: number | null): string {
  const parts: string[] = [];
  if (km != null) parts.push(`${km.toLocaleString()} km`);
  if (days != null) parts.push(`${days} days`);
  return parts.length > 0 ? parts.join(' / ') : '—';
}

function fmtDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours} hr${hours !== 1 ? 's' : ''}`;
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
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <PulseLine className="h-8 w-8 rounded-md" />
        <div className="space-y-2">
          <PulseLine className="h-6 w-48" />
          <PulseLine className="h-4 w-32" />
        </div>
      </div>
      {/* Details card skeleton */}
      <div className="rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <PulseLine className="h-4 w-36" />
        <PulseLine className="h-4 w-64" />
        <div className="grid grid-cols-2 gap-4">
          <PulseLine className="h-4 w-28" />
          <PulseLine className="h-4 w-28" />
          <PulseLine className="h-4 w-28" />
          <PulseLine className="h-4 w-28" />
        </div>
        <PulseLine className="h-16 w-full" />
      </div>
      {/* Plans skeleton */}
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

function TypeBadge({ type }: { type: MaintenanceTaskType }) {
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

export default function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: schedule, isLoading, error, refetch } = useScheduleDetail(id);
  const [toggling, setToggling] = useState(false);

  async function toggleActive() {
    if (!schedule) return;
    try {
      setToggling(true);
      await maintenanceService.updateSchedule(id, { isActive: !schedule.isActive });
      refetch();
    } catch {
      // silently fail — user can retry
    } finally {
      setToggling(false);
    }
  }

  // ---- Loading / error states ----
  if (isLoading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/maintenance/schedules" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to Schedules
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!schedule) return null;

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/maintenance/schedules">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {schedule.name}
              </h1>
              <Badge variant={schedule.isActive ? 'success' : 'secondary'}>
                {schedule.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Schedule template details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/maintenance/schedules/${id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={toggleActive}
            disabled={toggling}
            className="gap-2"
          >
            {toggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : schedule.isActive ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            {schedule.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      {/* ---- Details card ---- */}
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Details</h2>

        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <Field label="Task Type">
            <TypeBadge type={schedule.taskType} />
          </Field>

          <Field label="Interval (km)">
            <span className="flex items-center gap-1">
              <Gauge className="h-4 w-4 text-gray-400" />
              {schedule.intervalKm != null
                ? `${schedule.intervalKm.toLocaleString()} km`
                : '—'}
            </span>
          </Field>

          <Field label="Interval (days)">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              {schedule.intervalDays != null ? `${schedule.intervalDays} days` : '—'}
            </span>
          </Field>

          <Field label="Estimated Duration">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-400" />
              {fmtDuration(schedule.estimatedDurationHours)}
            </span>
          </Field>

          <Field label="Applicable Makes">
            {schedule.applicableTruckMakes || '—'}
          </Field>

          <Field label="Created">
            {fmtDate(schedule.createdAt)}
          </Field>

          <Field label="Updated">
            {fmtDate(schedule.updatedAt)}
          </Field>
        </dl>

        {/* Description */}
        {schedule.description && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Description
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {schedule.description}
            </p>
          </div>
        )}

        {/* Notes */}
        {schedule.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Notes
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {schedule.notes}
            </p>
          </div>
        )}
      </div>

      {/* ---- Assigned Plans ---- */}
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-gray-400" />
          Assigned Plans
          <span className="text-sm font-normal text-gray-500">
            ({schedule.plans.length})
          </span>
        </h2>

        {schedule.plans.length === 0 ? (
          <div className="py-8 text-center">
            <Truck className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              No plans have been assigned to this schedule yet.
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
                      Truck
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Service Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Service Odometer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {schedule.plans.map((plan: MaintenancePlan) => (
                    <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Truck className="h-4 w-4 text-gray-400" />
                          {plan.truckId.slice(0, 8)}…
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {fmtDate(plan.lastServiceDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {fmtDate(plan.nextServiceDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {fmtOdometer(plan.nextServiceOdometer)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={plan.isActive ? 'success' : 'secondary'}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {schedule.plans.map((plan: MaintenancePlan) => (
                <div
                  key={plan.id}
                  className="rounded-lg border border-gray-100 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                      <Truck className="h-4 w-4 text-gray-400" />
                      {plan.truckId.slice(0, 8)}…
                    </span>
                    <Badge variant={plan.isActive ? 'success' : 'secondary'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>
                      <span className="block text-gray-400">Last Service</span>
                      {fmtDate(plan.lastServiceDate)}
                    </div>
                    <div>
                      <span className="block text-gray-400">Next Service</span>
                      {fmtDate(plan.nextServiceDate)}
                    </div>
                    <div>
                      <span className="block text-gray-400">Next Odometer</span>
                      {fmtOdometer(plan.nextServiceOdometer)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
