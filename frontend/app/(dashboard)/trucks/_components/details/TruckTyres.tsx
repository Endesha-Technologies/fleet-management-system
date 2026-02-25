'use client';

import React from 'react';
import {
  RefreshCw,
  Search,
  PlusCircle,
  Circle,
  AlertCircle,
  CheckCircle2,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabContentSkeleton } from './TruckDetailSkeleton';
import type { TruckTyresProps } from '../../_types';
import type {
  TyreAxlePositions,
  PositionSummary,
} from '@/api/tyres/tyres.types';

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TruckTyres({
  truckId,
  truck,
  tyrePositions,
  isLoading,
  onRefresh,
}: TruckTyresProps) {
  if (isLoading) return <TabContentSkeleton rows={6} />;

  if (!tyrePositions || tyrePositions.axles.length === 0) {
    return <EmptyState />;
  }

  const { summary, axles } = tyrePositions;

  return (
    <div className="space-y-6">
      {/* Summary + Actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-6">
          <SummaryPill
            icon={CheckCircle2}
            label="Occupied"
            value={summary.occupiedPositions}
            color="text-green-600"
          />
          <SummaryPill
            icon={Circle}
            label="Empty"
            value={summary.emptyPositions}
            color="text-gray-400"
          />
          <SummaryPill
            icon={AlertCircle}
            label="Total Positions"
            value={summary.totalPositions}
            color="text-blue-600"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-1.5" />
            Inspect
          </Button>
          <Button variant="outline" size="sm">
            <Wrench className="h-4 w-4 mr-1.5" />
            Mount / Dismount
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Rotate Tyres
          </Button>
        </div>
      </div>

      {/* Visual axle layout */}
      <div className="space-y-4">
        {axles
          .sort((a, b) => a.axleIndex - b.axleIndex)
          .map((axle) => (
            <AxleCard key={axle.id} axle={axle} />
          ))}
      </div>

      {/* Flat table view for detail */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Position</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Axle</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tyre Serial</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Brand / Model</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Size</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Tread</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Mileage</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {axles.flatMap((axle) =>
              axle.positions.map((pos) => (
                <tr
                  key={pos.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {pos.positionCode}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{axle.axleName}</td>
                  <td className="px-4 py-3">
                    {pos.currentTyre ? (
                      <span className="font-mono text-blue-600 text-xs">
                        {pos.currentTyre.serialNumber}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Empty</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-xs">
                    {pos.currentTyre
                      ? `${pos.currentTyre.tyreBrand} ${pos.currentTyre.tyreModel}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {pos.currentTyre?.tyreSize ?? axle.tyreSize}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {pos.currentTyre ? (
                      <span
                        className={`font-medium text-xs ${treadColor(
                          pos.currentTyre.tyreTreadDepth,
                        )}`}
                      >
                        {pos.currentTyre.tyreTreadDepth != null
                          ? `${pos.currentTyre.tyreTreadDepth} mm`
                          : '—'}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">
                    {pos.currentTyre
                      ? `${pos.currentTyre.tyreTotalMileage.toLocaleString()} km`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={pos.status === 'OCCUPIED' ? 'success' : 'secondary'}
                      className="text-xs"
                    >
                      {pos.status}
                    </Badge>
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
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
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <div>
        <span className="text-sm font-bold text-gray-900">{value}</span>
        <span className="text-xs text-gray-500 ml-1">{label}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual Axle Card
// ---------------------------------------------------------------------------

function AxleCard({ axle }: { axle: TyreAxlePositions }) {
  const left = axle.positions.filter((p) => p.side === 'LEFT');
  const right = axle.positions.filter((p) => p.side === 'RIGHT');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{axle.axleName}</h4>
          <p className="text-xs text-gray-500">
            {axle.axleType} • {axle.tyreSize} • {axle.positionsPerSide} per side
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Axle {axle.axleIndex + 1}
        </Badge>
      </div>

      {/* Visual layout: LEFT | axle | RIGHT */}
      <div className="flex items-center justify-center gap-4">
        {/* Left side */}
        <div className="flex gap-2">
          {left
            .sort((a, b) => (a.slot === 'OUTER' ? -1 : 1))
            .map((pos) => (
              <TyreSlot key={pos.id} position={pos} />
            ))}
        </div>

        {/* Axle bar */}
        <div className="w-24 h-2 bg-gray-300 rounded-full" />

        {/* Right side */}
        <div className="flex gap-2">
          {right
            .sort((a, b) => (a.slot === 'INNER' ? -1 : 1))
            .map((pos) => (
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
        w-16 h-20 rounded-lg border-2 flex flex-col items-center justify-center text-center p-1 transition-colors
        ${
          hasTyre
            ? `border-gray-400 ${treadBg(position.currentTyre?.tyreTreadDepth ?? null)}`
            : 'border-dashed border-gray-300 bg-gray-50'
        }
      `}
      title={
        hasTyre
          ? `${position.positionCode}: ${position.currentTyre!.serialNumber}`
          : `${position.positionCode}: Empty`
      }
    >
      {hasTyre ? (
        <>
          <span className="text-[10px] font-bold text-gray-700 leading-tight truncate w-full">
            {position.currentTyre!.serialNumber.slice(-6)}
          </span>
          <span
            className={`text-[10px] font-medium mt-0.5 ${treadColor(
              position.currentTyre!.tyreTreadDepth,
            )}`}
          >
            {position.currentTyre!.tyreTreadDepth != null
              ? `${position.currentTyre!.tyreTreadDepth}mm`
              : '—'}
          </span>
          <span className="text-[9px] text-gray-400 mt-0.5">
            {(position.currentTyre!.tyreTotalMileage / 1000).toFixed(0)}k km
          </span>
        </>
      ) : (
        <>
          <Circle className="h-4 w-4 text-gray-300 mb-0.5" />
          <span className="text-[10px] text-gray-400">Empty</span>
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
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-gray-200 rounded-lg border-dashed shadow-sm">
      <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
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
