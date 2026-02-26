'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Settings,
  Loader2,
  CalendarClock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { TabContentSkeleton } from './TruckDetailSkeleton';
import { maintenanceService } from '@/api/maintenance';
import type { TruckMaintenanceProps } from '../../_types';
import type {
  TruckHistoryPlan,
  TruckHistoryServiceLog,
  MaintenanceScheduleListItem,
  AssignPlanInput,
  CompletePlanRequest,
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
  return `UGX ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TruckMaintenance({
  truckId,
  maintenanceData,
  isLoading,
  onRefresh,
  readOnly,
}: TruckMaintenanceProps) {
  const [showAssignDrawer, setShowAssignDrawer] = useState(false);
  const [showCompleteDrawer, setShowCompleteDrawer] = useState(false);
  const [completingPlanId, setCompletingPlanId] = useState<string | null>(null);

  if (isLoading) return <TabContentSkeleton rows={5} />;

  if (!maintenanceData) {
    return (
      <>
        <EmptyState onAssignPlan={() => setShowAssignDrawer(true)} readOnly={readOnly} />
        {!readOnly && (
          <AssignPlanDrawer
            open={showAssignDrawer}
            onOpenChange={setShowAssignDrawer}
            truckId={truckId}
            onComplete={onRefresh}
          />
        )}
      </>
    );
  }

  const { plans, statusSummary, serviceLogs } = maintenanceData;

  const completingPlan = plans.find((p) => p.id === completingPlanId);
  const completingPlanName = completingPlan?.schedule?.name ?? 'Maintenance';

  const totalServiceCost = serviceLogs.reduce((sum, log) => sum + log.cost, 0);

  return (
    <>
      <div className="space-y-6">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            icon={Settings}
            label="Active Plans"
            value={String(statusSummary.total)}
            color="blue"
          />
          <KpiCard
            icon={AlertTriangle}
            label="Overdue"
            value={String(statusSummary.overdue)}
            color={statusSummary.overdue > 0 ? 'red' : 'green'}
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
        {statusSummary.overdue > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800">
                {statusSummary.overdue} Maintenance Plan{statusSummary.overdue > 1 ? 's' : ''} Overdue
              </h4>
              <p className="text-xs text-red-600 mt-0.5">
                {plans.filter((p) => p.status === 'overdue').map((p) => p.schedule.name).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Maintenance Plans */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Maintenance Plans</h3>
            {!readOnly && (
              <Button variant="outline" size="sm" onClick={() => setShowAssignDrawer(true)}>
                <Wrench className="h-3.5 w-3.5 mr-1.5" />
                Assign Plan
              </Button>
            )}
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
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onComplete={(planId) => {
                    setCompletingPlanId(planId);
                    setShowCompleteDrawer(true);
                  }}
                  readOnly={readOnly}
                />
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

      <AssignPlanDrawer
        open={showAssignDrawer}
        onOpenChange={setShowAssignDrawer}
        truckId={truckId}
        onComplete={onRefresh}
      />

      <CompletePlanDrawer
        open={showCompleteDrawer}
        onOpenChange={setShowCompleteDrawer}
        planId={completingPlanId}
        planName={completingPlanName}
        truckId={truckId}
        onComplete={onRefresh}
      />
    </>
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

function PlanCard({
  plan,
  onComplete,
  readOnly,
}: {
  plan: TruckHistoryPlan;
  onComplete: (planId: string) => void;
  readOnly?: boolean;
}) {
  const isOverdue = plan.status === 'overdue';
  const isDueSoon = plan.status === 'due_soon';

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
                : plan.status === 'completed'
                ? 'Completed'
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
            {plan.delta && (plan.delta.days != null || plan.delta.km != null) && (
              <span className="flex items-center gap-1 font-medium text-gray-700">
                {plan.delta.days != null && (
                  <span className={plan.status === 'overdue' ? 'text-red-600' : plan.status === 'due_soon' ? 'text-yellow-600' : ''}>
                    {plan.delta.days >= 0 ? `${plan.delta.days} days left` : `${Math.abs(plan.delta.days)} days overdue`}
                  </span>
                )}
                {plan.delta.days != null && plan.delta.km != null && <span className="text-gray-300">|</span>}
                {plan.delta.km != null && (
                  <span className={plan.status === 'overdue' ? 'text-red-600' : plan.status === 'due_soon' ? 'text-yellow-600' : ''}>
                    {plan.delta.km >= 0 ? `${plan.delta.km.toLocaleString()} km left` : `${Math.abs(plan.delta.km).toLocaleString()} km overdue`}
                  </span>
                )}
              </span>
            )}
            <span>{plan._count.serviceLogs} service log(s)</span>
          </div>
        </div>

        {!readOnly && plan.isActive && plan.status === 'overdue' && (
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 text-xs"
            onClick={() => onComplete(plan.id)}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Complete
          </Button>
        )}
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

function EmptyState({ onAssignPlan, readOnly }: { onAssignPlan: () => void; readOnly?: boolean }) {
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
      {!readOnly && (
        <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" size="sm" onClick={onAssignPlan}>
          <Wrench className="h-4 w-4 mr-1.5" />
          Assign Maintenance Plan
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CompletePlanDrawer
// ---------------------------------------------------------------------------

interface CompletePlanDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string | null;
  planName: string;
  truckId: string;
  onComplete: () => void;
}

interface CompleteFormState {
  serviceDate: string;
  odometerAtService: string;
  cost: string;
  serviceProviderName: string;
  summary: string;
  notes: string;
}

const INITIAL_COMPLETE_FORM: CompleteFormState = {
  serviceDate: new Date().toISOString().split('T')[0],
  odometerAtService: '',
  cost: '',
  serviceProviderName: '',
  summary: '',
  notes: '',
};

function CompletePlanDrawer({ open, onOpenChange, planId, planName, truckId, onComplete }: CompletePlanDrawerProps) {
  const [form, setForm] = useState<CompleteFormState>({ ...INITIAL_COMPLETE_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({ ...INITIAL_COMPLETE_FORM, serviceDate: new Date().toISOString().split('T')[0] });
      setSubmitError(null);
    }
  }, [open]);

  const inputCls =
    'w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  function updateField(field: keyof CompleteFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const canSubmit = form.serviceDate.trim() !== '' && form.odometerAtService.trim() !== '';

  async function handleSubmit() {
    if (!planId || !canSubmit) return;

    const payload: CompletePlanRequest = {
      serviceDate: form.serviceDate,
      odometerAtService: Number(form.odometerAtService),
    };
    if (form.cost.trim()) payload.cost = Number(form.cost);
    if (form.serviceProviderName.trim()) payload.serviceProviderName = form.serviceProviderName.trim();
    if (form.summary.trim()) payload.summary = form.summary.trim();
    if (form.notes.trim()) payload.notes = form.notes.trim();

    try {
      setSubmitting(true);
      setSubmitError(null);
      await maintenanceService.completePlan(planId, payload);
      onOpenChange(false);
      onComplete();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to complete maintenance');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col h-full border-l border-gray-200"
      >
        <SheetHeader className="px-6 py-5 border-b border-gray-200 flex-shrink-0 space-y-1">
          <SheetTitle className="text-xl font-bold text-gray-900">
            Complete Maintenance
          </SheetTitle>
          <SheetDescription className="text-gray-500">
            {planName}
          </SheetDescription>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Error banner */}
          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          {/* Service Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Service Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.serviceDate}
              onChange={(e) => updateField('serviceDate', e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Odometer at Service */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Odometer at Service <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="km"
              value={form.odometerAtService}
              onChange={(e) => updateField('odometerAtService', e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Cost */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Cost
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 5000"
              value={form.cost}
              onChange={(e) => updateField('cost', e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Service Provider */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Service Provider
            </label>
            <input
              type="text"
              placeholder="Provider name"
              value={form.serviceProviderName}
              onChange={(e) => updateField('serviceProviderName', e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Summary
            </label>
            <input
              type="text"
              placeholder="Brief summary of work done"
              value={form.summary}
              onChange={(e) => updateField('summary', e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Additional notes…"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className={`${inputCls} placeholder:text-gray-400`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing…
              </>
            ) : (
              'Complete Service'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// AssignPlanDrawer
// ---------------------------------------------------------------------------

interface AssignPlanDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truckId: string;
  onComplete: () => void;
}

function AssignPlanDrawer({ open, onOpenChange, truckId, onComplete }: AssignPlanDrawerProps) {
  const [schedules, setSchedules] = useState<MaintenanceScheduleListItem[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Selections: which schedules the user picked
  const [selections, setSelections] = useState<
    Map<string, { lastServiceDate: string; lastServiceOdometer: string; notes: string }>
  >(new Map());

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch schedules when drawer opens
  useEffect(() => {
    if (!open) return;
    async function load() {
      setIsLoadingSchedules(true);
      setLoadError(null);
      setSelections(new Map());
      setSubmitError(null);
      try {
        const data = await maintenanceService.getSchedules();
        setSchedules(data.filter((s) => s.isActive));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load schedules');
      } finally {
        setIsLoadingSchedules(false);
      }
    }
    load();
  }, [open]);

  // Toggle a schedule selection
  function toggleSchedule(id: string) {
    setSelections((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, { lastServiceDate: '', lastServiceOdometer: '', notes: '' });
      }
      return next;
    });
  }

  // Update a selection field
  function updateSelection(id: string, field: string, value: string) {
    setSelections((prev) => {
      const next = new Map(prev);
      const current = next.get(id);
      if (current) {
        next.set(id, { ...current, [field]: value });
      }
      return next;
    });
  }

  async function handleSubmit() {
    if (selections.size === 0) return;

    const plans: AssignPlanInput[] = Array.from(selections.entries()).map(
      ([scheduleId, opts]) => {
        const plan: AssignPlanInput = { scheduleId };
        if (opts.lastServiceDate) plan.lastServiceDate = opts.lastServiceDate;
        if (opts.lastServiceOdometer)
          plan.lastServiceOdometer = Number(opts.lastServiceOdometer);
        if (opts.notes.trim()) plan.notes = opts.notes.trim();
        return plan;
      },
    );

    try {
      setSubmitting(true);
      setSubmitError(null);
      await maintenanceService.assignPlans({ truckId, plans });
      onOpenChange(false);
      onComplete();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to assign plans');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col h-full border-l border-gray-200"
      >
        <SheetHeader className="px-6 py-5 border-b border-gray-200 flex-shrink-0 space-y-1">
          <SheetTitle className="text-xl font-bold text-gray-900">
            Assign Maintenance Plans
          </SheetTitle>
          <SheetDescription className="text-gray-500">
            Select maintenance schedules to assign to this truck.
          </SheetDescription>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Error banner */}
          {(loadError || submitError) && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-800">{loadError || submitError}</p>
            </div>
          )}

          {/* Loading state */}
          {isLoadingSchedules && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-lg" />
              ))}
            </div>
          )}

          {/* Schedule list */}
          {!isLoadingSchedules && schedules.length === 0 && !loadError && (
            <div className="py-8 text-center">
              <CalendarClock className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No active schedules available.</p>
            </div>
          )}

          {!isLoadingSchedules &&
            schedules.map((s) => {
              const isSelected = selections.has(s.id);
              const selData = selections.get(s.id);

              return (
                <div
                  key={s.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    isSelected ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSchedule(s.id)}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900">{s.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={s.taskType === 'PREVENTIVE' ? 'info' : 'warning'}
                          className="text-xs"
                        >
                          {s.taskType === 'PREVENTIVE' ? 'Preventive' : 'Inspection'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {[
                            s.intervalKm != null
                              ? `${s.intervalKm.toLocaleString()} km`
                              : null,
                            s.intervalDays != null ? `${s.intervalDays} days` : null,
                          ]
                            .filter(Boolean)
                            .join(' / ') || '—'}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`h-5 w-5 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                  </div>

                  {/* Expanded options when selected */}
                  {isSelected && selData && (
                    <div className="mt-3 pt-3 border-t border-blue-200 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Last Service Date
                          </label>
                          <input
                            type="date"
                            value={selData.lastServiceDate}
                            onChange={(e) =>
                              updateSelection(s.id, 'lastServiceDate', e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Last Service Odometer
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="km"
                            value={selData.lastServiceOdometer}
                            onChange={(e) =>
                              updateSelection(s.id, 'lastServiceOdometer', e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Notes
                        </label>
                        <input
                          type="text"
                          placeholder="Optional notes…"
                          value={selData.notes}
                          onChange={(e) => updateSelection(s.id, 'notes', e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || selections.size === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning…
              </>
            ) : (
              `Assign ${selections.size > 0 ? `${selections.size} Plan${selections.size !== 1 ? 's' : ''}` : 'Plans'}`
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
