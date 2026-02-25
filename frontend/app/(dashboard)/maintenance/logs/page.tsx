'use client';

// ---------------------------------------------------------------------------
// Service Logs — list page
// ---------------------------------------------------------------------------
// Displays all completed service log entries with search, summary stats,
// sorting (newest first), and responsive table/card layout.
// ---------------------------------------------------------------------------

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  Truck,
  Wrench,
  ClipboardCheck,
  Gauge,
  User,
  Hash,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useServiceLogs } from '../_hooks';
import type { ServiceLogListItem, MaintenanceTaskType } from '../_types';

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

function fmtCurrency(value: number): string {
  if (!value) return '—';
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(value);
}

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
              {['Date', 'Truck', 'Schedule', 'Odometer', 'Cost', 'Provider', ''].map(
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
                <td className="px-4 py-3"><PulseLine className="h-4 w-24" /></td>
                <td className="px-4 py-3"><PulseLine className="h-4 w-32" /></td>
                <td className="px-4 py-3"><PulseLine className="h-5 w-28" /></td>
                <td className="px-4 py-3"><PulseLine className="h-4 w-24" /></td>
                <td className="px-4 py-3"><PulseLine className="h-4 w-24" /></td>
                <td className="px-4 py-3"><PulseLine className="h-4 w-28" /></td>
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

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
          <PulseLine className="h-4 w-20" />
          <PulseLine className="h-6 w-28" />
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
      <FileText className="mx-auto h-12 w-12 text-gray-300" />
      <h3 className="mt-4 text-lg font-semibold text-gray-900">No service logs found</h3>
      <p className="mt-1 text-sm text-gray-500">
        Service logs will appear here once maintenance is completed on your trucks.
      </p>
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
// Summary stats
// ---------------------------------------------------------------------------

function SummaryStats({ logs }: { logs: ServiceLogListItem[] }) {
  const totalCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0);
  const avgCost = logs.length > 0 ? totalCost / logs.length : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Hash className="h-4 w-4" />
          Total Logs
        </div>
        <p className="mt-1 text-2xl font-bold text-gray-900">{logs.length}</p>
      </div>
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <DollarSign className="h-4 w-4" />
          Total Cost
        </div>
        <p className="mt-1 text-2xl font-bold text-gray-900">{fmtCurrency(totalCost)}</p>
      </div>
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <DollarSign className="h-4 w-4" />
          Average Cost
        </div>
        <p className="mt-1 text-2xl font-bold text-gray-900">{fmtCurrency(Math.round(avgCost))}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ServiceLogsListPage() {
  const { data: logs, isLoading, error } = useServiceLogs();

  const [search, setSearch] = useState('');

  // Filter + sort (newest first)
  const filtered = useMemo(() => {
    if (!logs) return [];
    const q = search.toLowerCase();
    return logs
      .filter((l) => {
        if (!q) return true;
        return (
          l.truck.registrationNumber.toLowerCase().includes(q) ||
          l.plan.schedule.name.toLowerCase().includes(q) ||
          l.serviceProviderName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
  }, [logs, search]);

  return (
    <div className="space-y-6">
      {/* ---- Summary stats ---- */}
      {isLoading && <SummarySkeleton />}
      {!isLoading && !error && logs && logs.length > 0 && <SummaryStats logs={logs} />}

      {/* ---- Search ---- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by truck, schedule, or provider…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odometer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((l) => (
                  <tr key={l.id} className="transition-colors hover:bg-gray-50">
                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-sm text-gray-900">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {fmtDate(l.serviceDate)}
                      </span>
                    </td>

                    {/* Truck */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-gray-400 shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {l.truck.registrationNumber}
                          </div>
                          {(l.truck.make || l.truck.model) && (
                            <div className="text-xs text-gray-500">
                              {[l.truck.make, l.truck.model].filter(Boolean).join(' ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {l.plan.schedule.name}
                      </div>
                      <TypeBadge type={l.plan.schedule.taskType} />
                    </td>

                    {/* Odometer */}
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5 text-gray-400" />
                        {fmtOdometer(l.odometerAtService)}
                      </span>
                    </td>

                    {/* Cost */}
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {fmtCurrency(l.cost)}
                    </td>

                    {/* Provider */}
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        {l.serviceProviderName || '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link href={`/maintenance/logs/${l.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- Mobile cards ---- */}
      {!isLoading && filtered.length > 0 && (
        <div className="md:hidden space-y-4">
          {filtered.map((l) => (
            <Link
              key={l.id}
              href={`/maintenance/logs/${l.id}`}
              className="block rounded-xl border border-gray-200 bg-white shadow-sm p-4 transition-colors hover:border-gray-300"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      {fmtDate(l.serviceDate)}
                    </h3>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 ml-5.5">
                    <Truck className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700">{l.truck.registrationNumber}</span>
                    {(l.truck.make || l.truck.model) && (
                      <span className="text-xs text-gray-500">
                        {[l.truck.make, l.truck.model].filter(Boolean).join(' ')}
                      </span>
                    )}
                  </div>
                </div>
                <Eye className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
              </div>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-900">{l.plan.schedule.name}</span>
                <TypeBadge type={l.plan.schedule.taskType} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>
                  <span className="block text-gray-400">Odometer</span>
                  <span>{fmtOdometer(l.odometerAtService)}</span>
                </div>
                <div>
                  <span className="block text-gray-400">Cost</span>
                  <span className="font-medium text-gray-900">{fmtCurrency(l.cost)}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-gray-400">Provider</span>
                  <span>{l.serviceProviderName || '—'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
