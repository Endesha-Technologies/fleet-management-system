'use client';

import React from 'react';
import {
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TabContentSkeleton } from './TruckDetailSkeleton';
import type { TruckMaintenanceProps } from '../../_types';
import type {
  TruckHistoryPlan,
  TruckHistoryServiceLog,
} from '@/api/maintenance/maintenance.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1_000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TruckMaintenance({
  truckId,
  maintenanceData,
  isLoading,
  onRefresh,
}: TruckMaintenanceProps) {
  if (isLoading) return <TabContentSkeleton rows={5} />;

  if (!maintenanceData) {
    return <EmptyState />;
  }

  const { plans, serviceLogs } = maintenanceData;

  // Split plans into overdue, upcoming, and inactive
  const activePlans = plans.filter((p) => p.isActive);
  const overduePlans = activePlans.filter((p) => {
    if (!p.nextServiceDate) return false;
    return daysUntil(p.nextServiceDate)! < 0;
  });
  const upcomingPlans = activePlans.filter((p) => {
    if (!p.nextServiceDate) return true;
    return daysUntil(p.nextServiceDate)! >= 0;
  });

  const totalServiceCost = serviceLogs.reduce((sum, log) => sum + log.cost, 0);

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={Settings}
          label="Active Plans"
          value={String(activePlans.length)}
          color="blue"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Overdue"
          value={String(overduePlans.length)}
          color={overduePlans.length > 0 ? 'red' : 'green'}
        />
        <KpiCard
          icon={CheckCircle2}
          label="Services Done"
          value={String(serviceLogs.length)}
          color="green"
        />
        <KpiCard
          icon={DollarSign}
          label="Total Cost"
          value={formatCurrency(totalServiceCost)}
          color="purple"
        />
      </div>

      {/* Overdue Alert Banner */}
      {overduePlans.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-800">
              {overduePlans.length} Maintenance Plan{overduePlans.length > 1 ? 's' : ''} Overdue
            </h4>
            <p className="text-xs text-red-600 mt-0.5">
              {overduePlans.map((p) => p.schedule.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Maintenance Plans */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Maintenance Plans</h3>
          <Button variant="outline" size="sm">
            <Wrench className="h-3.5 w-3.5 mr-1.5" />
            Assign Plan
          </Button>
        </div>

        {plans.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-8 text-center">
            <p className="text-sm text-gray-500">
              No maintenance plans assigned to this truck.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>

      {/* Service History */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Service History</h3>

        {serviceLogs.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-8 text-center">
            <p className="text-sm text-gray-500">
              No service records yet. Complete a maintenance plan to create the first log.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Odometer
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Summary
                  </th>
                </tr>
              </thead>
              <tbody>
                {serviceLogs.map((log) => (
                  <ServiceLogRow key={log.id} log={log} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: TruckHistoryPlan }) {
  const nextDays = daysUntil(plan.nextServiceDate);
  const isOverdue = nextDays !== null && nextDays < 0;
  const isDueSoon = nextDays !== null && nextDays >= 0 && nextDays <= 14;

  return (
    <div
      className={`
        bg-white border rounded-lg p-4 shadow-sm transition-colors
        ${isOverdue ? 'border-red-200 bg-red-50/30' : isDueSoon ? 'border-yellow-200' : 'border-gray-200'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {plan.schedule.name}
            </h4>
            <Badge
              variant={
                !plan.isActive
                  ? 'secondary'
                  : isOverdue
                  ? 'destructive'
                  : isDueSoon
                  ? 'warning'
                  : 'success'
              }
              className="text-xs flex-shrink-0"
            >
              {!plan.isActive
                ? 'Inactive'
                : isOverdue
                ? 'Overdue'
                : isDueSoon
                ? 'Due Soon'
                : 'On Track'}
            </Badge>
            {plan.schedule.taskType && (
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {plan.schedule.taskType}
              </Badge>
            )}
          </div>

          {plan.schedule.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-1">
              {plan.schedule.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            {plan.schedule.intervalKm && (
              <span>Every {plan.schedule.intervalKm.toLocaleString()} km</span>
            )}
            {plan.schedule.intervalDays && (
              <span>Every {plan.schedule.intervalDays} days</span>
            )}
            {plan.lastServiceDate && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Last: {formatDate(plan.lastServiceDate)}
              </span>
            )}
            {plan.nextServiceDate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Next: {formatDate(plan.nextServiceDate)}
              </span>
            )}
            <span>{plan._count.serviceLogs} service log(s)</span>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Button>
      </div>
    </div>
  );
}

function ServiceLogRow({ log }: { log: TruckHistoryServiceLog }) {
  const scheduleName = log.plan?.schedule?.name ?? '—';

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {formatDate(log.serviceDate)}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-gray-900 font-medium text-xs">{scheduleName}</span>
      </td>
      <td className="px-4 py-3 text-gray-600">{log.serviceProviderName || '—'}</td>
      <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">
        {log.odometerAtService.toLocaleString()} km
      </td>
      <td className="px-4 py-3 text-right font-medium text-gray-900">
        {log.cost > 0 ? formatCurrency(log.cost) : '—'}
      </td>
      <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px] truncate">
        {log.summary || log.notes || '—'}
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-gray-200 border-dashed rounded-lg p-12 text-center">
      <div className="h-14 w-14 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <Wrench className="h-7 w-7" />
      </div>
      <h3 className="text-base font-medium text-gray-900 mb-1">
        No maintenance data
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        Assign maintenance schedules to this truck to start tracking preventive
        maintenance and service history.
      </p>
      <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" size="sm">
        <Wrench className="h-4 w-4 mr-1.5" />
        Assign Maintenance Plan
      </Button>
    </div>
  );
}
