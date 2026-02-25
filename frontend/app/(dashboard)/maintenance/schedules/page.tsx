'use client';

// ---------------------------------------------------------------------------
// Maintenance Schedules — list page
// ---------------------------------------------------------------------------
// Displays all maintenance schedule templates (rules) with search, filter,
// and responsive table/card layout.
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
  Clock,
  Gauge,
  Calendar,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useSchedules } from '../_hooks';
import type {MaintenanceTaskType } from '../_types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
// Filter types
// ---------------------------------------------------------------------------

type StatusFilter = 'all' | 'active' | 'inactive';
type TypeFilter = 'all' | 'PREVENTIVE' | 'INSPECTION';

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
              {['Name', 'Type', 'Interval', 'Duration', 'Makes', 'Status', 'Plans', ''].map(
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
                <td className="px-4 py-3"><PulseLine className="h-5 w-20" /></td>
                <td className="px-4 py-3"><PulseLine className="h-4 w-28" /></td>
                <td className="px-4 py-3"><PulseLine className="h-4 w-16" /></td>
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
      <h3 className="mt-4 text-lg font-semibold text-gray-900">No schedules found</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating your first maintenance schedule template.
      </p>
      <Link href="/maintenance/schedules/create">
        <Button className="mt-6">
          <Plus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </Link>
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
// Page component
// ---------------------------------------------------------------------------

export default function SchedulesListPage() {
  const { data: schedules, isLoading, error } = useSchedules();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  // Filter + search
  const filtered = useMemo(() => {
    if (!schedules) return [];
    return schedules.filter((s) => {
      // Search
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      // Status
      if (statusFilter === 'active' && !s.isActive) return false;
      if (statusFilter === 'inactive' && s.isActive) return false;
      // Type
      if (typeFilter !== 'all' && s.taskType !== typeFilter) return false;
      return true;
    });
  }, [schedules, search, statusFilter, typeFilter]);

  return (
    <div className="space-y-6">
      {/* ---- Action bar ---- */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Rule templates for recurring maintenance tasks.
        </p>
        <Link href="/maintenance/schedules/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
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
            placeholder="Search schedules…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Status filter */}
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

        {/* Type filter */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {([
            { value: 'all' as TypeFilter, label: 'All' },
            { value: 'PREVENTIVE' as TypeFilter, label: 'Preventive' },
            { value: 'INSPECTION' as TypeFilter, label: 'Inspection' },
          ]).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === value
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interval</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicable Makes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plans</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <TypeBadge type={s.taskType} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        {s.intervalKm != null && <Gauge className="h-3.5 w-3.5 text-gray-400" />}
                        {s.intervalDays != null && <Calendar className="h-3.5 w-3.5 text-gray-400" />}
                        {fmtInterval(s.intervalKm, s.intervalDays)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {fmtDuration(s.estimatedDurationHours)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap max-w-[160px] truncate">
                      {s.applicableTruckMakes || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={s.isActive ? 'success' : 'secondary'}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {s._count.plans}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link href={`/maintenance/schedules/${s.id}`}>
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
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/maintenance/schedules/${s.id}`}
              className="block rounded-xl border border-gray-200 shadow-sm bg-white p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{s.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <TypeBadge type={s.taskType} />
                    <Badge variant={s.isActive ? 'success' : 'secondary'}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <Eye className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5" />
                  {fmtInterval(s.intervalKm, s.intervalDays)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {fmtDuration(s.estimatedDurationHours)}
                </div>
                <div className="flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {s._count.plans} plan{s._count.plans !== 1 ? 's' : ''}
                </div>
                {s.applicableTruckMakes && (
                  <div className="flex items-center gap-1 truncate">
                    <Wrench className="h-3.5 w-3.5 shrink-0" />
                    {s.applicableTruckMakes}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
