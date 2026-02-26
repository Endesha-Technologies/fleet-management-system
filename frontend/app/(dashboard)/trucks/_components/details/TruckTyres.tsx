'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  Search,
  PlusCircle,
  Circle,
  AlertCircle,
  CheckCircle2,
  Wrench,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  Eye,
  Gauge,
  User,
  LayoutGrid,
  History,
  ChevronDown,
  ChevronRight,
  MoveRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabContentSkeleton } from './TruckDetailSkeleton';
import { useTruckTyreEvents } from '../../[id]/_hooks';
import type { TruckTyresProps } from '../../_types';
import type {
  TyreAxlePositions,
  PositionSummary,
  TyreEventFilterType,
  TyreEvent,
  TyreEventGroup,
  TyreHistoryEvent,
  RotationMethod,
} from '@/api/tyres/tyres.types';
import { TyreAssignmentDialog } from '../dialogs/TyreAssignmentDialog';
import { RotateTyresDrawer } from './RotateTyresDrawer';
import { InspectTyresDrawer } from './InspectTyresDrawer';
import { DismountTyresDrawer } from './DismountTyresDrawer';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type ActivityFilter = 'MOUNTED' | 'DISMOUNTED' | 'ROTATED' | 'INSPECTED';

const FILTER_OPTIONS: {
  key: ActivityFilter;
  apiType: TyreEventFilterType;
  label: string;
}[] = [
  { key: 'MOUNTED', apiType: 'mounts', label: 'Mounts' },
  { key: 'DISMOUNTED', apiType: 'dismounts', label: 'Dismounts' },
  { key: 'ROTATED', apiType: 'rotations', label: 'Rotations' },
  { key: 'INSPECTED', apiType: 'inspections', label: 'Inspections' },
];

const EVENT_LABELS: Record<TyreHistoryEvent, string> = {
  MOUNTED: 'Mounted',
  DISMOUNTED: 'Dismounted',
  ROTATED: 'Rotated',
  INSPECTED: 'Inspected',
};

const ROTATION_METHOD_LABELS: Record<RotationMethod, string> = {
  FRONT_TO_BACK: 'Front → Back',
  CROSS: 'Cross Pattern',
  SIDE_TO_SIDE: 'Side to Side',
  CUSTOM: 'Custom',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function treadColor(depth: number | null): string {
  if (depth === null) return 'text-gray-400';
  if (depth < 4) return 'text-red-600';
  if (depth < 8) return 'text-yellow-600';
  return 'text-green-600';
}

function treadBg(depth: number | null): string {
  if (depth === null) return 'bg-gray-100';
  if (depth < 4) return 'bg-red-50';
  if (depth < 8) return 'bg-yellow-50';
  return 'bg-green-50';
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Inner tab type
// ---------------------------------------------------------------------------

type InnerTab = 'positions' | 'activity';

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function TruckTyres({
  truckId,
  truck,
  tyrePositions,
  isLoading,
  onRefresh,
  readOnly,
}: TruckTyresProps) {
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('MOUNTED');
  const [activeTab, setActiveTab] = useState<InnerTab>('positions');
  const [mountDialogOpen, setMountDialogOpen] = useState(false);
  const [rotateDrawerOpen, setRotateDrawerOpen] = useState(false);
  const [inspectDrawerOpen, setInspectDrawerOpen] = useState(false);
  const [dismountDrawerOpen, setDismountDrawerOpen] = useState(false);

  const apiType = FILTER_OPTIONS.find((o) => o.key === activeFilter)!.apiType;

  const {
    data: eventsData,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useTruckTyreEvents(truckId, apiType);

  if (isLoading) return <TabContentSkeleton rows={6} />;

  if (!tyrePositions || tyrePositions.axles.length === 0) {
    return <EmptyState />;
  }

  const { summary, axles } = tyrePositions;

  return (
    <div className="space-y-4">
      {/* ── Summary + Actions ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-5">
          <SummaryPill icon={CheckCircle2} label="Occupied" value={summary.occupiedPositions} color="text-green-600" />
          <SummaryPill icon={Circle} label="Empty" value={summary.emptyPositions} color="text-gray-400" />
          <SummaryPill icon={AlertCircle} label="Total" value={summary.totalPositions} color="text-blue-600" />
        </div>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            {summary.occupiedPositions > 0 ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setInspectDrawerOpen(true)}>
                  <Search className="h-4 w-4 mr-1.5" />
                  Inspect
                </Button>
                <Button variant="outline" size="sm" onClick={() => setMountDialogOpen(true)}>
                  <ArrowDownToLine className="h-4 w-4 mr-1.5" />
                  Mount
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDismountDrawerOpen(true)}>
                  <ArrowUpFromLine className="h-4 w-4 mr-1.5" />
                  Dismount
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setRotateDrawerOpen(true)}>
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  Rotate
                </Button>
              </>
            ) : (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setMountDialogOpen(true)}>
                <ArrowDownToLine className="h-4 w-4 mr-1.5" />
                Mount Tyres
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Mini Tabs ──────────────────────────────────────────────── */}
      <div className="inline-flex bg-gray-100 p-1 rounded-lg gap-1">
        <button
          onClick={() => setActiveTab('positions')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'positions'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Positions
          <span className="text-xs text-gray-400">
            {summary.occupiedPositions}/{summary.totalPositions}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'activity'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <History className="h-4 w-4" />
          Activity
          {eventsData && eventsData.totalEvents > 0 && (
            <span className="text-xs text-gray-400">
              {eventsData.totalEvents}
            </span>
          )}
        </button>
      </div>

      {/* ── Tab Content ────────────────────────────────────────────── */}
      {activeTab === 'positions' ? (
        <PositionsPanel axles={axles} summary={summary} />
      ) : (
        <ActivityPanel
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          eventsData={eventsData}
          eventsLoading={eventsLoading}
          onRefresh={() => { refetchEvents(); onRefresh(); }}
        />
      )}

      {/* ── Dialogs / Drawers ──────────────────────────────────────── */}
      <TyreAssignmentDialog
        open={mountDialogOpen}
        onOpenChange={setMountDialogOpen}
        truckId={truckId}
        onComplete={() => { setMountDialogOpen(false); refetchEvents(); onRefresh(); }}
      />
      <RotateTyresDrawer
        open={rotateDrawerOpen}
        onOpenChange={setRotateDrawerOpen}
        truckId={truckId}
        registrationNumber={truck.registrationNumber}
        currentOdometer={truck.currentOdometer ?? 0}
        tyrePositions={tyrePositions}
        onComplete={() => { setRotateDrawerOpen(false); refetchEvents(); onRefresh(); }}
      />
      <InspectTyresDrawer
        open={inspectDrawerOpen}
        onOpenChange={setInspectDrawerOpen}
        truckId={truckId}
        registrationNumber={truck.registrationNumber}
        tyrePositions={tyrePositions}
        onComplete={() => { setInspectDrawerOpen(false); refetchEvents(); onRefresh(); }}
      />
      <DismountTyresDrawer
        open={dismountDrawerOpen}
        onOpenChange={setDismountDrawerOpen}
        truckId={truckId}
        registrationNumber={truck.registrationNumber}
        currentOdometer={truck.currentOdometer ?? 0}
        tyrePositions={tyrePositions}
        onComplete={() => { setDismountDrawerOpen(false); refetchEvents(); onRefresh(); }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Positions Panel
// ---------------------------------------------------------------------------

function PositionsPanel({
  axles,
  summary,
}: {
  axles: TyreAxlePositions[];
  summary: { occupiedPositions: number; totalPositions: number };
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Visual axle diagram */}
      <div className="p-4 space-y-3 border-b border-gray-100">
        {axles
          .sort((a, b) => a.axleIndex - b.axleIndex)
          .map((axle) => (
            <AxleCard key={axle.id} axle={axle} />
          ))}
      </div>

      {/* Desktop positions table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2 text-left font-medium text-gray-600">Position</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Serial</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Brand</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Model</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Size</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Type</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">Tread</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">Mileage</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {axles.flatMap((axle) =>
              axle.positions.map((pos) => (
                <tr key={pos.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-3 py-2 font-medium text-gray-900">{pos.positionCode}</td>
                  <td className="px-3 py-2">
                    {pos.currentTyre ? (
                      <span className="font-mono text-gray-800">{pos.currentTyre.serialNumber}</span>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {pos.currentTyre?.tyreBrand || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {pos.currentTyre?.tyreModel || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {pos.currentTyre?.tyreSize || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-2">
                    {pos.currentTyre?.tyreType ? (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {pos.currentTyre.tyreType}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {pos.currentTyre?.tyreTreadDepth != null ? (
                      <span className={`font-medium ${treadColor(pos.currentTyre.tyreTreadDepth)}`}>
                        {pos.currentTyre.tyreTreadDepth} mm
                      </span>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-gray-600">
                    {pos.currentTyre ? `${pos.currentTyre.tyreTotalMileage.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      pos.status === 'OCCUPIED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {pos.status === 'OCCUPIED' ? 'Occupied' : 'Empty'}
                    </span>
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="sm:hidden p-3 space-y-2">
        {axles.flatMap((axle) =>
          axle.positions.map((pos) => (
            <div
              key={pos.id}
              className={`rounded-lg border p-3 ${
                pos.status === 'OCCUPIED'
                  ? 'border-gray-200 bg-white'
                  : 'border-dashed border-gray-300 bg-gray-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-900">{pos.positionCode}</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  pos.status === 'OCCUPIED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {pos.status === 'OCCUPIED' ? 'Occupied' : 'Empty'}
                </span>
              </div>
              {pos.currentTyre ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-800 font-medium">{pos.currentTyre.serialNumber}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{pos.currentTyre.tyreType}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-500">
                    <span>{pos.currentTyre.tyreBrand} {pos.currentTyre.tyreModel}</span>
                    <span>{pos.currentTyre.tyreSize}</span>
                  </div>
                  <div className="flex gap-x-4 mt-1 text-[11px]">
                    {pos.currentTyre.tyreTreadDepth != null && (
                      <span className={`font-medium ${treadColor(pos.currentTyre.tyreTreadDepth)}`}>
                        {pos.currentTyre.tyreTreadDepth} mm tread
                      </span>
                    )}
                    <span className="text-gray-500 font-mono">{pos.currentTyre.tyreTotalMileage.toLocaleString()} km</span>
                  </div>
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">No tyre mounted</span>
              )}
            </div>
          )),
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity Panel – Simple tables grouped by date, collapsible
// ---------------------------------------------------------------------------

function ActivityPanel({
  activeFilter,
  setActiveFilter,
  eventsData,
  eventsLoading,
  onRefresh,
}: {
  activeFilter: ActivityFilter;
  setActiveFilter: (f: ActivityFilter) => void;
  eventsData: { totalEvents: number; groups: TyreEventGroup[] } | null;
  eventsLoading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-3">
      {/* Filter tabs + refresh */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex bg-gray-100 p-1 rounded-lg gap-1 overflow-x-auto">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActiveFilter(opt.key)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeFilter === opt.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
              {activeFilter === opt.key && eventsData && (
                <span className="text-[10px] text-gray-400">{eventsData.totalEvents}</span>
              )}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} className="flex-shrink-0">
          <RefreshCw className={`h-3.5 w-3.5 ${eventsLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Content */}
      {eventsLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-32 mb-2" />
                <div className="h-10 bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : !eventsData || eventsData.groups.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center py-12 px-4 text-center">
          <Eye className="h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500 mb-1">No events found</p>
          <p className="text-xs text-gray-400">Events will appear here as tyre operations are performed.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {eventsData.groups
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((group) => (
              <CollapsibleDateGroup key={group.date} group={group} eventType={activeFilter} />
            ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Collapsible Date Group with Table
// ---------------------------------------------------------------------------

function CollapsibleDateGroup({ group, eventType }: { group: TyreEventGroup; eventType: ActivityFilter }) {
  const [open, setOpen] = useState(true);
  const sortedEvents = [...group.events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-900">
            {formatDate(group.date)}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {group.count} event{group.count !== 1 ? 's' : ''}
        </span>
      </button>

      {/* Table content */}
      {open && (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block border-t border-gray-100">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Time</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Tyre</th>
                  <EventTypeHeaders eventType={eventType} />
                  <th className="px-4 py-2 text-left font-medium text-gray-500">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedEvents.map((event) => (
                  <EventTableRow key={event.id} event={event} eventType={eventType} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="sm:hidden border-t border-gray-100 divide-y divide-gray-50">
            {sortedEvents.map((event) => (
              <EventMobileRow key={event.id} event={event} eventType={eventType} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Event-type-specific table headers
// ---------------------------------------------------------------------------

function EventTypeHeaders({ eventType }: { eventType: ActivityFilter }) {
  const th = 'px-4 py-2 text-left font-medium text-gray-500';

  switch (eventType) {
    case 'ROTATED':
      return (
        <>
          <th className={th}>From</th>
          <th className={th}>To</th>
          <th className={th}>Odometer</th>
          <th className={th}>Method</th>
        </>
      );
    case 'INSPECTED':
      return (
        <>
          <th className={th}>Position</th>
          <th className={th}>Tread</th>
          <th className={th}>Pressure</th>
          <th className={th}>Condition</th>
          <th className={th}>Result</th>
        </>
      );
    case 'DISMOUNTED':
      return (
        <>
          <th className={th}>Position</th>
          <th className={th}>Odometer</th>
          <th className={th}>Tread</th>
          <th className={th}>Mileage Accrued</th>
        </>
      );
    case 'MOUNTED':
    default:
      return (
        <>
          <th className={th}>Position</th>
          <th className={th}>Odometer</th>
          <th className={th}>Tread</th>
        </>
      );
  }
}

// ---------------------------------------------------------------------------
// Event Table Row (Desktop) — columns vary by event type
// ---------------------------------------------------------------------------

function EventTableRow({ event, eventType }: { event: TyreEvent; eventType: ActivityFilter }) {
  const time = new Date(event.createdAt).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const td = 'px-4 py-2.5 text-xs';
  const dash = <span className="text-gray-400">—</span>;

  return (
    <tr className="hover:bg-gray-50/50">
      <td className={`${td} text-gray-600 whitespace-nowrap`}>{time}</td>
      <td className={td}>
        <div>
          <span className="font-mono text-gray-800">{event.tyre.serialNumber}</span>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {event.tyre.tyreBrand} {event.tyre.tyreModel}
          </div>
        </div>
      </td>
      <EventTypeCells event={event} eventType={eventType} td={td} dash={dash} />
      <td className={`${td} text-gray-600 whitespace-nowrap`}>
        {event.performedBy.firstName} {event.performedBy.lastName}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Event-type-specific table cells
// ---------------------------------------------------------------------------

function EventTypeCells({
  event,
  eventType,
  td,
  dash,
}: {
  event: TyreEvent;
  eventType: ActivityFilter;
  td: string;
  dash: React.ReactNode;
}) {
  switch (eventType) {
    case 'ROTATED':
      return (
        <>
          <td className={`${td} text-gray-700`}>
            {event.previousPosition ? (
              <>
                <span>{event.previousPosition.positionCode}</span>
                <span className="text-gray-400 ml-1 text-[10px]">{event.previousPosition.axleConfig.axleName}</span>
              </>
            ) : dash}
          </td>
          <td className={`${td} text-gray-700`}>
            <span>{event.position.positionCode}</span>
            <span className="text-gray-400 ml-1 text-[10px]">{event.position.axleConfig.axleName}</span>
          </td>
          <td className={`${td} text-gray-600 whitespace-nowrap`}>
            {event.odometerReading != null ? `${event.odometerReading.toLocaleString()} km` : dash}
          </td>
          <td className={`${td} text-gray-600`}>
            {event.rotationMethod ? (ROTATION_METHOD_LABELS[event.rotationMethod] ?? event.rotationMethod) : dash}
          </td>
        </>
      );

    case 'INSPECTED': {
      const insp = event.inspection;
      return (
        <>
          <td className={`${td} text-gray-700`}>
            <span>{event.position.positionCode}</span>
            <span className="text-gray-400 ml-1 text-[10px]">{event.position.axleConfig.axleName}</span>
          </td>
          <td className={`${td} whitespace-nowrap`}>
            {insp ? (
              <span className={treadColor(insp.treadDepth)}>{insp.treadDepth} mm</span>
            ) : (event.treadDepthMm != null ? (
              <span className={treadColor(event.treadDepthMm)}>{event.treadDepthMm} mm</span>
            ) : dash)}
          </td>
          <td className={`${td} text-gray-600 whitespace-nowrap`}>
            {insp ? `${insp.pressure} psi` : dash}
          </td>
          <td className={`${td} text-gray-600 capitalize`}>
            {insp ? insp.visualCondition : dash}
          </td>
          <td className={td}>
            {insp ? (
              <span className={`font-medium ${insp.passed ? 'text-green-700' : 'text-red-700'}`}>
                {insp.passed ? 'Pass' : 'Fail'}
              </span>
            ) : dash}
          </td>
        </>
      );
    }

    case 'DISMOUNTED':
      return (
        <>
          <td className={`${td} text-gray-700`}>
            <span>{event.position.positionCode}</span>
            <span className="text-gray-400 ml-1 text-[10px]">{event.position.axleConfig.axleName}</span>
          </td>
          <td className={`${td} text-gray-600 whitespace-nowrap`}>
            {event.odometerReading != null ? `${event.odometerReading.toLocaleString()} km` : dash}
          </td>
          <td className={`${td} whitespace-nowrap`}>
            {event.treadDepthMm != null ? (
              <span className={treadColor(event.treadDepthMm)}>{event.treadDepthMm} mm</span>
            ) : dash}
          </td>
          <td className={`${td} text-gray-600 whitespace-nowrap`}>
            {event.mileageAccrued != null && event.mileageAccrued > 0
              ? `+${event.mileageAccrued.toLocaleString()} km`
              : dash}
          </td>
        </>
      );

    case 'MOUNTED':
    default:
      return (
        <>
          <td className={`${td} text-gray-700`}>
            <span>{event.position.positionCode}</span>
            <span className="text-gray-400 ml-1 text-[10px]">{event.position.axleConfig.axleName}</span>
          </td>
          <td className={`${td} text-gray-600 whitespace-nowrap`}>
            {event.odometerReading != null ? `${event.odometerReading.toLocaleString()} km` : dash}
          </td>
          <td className={`${td} whitespace-nowrap`}>
            {event.treadDepthMm != null ? (
              <span className={treadColor(event.treadDepthMm)}>{event.treadDepthMm} mm</span>
            ) : dash}
          </td>
        </>
      );
  }
}

// ---------------------------------------------------------------------------
// Event Mobile Row — details vary by event type
// ---------------------------------------------------------------------------

function EventMobileRow({ event, eventType }: { event: TyreEvent; eventType: ActivityFilter }) {
  const time = new Date(event.createdAt).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="px-4 py-3 space-y-1.5">
      {/* Row 1: time + by */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{time}</span>
        <span className="text-[10px] text-gray-400">
          {event.performedBy.firstName} {event.performedBy.lastName}
        </span>
      </div>

      {/* Row 2: tyre */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-gray-800">{event.tyre.serialNumber}</span>
        <span className="text-[10px] text-gray-400">
          {event.tyre.tyreBrand} {event.tyre.tyreModel}
        </span>
      </div>

      {/* Row 3: event-specific details */}
      <MobileEventDetails event={event} eventType={eventType} />

      {/* Notes */}
      {event.notes && (
        <p className="text-[10px] text-gray-400 italic line-clamp-1">{event.notes}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile event-specific detail rows
// ---------------------------------------------------------------------------

function MobileEventDetails({ event, eventType }: { event: TyreEvent; eventType: ActivityFilter }) {
  switch (eventType) {
    case 'ROTATED':
      return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          {event.previousPosition && (
            <div className="flex items-center gap-1 text-gray-700">
              <span className="text-gray-500">From</span>
              <span className="font-medium">{event.previousPosition.positionCode}</span>
              <MoveRight className="h-3 w-3 text-gray-400" />
              <span className="text-gray-500">To</span>
              <span className="font-medium">{event.position.positionCode}</span>
            </div>
          )}
          {event.odometerReading != null && (
            <span className="text-gray-600">{event.odometerReading.toLocaleString()} km</span>
          )}
          {event.rotationMethod && (
            <span className="text-gray-500">{ROTATION_METHOD_LABELS[event.rotationMethod] ?? event.rotationMethod}</span>
          )}
        </div>
      );

    case 'INSPECTED': {
      const insp = event.inspection;
      return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          <span className="text-gray-700">{event.position.positionCode}</span>
          {insp && (
            <>
              <span className={treadColor(insp.treadDepth)}>{insp.treadDepth} mm</span>
              <span className="text-gray-600">{insp.pressure} psi</span>
              <span className="text-gray-600 capitalize">{insp.visualCondition}</span>
              <span className={`font-medium ${insp.passed ? 'text-green-700' : 'text-red-700'}`}>
                {insp.passed ? 'Pass' : 'Fail'}
              </span>
            </>
          )}
        </div>
      );
    }

    case 'DISMOUNTED':
      return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          <span className="text-gray-700">{event.position.positionCode}</span>
          {event.odometerReading != null && (
            <span className="text-gray-600">{event.odometerReading.toLocaleString()} km</span>
          )}
          {event.treadDepthMm != null && (
            <span className={treadColor(event.treadDepthMm)}>{event.treadDepthMm} mm</span>
          )}
          {event.mileageAccrued != null && event.mileageAccrued > 0 && (
            <span className="text-gray-500">+{event.mileageAccrued.toLocaleString()} km accrued</span>
          )}
        </div>
      );

    case 'MOUNTED':
    default:
      return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          <span className="text-gray-700">{event.position.positionCode}</span>
          {event.odometerReading != null && (
            <span className="text-gray-600">{event.odometerReading.toLocaleString()} km</span>
          )}
          {event.treadDepthMm != null && (
            <span className={treadColor(event.treadDepthMm)}>{event.treadDepthMm} mm</span>
          )}
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Shared cells: Position & Details
// ---------------------------------------------------------------------------

function PositionCell({ event }: { event: TyreEvent }) {
  if (event.event === 'ROTATED' && event.previousPosition) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-700">
        <span>{event.previousPosition.positionCode}</span>
        <MoveRight className="h-3 w-3 text-gray-400" />
        <span>{event.position.positionCode}</span>
      </div>
    );
  }

  return (
    <span className="text-xs text-gray-700">
      {event.position.positionCode}
      <span className="text-gray-400 ml-1">{event.position.axleConfig.axleName}</span>
    </span>
  );
}

function DetailsCell({ event }: { event: TyreEvent }) {
  const items: React.ReactNode[] = [];

  if (event.odometerReading != null) {
    items.push(
      <span key="odo" className="text-gray-600">
        {event.odometerReading.toLocaleString()} km
      </span>,
    );
  }

  if (event.treadDepthMm != null) {
    items.push(
      <span key="tread" className="text-gray-600">
        {event.treadDepthMm} mm
      </span>,
    );
  }

  if (event.mileageAccrued != null && event.mileageAccrued > 0) {
    items.push(
      <span key="accrued" className="text-gray-500">
        +{event.mileageAccrued.toLocaleString()} km
      </span>,
    );
  }

  if (event.event === 'ROTATED' && event.rotationMethod) {
    items.push(
      <span key="method" className="text-gray-500">
        {ROTATION_METHOD_LABELS[event.rotationMethod] ?? event.rotationMethod}
      </span>,
    );
  }

  if (event.event === 'INSPECTED' && event.inspection) {
    const insp = event.inspection;
    items.push(
      <span key="pressure" className="text-gray-600">{insp.pressure} psi</span>,
    );
    items.push(
      <span key="condition" className="text-gray-600 capitalize">{insp.visualCondition}</span>,
    );
    items.push(
      <span key="result" className={`font-medium ${insp.passed ? 'text-green-700' : 'text-red-700'}`}>
        {insp.passed ? 'Pass' : 'Fail'}
      </span>,
    );
    if (insp.inspectorName) {
      items.push(
        <span key="inspector" className="text-gray-500">{insp.inspectorName}</span>,
      );
    }
  }

  if (items.length === 0) return <span className="text-gray-400">—</span>;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="text-gray-300">·</span>}
          {item}
        </React.Fragment>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components: Summary
// ---------------------------------------------------------------------------

function SummaryPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-sm font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components: Visual Axle Layout
// ---------------------------------------------------------------------------

function AxleCard({ axle }: { axle: TyreAxlePositions }) {
  const left = axle.positions.filter((p) => p.side === 'LEFT');
  const right = axle.positions.filter((p) => p.side === 'RIGHT');

  return (
    <div className="bg-gray-50/60 border border-gray-100 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-800">{axle.axleName}</span>
        <span className="text-[10px] text-gray-400">{axle.axleType} • {axle.tyreSize}</span>
      </div>

      <div className="flex items-center justify-center gap-2.5">
        <div className="flex gap-1">
          {left.sort((a, b) => (a.slot === 'OUTER' ? -1 : 1)).map((pos) => (
            <TyreSlot key={pos.id} position={pos} />
          ))}
        </div>
        <div className="w-16 h-1.5 bg-gray-300 rounded-full" />
        <div className="flex gap-1">
          {right.sort((a, b) => (a.slot === 'INNER' ? -1 : 1)).map((pos) => (
            <TyreSlot key={pos.id} position={pos} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TyreSlot({ position }: { position: PositionSummary }) {
  const hasTyre = position.status === 'OCCUPIED' && position.currentTyre;

  return (
    <div
      className={`
        w-12 h-16 rounded-md border-2 flex flex-col items-center justify-center text-center p-0.5 transition-colors cursor-default
        ${hasTyre
          ? `border-gray-400 ${treadBg(position.currentTyre?.tyreTreadDepth ?? null)}`
          : 'border-dashed border-gray-300 bg-white'
        }
      `}
      title={hasTyre ? `${position.positionCode}: ${position.currentTyre!.serialNumber}` : `${position.positionCode}: Empty`}
    >
      {hasTyre ? (
        <>
          <span className="text-[8px] font-bold text-gray-700 leading-tight truncate w-full">
            {position.currentTyre!.serialNumber.slice(-6)}
          </span>
          <span className={`text-[8px] font-medium mt-0.5 ${treadColor(position.currentTyre!.tyreTreadDepth)}`}>
            {position.currentTyre!.tyreTreadDepth != null ? `${position.currentTyre!.tyreTreadDepth}mm` : '—'}
          </span>
          <span className="text-[7px] text-gray-400">
            {(position.currentTyre!.tyreTotalMileage / 1000).toFixed(0)}k
          </span>
        </>
      ) : (
        <>
          <Circle className="h-3 w-3 text-gray-300" />
          <span className="text-[8px] text-gray-400">Empty</span>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-gray-200 rounded-xl border-dashed shadow-sm">
      <div className="h-16 w-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
        <Wrench className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Tyre Positions Configured
      </h3>
      <p className="text-gray-500 text-center max-w-sm mb-6">
        This truck&apos;s axle configuration has no tyre positions yet. Configure axles to start managing tyres.
      </p>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
        <PlusCircle className="h-4 w-4 mr-2" />
        Configure Axles
      </Button>
    </div>
  );
}
