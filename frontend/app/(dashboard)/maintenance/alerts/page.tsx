'use client';

// ---------------------------------------------------------------------------
// Maintenance Alerts page
// ---------------------------------------------------------------------------
// Dedicated page showing all overdue + due-soon maintenance alerts with
// summary banner, colour-coded sections, and responsive table/card layout.
// ---------------------------------------------------------------------------

import Link from 'next/link';
import {
  AlertTriangle,
  Clock,
  Truck,
  Calendar,
  Gauge,
  Eye,
  CheckCircle2,
  Wrench,
  ClipboardCheck,
  Bell,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useAlerts } from '../_hooks';
import type { MaintenanceAlertItem, MaintenanceTaskType } from '../_types';

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

function fmtOdometer(km: number | null | undefined): string {
  if (km == null) return '—';
  return `${km.toLocaleString()} km`;
}

/** Format a delta (days or km) for display. */
function fmtDelta(item: MaintenanceAlertItem, mode: 'overdue' | 'dueSoon'): string {
  if (item.delta.days != null) {
    const d = Math.abs(item.delta.days);
    return `${d} ${d === 1 ? 'day' : 'days'}`;
  }
  if (item.delta.km != null) {
    const km = Math.abs(item.delta.km);
    return `${km.toLocaleString()} km`;
  }
  return '—';
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function PulseLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

function SummarySkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6">
      <div className="flex items-center gap-4">
        <PulseLine className="h-8 w-24" />
        <PulseLine className="h-4 w-1" />
        <PulseLine className="h-8 w-24" />
        <PulseLine className="h-4 w-1" />
        <PulseLine className="h-8 w-24" />
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50">
        <PulseLine className="h-5 w-40" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-4">
            <PulseLine className="h-4 w-32" />
            <PulseLine className="h-4 w-28" />
            <PulseLine className="h-4 w-24" />
            <PulseLine className="h-4 w-20" />
          </div>
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
// All clear state
// ---------------------------------------------------------------------------

function AllClearState() {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm p-12 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
      <h3 className="mt-4 text-lg font-semibold text-gray-900">All clear!</h3>
      <p className="mt-1 text-sm text-gray-500">
        No overdue or upcoming maintenance alerts. All trucks are up to date.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Alert table (desktop)
// ---------------------------------------------------------------------------

function AlertTable({
  items,
  mode,
}: {
  items: MaintenanceAlertItem[];
  mode: 'overdue' | 'dueSoon';
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Service Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Service Odo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Odo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {mode === 'overdue' ? 'Overdue By' : 'Due In'}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {items.map((item) => {
            return (
              <tr key={item.id} className="transition-colors hover:bg-gray-50">
                {/* Truck */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-gray-400 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.truck.registrationNumber}
                      </div>
                      {(item.truck.make || item.truck.model) && (
                        <div className="text-xs text-gray-500">
                          {[item.truck.make, item.truck.model].filter(Boolean).join(' ')}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Schedule */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.schedule.name}</div>
                  <TypeBadge type={item.schedule.taskType} />
                </td>

                {/* Next Service Date */}
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {fmtDate(item.nextServiceDate)}
                  </span>
                </td>

                {/* Next Service Odometer */}
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {fmtOdometer(item.nextServiceOdometer)}
                </td>

                {/* Current Odometer */}
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {fmtOdometer(item.truck.currentOdometer)}
                </td>

                {/* Days */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge
                    variant={mode === 'overdue' ? 'destructive' : 'warning'}
                    className="gap-1"
                  >
                    {mode === 'overdue' ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {fmtDelta(item, mode)}
                  </Badge>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link href={`/maintenance/plans/${item.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4 text-gray-500" />
                    </Button>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Alert cards (mobile)
// ---------------------------------------------------------------------------

function AlertCards({
  items,
  mode,
}: {
  items: MaintenanceAlertItem[];
  mode: 'overdue' | 'dueSoon';
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        return (
          <Link
            key={item.id}
            href={`/maintenance/plans/${item.id}`}
            className="block rounded-xl border border-gray-200 bg-white shadow-sm p-4 transition-colors hover:border-gray-300"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-gray-400 shrink-0" />
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {item.truck.registrationNumber}
                  </h3>
                </div>
                {(item.truck.make || item.truck.model) && (
                  <p className="text-xs text-gray-500 mt-0.5 ml-5.5">
                    {[item.truck.make, item.truck.model].filter(Boolean).join(' ')}
                  </p>
                )}
              </div>
              <Badge
                variant={mode === 'overdue' ? 'destructive' : 'warning'}
                className="gap-1 shrink-0"
              >
                {mode === 'overdue' ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {fmtDelta(item, mode)}
              </Badge>
            </div>

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-900">{item.schedule.name}</span>
              <TypeBadge type={item.schedule.taskType} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>
                <span className="block text-gray-400">Next Service</span>
                <span>{fmtDate(item.nextServiceDate)}</span>
              </div>
              <div>
                <span className="block text-gray-400">Next Odo</span>
                <span>{fmtOdometer(item.nextServiceOdometer)}</span>
              </div>
              <div>
                <span className="block text-gray-400">Current Odo</span>
                <span>{fmtOdometer(item.truck.currentOdometer)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function MaintenanceAlertsPage() {
  const { data: alerts, isLoading, error } = useAlerts();

  return (
    <div className="space-y-6">
      {/* ---- Error state ---- */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ---- Loading ---- */}
      {isLoading && (
        <div className="space-y-6">
          <SummarySkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
      )}

      {/* ---- Content ---- */}
      {!isLoading && !error && alerts && (
        <>
          {/* Summary banner */}
          <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-red-600">{alerts.summary.overdueCount}</p>
                  <p className="text-xs text-gray-500">Overdue</p>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-gray-200" />

              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="h-4 w-4 text-amber-600" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{alerts.summary.dueSoonCount}</p>
                  <p className="text-xs text-gray-500">Due Soon</p>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-gray-200" />

              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                  <Bell className="h-4 w-4 text-gray-600" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{alerts.summary.totalAlerts}</p>
                  <p className="text-xs text-gray-500">Total Alerts</p>
                </div>
              </div>
            </div>
          </div>

          {/* All clear */}
          {alerts.summary.totalAlerts === 0 && <AllClearState />}

          {/* Overdue section */}
          {alerts.overdue.length > 0 && (
            <div className="space-y-3">
              <div className="rounded-xl border border-red-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-red-50 border-b border-red-200">
                  <h2 className="text-sm font-semibold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Overdue Maintenance
                    <Badge variant="destructive" className="ml-1">{alerts.overdue.length}</Badge>
                  </h2>
                </div>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <AlertTable items={alerts.overdue} mode="overdue" />
                </div>
                {/* Mobile cards */}
                <div className="md:hidden p-4">
                  <AlertCards items={alerts.overdue} mode="overdue" />
                </div>
              </div>
            </div>
          )}

          {/* Due Soon section */}
          {alerts.dueSoon.length > 0 && (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
                  <h2 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Due Soon
                    <Badge variant="warning" className="ml-1">{alerts.dueSoon.length}</Badge>
                  </h2>
                </div>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <AlertTable items={alerts.dueSoon} mode="dueSoon" />
                </div>
                {/* Mobile cards */}
                <div className="md:hidden p-4">
                  <AlertCards items={alerts.dueSoon} mode="dueSoon" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
