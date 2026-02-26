'use client';

// ---------------------------------------------------------------------------
// Maintenance dashboard — Overview page
// ---------------------------------------------------------------------------
// Fetches real data from four hooks (schedules, plans, service logs, alerts)
// and renders: alert summary, quick stats, recent plans, and recent service
// logs. Header and navigation are provided by the parent layout.
// ---------------------------------------------------------------------------

import Link from 'next/link';
import {
  Wrench,
  CalendarClock,
  ClipboardList,
  FileText,
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Truck,
} from 'lucide-react';

import { useSchedules, usePlans, useServiceLogs, useAlerts } from './_hooks';
import type {
  MaintenanceAlertItem,
  ServiceLogListItem,
} from './_types';

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

function fmtCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return `UGX ${amount.toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Skeleton helpers
// ---------------------------------------------------------------------------

function PulseLine({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
  );
}

function StatSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
      <PulseLine className="h-4 w-24" />
      <PulseLine className="h-8 w-16" />
      <PulseLine className="h-3 w-32" />
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <PulseLine key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Alert card (single item)
// ---------------------------------------------------------------------------

function AlertCard({
  item,
  variant,
}: {
  item: MaintenanceAlertItem;
  variant: 'overdue' | 'dueSoon';
}) {
  const isOverdue = variant === 'overdue';
  const border = isOverdue ? 'border-red-200' : 'border-amber-200';
  const bg = isOverdue ? 'bg-red-50' : 'bg-amber-50';
  const iconColor = isOverdue ? 'text-red-600' : 'text-amber-600';
  const textPrimary = isOverdue ? 'text-red-900' : 'text-amber-900';
  const textSecondary = isOverdue ? 'text-red-600' : 'text-amber-600';
  const Icon = isOverdue ? AlertTriangle : Clock;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${border} ${bg}`}>
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${textPrimary}`}>
          {item.truck?.registrationNumber ?? 'Unknown truck'} — {item.schedule?.name ?? 'Unknown schedule'}
        </p>
        <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs mt-1 ${textSecondary}`}>
          {item.nextServiceDate && (
            <span>Due: {fmtDate(item.nextServiceDate)}</span>
          )}
          {item.nextServiceOdometer != null && (
            <span>@ {fmtOdometer(item.nextServiceOdometer)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function MaintenancePage() {
  const schedules = useSchedules();
  const plans = usePlans();
  const serviceLogs = useServiceLogs();
  const alerts = useAlerts();

  // Derived data
  const overdueItems = alerts.data?.overdue ?? [];
  const dueSoonItems = alerts.data?.dueSoon ?? [];
  const summary = alerts.data?.summary;

  const recentPlans = (plans.data ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentLogs = (serviceLogs.data ?? [])
    .slice()
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
    .slice(0, 5);

  const isAnyLoading =
    schedules.isLoading || plans.isLoading || serviceLogs.isLoading || alerts.isLoading;

  return (
    <div className="space-y-6 pb-8">
      {/* ------------------------------------------------------------------ */}
      {/* Alerts summary                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section>
        {alerts.isLoading ? (
          <div className="rounded-xl border border-gray-200 shadow-sm p-6">
            <PulseLine className="h-5 w-48 mb-4" />
            <div className="space-y-3">
              <PulseLine className="h-16 w-full" />
              <PulseLine className="h-16 w-full" />
            </div>
          </div>
        ) : alerts.error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load alerts: {alerts.error}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-500" />
                <h2 className="text-base font-semibold">Alerts</h2>
                <span className="text-sm text-gray-500">
                  {summary?.overdueCount ?? 0} overdue · {summary?.dueSoonCount ?? 0} due soon
                </span>
              </div>
              <Link
                href="/maintenance/alerts"
                className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {overdueItems.length === 0 && dueSoonItems.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                No maintenance alerts — everything is on track.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {overdueItems.map((item) => (
                  <AlertCard key={item.id} item={item} variant="overdue" />
                ))}
                {dueSoonItems.map((item) => (
                  <AlertCard key={item.id} item={item} variant="dueSoon" />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Quick stats                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isAnyLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            {/* Schedules */}
            <div className="rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Schedules</p>
                  <p className="text-3xl font-bold mt-1">{schedules.data?.length ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-1">Maintenance rules</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <CalendarClock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Active plans */}
            <div className="rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Plans</p>
                  <p className="text-3xl font-bold mt-1">
                    {(plans.data ?? []).filter((p) => p.isActive).length}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Of {plans.data?.length ?? 0} total
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Service logs */}
            <div className="rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Service Logs</p>
                  <p className="text-3xl font-bold mt-1">{serviceLogs.data?.length ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-1">Completed services</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Alerts</p>
                  <p className="text-3xl font-bold mt-1 text-red-600">
                    {summary?.totalAlerts ?? 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {summary?.overdueCount ?? 0} overdue · {summary?.dueSoonCount ?? 0} due soon
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Recent plans & service logs (2-column grid on desktop)             */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent plans */}
        <section className="rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-gray-400" />
              Recent Plans
            </h2>
            <Link
              href="/maintenance/plans"
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-4">
            {plans.isLoading ? (
              <TableSkeleton rows={5} />
            ) : plans.error ? (
              <p className="text-sm text-red-600 py-4 text-center">
                Failed to load plans: {plans.error}
              </p>
            ) : recentPlans.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No plans yet.</p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="pb-2 pr-4">Truck</th>
                      <th className="pb-2 pr-4">Schedule</th>
                      <th className="pb-2 pr-4">Next Due</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2">Last Service</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentPlans.map((plan) => (
                      <tr
                        key={plan.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2.5 pr-4">
                          <Link
                            href={`/maintenance/plans/${plan.id}`}
                            className="inline-flex items-center gap-1.5 font-medium text-gray-900 hover:text-blue-600"
                          >
                            <Truck className="h-3.5 w-3.5 text-gray-400" />
                            {plan.truck?.registrationNumber ?? '—'}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600 max-w-[160px] truncate">
                          {plan.schedule?.name ?? '—'}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600 whitespace-nowrap">
                          {fmtDate(plan.nextServiceDate)}
                        </td>
                        <td className="py-2.5 pr-4">
                          {plan.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-gray-600 whitespace-nowrap">
                          {fmtDate(plan.lastServiceDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Recent service logs */}
        <section className="rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Wrench className="h-4 w-4 text-gray-400" />
              Recent Service Logs
            </h2>
            <Link
              href="/maintenance/logs"
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-4">
            {serviceLogs.isLoading ? (
              <TableSkeleton rows={5} />
            ) : serviceLogs.error ? (
              <p className="text-sm text-red-600 py-4 text-center">
                Failed to load service logs: {serviceLogs.error}
              </p>
            ) : recentLogs.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No service logs yet.</p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2 pr-4">Truck</th>
                      <th className="pb-2 pr-4">Schedule</th>
                      <th className="pb-2 pr-4">Cost</th>
                      <th className="pb-2">Provider</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2.5 pr-4 whitespace-nowrap">
                          <Link
                            href={`/maintenance/logs/${log.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {fmtDate(log.serviceDate)}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="inline-flex items-center gap-1.5 text-gray-700">
                            <Truck className="h-3.5 w-3.5 text-gray-400" />
                            {log.truck?.registrationNumber ?? '—'}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600 max-w-[160px] truncate">
                          {log.plan?.schedule?.name ?? '—'}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600 whitespace-nowrap">
                          {fmtCurrency(log.cost)}
                        </td>
                        <td className="py-2.5 text-gray-600 max-w-[140px] truncate">
                          {log.serviceProviderName || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
