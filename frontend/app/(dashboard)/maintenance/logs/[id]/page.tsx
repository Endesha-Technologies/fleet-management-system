'use client';

// ---------------------------------------------------------------------------
// Service Log Detail page
// ---------------------------------------------------------------------------
// Shows the full details of a single service log entry, including linked
// truck and maintenance plan information.
// ---------------------------------------------------------------------------

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Gauge,
  DollarSign,
  User,
  FileText,
  StickyNote,
  Clock,
  Truck,
  Wrench,
  ClipboardCheck,
  ExternalLink,
  CalendarClock,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { useServiceLogDetail } from '../../_hooks';
import type { MaintenanceTaskType } from '../../_types';

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

function fmtDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

function fmtInterval(km: number | null | undefined, days: number | null | undefined): string {
  const parts: string[] = [];
  if (km != null) parts.push(`${km.toLocaleString()} km`);
  if (days != null) parts.push(`${days} days`);
  return parts.length > 0 ? parts.join(' / ') : '—';
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
          {Array.from({ length: 8 }).map((_, i) => (
            <PulseLine key={i} className="h-4 w-28" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
          <PulseLine className="h-5 w-32" />
          <PulseLine className="h-4 w-40" />
          <PulseLine className="h-4 w-24" />
        </div>
        <div className="rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
          <PulseLine className="h-5 w-32" />
          <PulseLine className="h-4 w-40" />
          <PulseLine className="h-4 w-24" />
        </div>
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

function Field({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900">{children}</dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ServiceLogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: log, isLoading, error } = useServiceLogDetail(id);

  // ---- Loading ----
  if (isLoading) return <DetailSkeleton />;

  // ---- Error ----
  if (error) {
    return (
      <div className="space-y-4">
        <Link
          href="/maintenance/logs"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Service Logs
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!log) return null;

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/maintenance/logs"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Service Logs
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Service on {fmtDate(log.serviceDate)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Log ID: {log.id}
          </p>
        </div>
      </div>

      {/* ---- Details card ---- */}
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-400" />
          Service Details
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field label="Service Date" icon={Calendar}>
            {fmtDate(log.serviceDate)}
          </Field>
          <Field label="Odometer at Service" icon={Gauge}>
            {fmtOdometer(log.odometerAtService)}
          </Field>
          <Field label="Cost" icon={DollarSign}>
            <span className="font-semibold">{fmtCurrency(log.cost)}</span>
          </Field>
          <Field label="Service Provider" icon={User}>
            {log.serviceProviderName || '—'}
          </Field>
          <Field label="Performed By" icon={User}>
            {log.performedBy || '—'}
          </Field>
          <Field label="Created At" icon={Clock}>
            {fmtDateTime(log.createdAt)}
          </Field>
        </dl>

        {/* Summary */}
        {log.summary && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              Summary
            </dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{log.summary}</dd>
          </div>
        )}

        {/* Notes */}
        {log.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <StickyNote className="h-3.5 w-3.5" />
              Notes
            </dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{log.notes}</dd>
          </div>
        )}
      </div>

      {/* ---- Linked cards ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linked Truck */}
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="h-5 w-5 text-gray-400" />
              Linked Truck
            </h2>
            <Link href={`/trucks/${log.truck.id}`}>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <ExternalLink className="h-3.5 w-3.5" />
                View Truck
              </Button>
            </Link>
          </div>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{log.truck.registrationNumber}</dd>
            </div>
            {(log.truck.make || log.truck.model) && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Make / Model</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {[log.truck.make, log.truck.model].filter(Boolean).join(' ')}
                </dd>
              </div>
            )}
            {log.truck.currentOdometer != null && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Odometer</dt>
                <dd className="mt-1 text-sm text-gray-900">{fmtOdometer(log.truck.currentOdometer)}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Linked Plan */}
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-gray-400" />
              Linked Plan
            </h2>
            <Link href={`/maintenance/plans/${log.planId}`}>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <ExternalLink className="h-3.5 w-3.5" />
                View Plan
              </Button>
            </Link>
          </div>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 flex items-center gap-2">
                {log.plan.schedule.name}
                <TypeBadge type={log.plan.schedule.taskType} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Intervals</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {fmtInterval(log.plan.schedule.intervalKm, log.plan.schedule.intervalDays)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</dt>
              <dd className="mt-1">
                <Badge variant={log.plan.isActive ? 'success' : 'secondary'}>
                  {log.plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
