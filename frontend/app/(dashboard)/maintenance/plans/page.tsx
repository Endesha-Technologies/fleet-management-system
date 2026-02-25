'use client';

// ---------------------------------------------------------------------------
// Maintenance Plans — list page
// ---------------------------------------------------------------------------
// Displays all maintenance plans (schedule → truck assignments) with search,
// filter, overdue highlighting, and responsive table/card layout.
// ---------------------------------------------------------------------------

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Eye,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  Gauge,
  Calendar,
  Truck,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { usePlans } from '../_hooks';
import type {
  MaintenancePlanListItem,
  MaintenanceTaskType,
} from '../_types';

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

/** Check if the plan is overdue by date or odometer. */
function isOverdue(plan: MaintenancePlanListItem): boolean {
  const now = new Date();
  if (plan.nextServiceDate && new Date(plan.nextServiceDate) < now) return true;
  if (
    plan.nextServiceOdometer != null &&
    plan.truck.currentOdometer != null &&
    plan.nextServiceOdometer < plan.truck.currentOdometer
  )
    return true;
  return false;
}

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

type StatusFilter = 'all' | 'active' | 'inactive';

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function PulseLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Truck', 'Schedule', 'Next Due', 'Last Service', 'Status', 'Logs', ''].map(
                (h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3"><PulseLine className="h-4 w-32" /></td>
                <td className="px-4 py-3"><PulseLine className="h-5 w-28" /></td>
                <td className="px-4 py-3"><PulseLine className="h-4 w-28" /></td>
                <td className="px-4 py-3"><PulseLine className="h-4 w-24" /></td>
                <td className="px-4 py-3"><PulseLine className="h-5 w-16" /></td>
                <td className="px-4 py-3"><PulseLine className="h-4 w-8" /></td>
                <td className="px-4 py-3"><PulseLine className="h-8 w-8" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
          <PulseLine className="h-5 w-40" />
          <PulseLine className="h-4 w-24" />
          <div className="flex gap-4">
            <PulseLine className="h-4 w-28" />
            <PulseLine className="h-4 w-20" />
          </div>
          <PulseLine className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm p-12 text-center">
      <CalendarClock className="mx-auto h-12 w-12 text-gray-300" />
      <h3 className="mt-4 text-lg font-semibold text-gray-900">No plans found</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by assigning maintenance schedules to your trucks.
      </p>
      <Link href="/maintenance/plans/assign">
        <Button className="mt-6">
          <Plus className="mr-2 h-4 w-4" />
          Assign Plans
        </Button>
      </Link>
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
// Next Due cell
// ---------------------------------------------------------------------------

function NextDue({ plan }: { plan: MaintenancePlanListItem }) {
  const overdue = isOverdue(plan);
  const parts: React.ReactNode[] = [];

  if (plan.nextServiceDate) {
    parts.push(
      <span key="date" className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        {fmtDate(plan.nextServiceDate)}
      </span>,
    );
  }

  if (plan.nextServiceOdometer != null) {
    parts.push(
      <span key="odo" className="flex items-center gap-1">
        <Gauge className="h-3.5 w-3.5" />
        {fmtOdometer(plan.nextServiceOdometer)}
      </span>,
    );
  }

  if (parts.length === 0) return <span className="text-gray-400">—</span>;

  return (
    <span className={`flex flex-col gap-0.5 text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
      {parts}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function PlansListPage() {
  const { data: plans, isLoading, error } = usePlans();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Filter + search
  const filtered = useMemo(() => {
    if (!plans) return [];
    return plans.filter((p) => {
      // Search by truck registration
      if (
        search &&
        !p.truck.registrationNumber.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      // Status
      if (statusFilter === 'active' && !p.isActive) return false;
      if (statusFilter === 'inactive' && p.isActive) return false;
      return true;
    });
  }, [plans, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* ---- Action bar ---- */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Schedule assignments for individual trucks.
        </p>
        <Link href="/maintenance/plans/assign">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Assign Plans
          </Button>
        </Link>
      </div>

      {/* ---- Search & Filters ---- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by registration…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {(['all', 'active', 'inactive'] as StatusFilter[]).map((v) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                statusFilter === v
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Error state ---- */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ---- Loading ---- */}
      {isLoading && (
        <>
          <div className="hidden md:block"><TableSkeleton /></div>
          <div className="md:hidden"><CardSkeleton /></div>
        </>
      )}

      {/* ---- Empty ---- */}
      {!isLoading && !error && filtered.length === 0 && <EmptyState />}

      {/* ---- Desktop table ---- */}
      {!isLoading && filtered.length > 0 && (
        <div className="hidden md:block rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logs</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((p) => {
                  const overdue = p.isActive && isOverdue(p);
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${overdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                    >
                      {/* Truck */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Truck className="h-4 w-4 text-gray-400 shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {p.truck.registrationNumber}
                            </div>
                            {(p.truck.make || p.truck.model) && (
                              <div className="text-xs text-gray-500">
                                {[p.truck.make, p.truck.model].filter(Boolean).join(' ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {p.schedule.name}
                        </div>
                        <TypeBadge type={p.schedule.taskType} />
                      </td>

                      {/* Next Due */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <NextDue plan={p} />
                      </td>

                      {/* Last Service */}
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        <div>{fmtDate(p.lastServiceDate)}</div>
                        {p.lastServiceOdometer != null && (
                          <div className="text-xs text-gray-400">
                            {fmtOdometer(p.lastServiceOdometer)}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={p.isActive ? 'success' : 'secondary'}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>

                      {/* Logs */}
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-gray-400" />
                          {p._count.serviceLogs}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link href={`/maintenance/plans/${p.id}`}>
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
        </div>
      )}

      {/* ---- Mobile cards ---- */}
      {!isLoading && filtered.length > 0 && (
        <div className="md:hidden space-y-4">
          {filtered.map((p) => {
            const overdue = p.isActive && isOverdue(p);
            return (
              <Link
                key={p.id}
                href={`/maintenance/plans/${p.id}`}
                className={`block rounded-xl border shadow-sm p-4 transition-colors ${
                  overdue
                    ? 'border-red-200 bg-red-50 hover:border-red-300'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-gray-400 shrink-0" />
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {p.truck.registrationNumber}
                      </h3>
                    </div>
                    {(p.truck.make || p.truck.model) && (
                      <p className="text-xs text-gray-500 mt-0.5 ml-5.5">
                        {[p.truck.make, p.truck.model].filter(Boolean).join(' ')}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <Badge variant={p.isActive ? 'success' : 'secondary'}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <TypeBadge type={p.schedule.taskType} />
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
                </div>

                <div className="mt-2 text-sm font-medium text-gray-900">
                  {p.schedule.name}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="block text-gray-400">Next Due</span>
                    <NextDue plan={p} />
                  </div>
                  <div>
                    <span className="block text-gray-400">Last Service</span>
                    <span>{fmtDate(p.lastServiceDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {p._count.serviceLogs} log{p._count.serviceLogs !== 1 ? 's' : ''}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
