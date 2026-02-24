'use client';

import React, { useCallback, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import { FormInput, FormSelect } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import type {
  FormStepProps,
  AxleConfig,
} from '../../_types';
import {
  AXLE_TYPE_OPTIONS,
  POSITIONS_PER_SIDE_OPTIONS,
  createDefaultAxle,
} from '../../_types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_AXLES = 8;

const COMMON_TYRE_SIZES = [
  '295/80R22.5',
  '315/80R22.5',
  '385/65R22.5',
  '12R22.5',
  '11R22.5',
  '275/70R22.5',
];

// ---------------------------------------------------------------------------
// Single Axle Card
// ---------------------------------------------------------------------------

interface AxleCardProps {
  axle: AxleConfig;
  index: number;
  canRemove: boolean;
  onUpdate: (key: string, field: keyof Omit<AxleConfig, 'key'>, value: string) => void;
  onRemove: (key: string) => void;
}

function AxleCard({ axle, index, canRemove, onUpdate, onRemove }: AxleCardProps) {
  return (
    <div className="relative rounded-lg border border-gray-200 bg-white">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h4 className="text-sm font-semibold text-gray-900">
          Axle {index}
          {axle.name && (
            <span className="ml-2 font-normal text-gray-500">— {axle.name}</span>
          )}
        </h4>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(axle.key)}
            className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label={`Remove axle ${index}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="space-y-4 p-4">
        {/* Row 1: Name, Type, Positions/Side */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormInput
            label="Name"
            value={axle.name}
            onChange={(e) => onUpdate(axle.key, 'name', e.target.value)}
            placeholder="e.g. Front Steer"
          />
          <FormSelect
            label="Type"
            required
            value={axle.type}
            onChange={(e) => onUpdate(axle.key, 'type', e.target.value)}
            placeholder="Select type"
            options={AXLE_TYPE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
          <FormSelect
            label="Positions / Side"
            required
            value={axle.positionsPerSide}
            onChange={(e) => onUpdate(axle.key, 'positionsPerSide', e.target.value)}
            placeholder="Select"
            options={POSITIONS_PER_SIDE_OPTIONS}
          />
        </div>

        {/* Row 2: Tyre Size, Max Load */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            label="Tyre Size"
            value={axle.tyreSize}
            onChange={(e) => onUpdate(axle.key, 'tyreSize', e.target.value)}
            placeholder="e.g. 295/80R22.5"
            list={`tyre-sizes-${axle.key}`}
          />
          <FormInput
            label="Max Load (kg)"
            value={axle.maxLoad}
            onChange={(e) => onUpdate(axle.key, 'maxLoad', e.target.value)}
            placeholder="e.g. 7000"
            type="number"
          />
        </div>

        {/* Tyre size datalist for auto-suggest */}
        <datalist id={`tyre-sizes-${axle.key}`}>
          {COMMON_TYRE_SIZES.map((size) => (
            <option key={size} value={size} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary Bar
// ---------------------------------------------------------------------------

function AxleSummary({ axles }: { axles: AxleConfig[] }) {
  const stats = useMemo(() => {
    let totalPositions = 0;
    const typeCounts: Record<string, number> = {};

    for (const axle of axles) {
      const perSide = parseInt(axle.positionsPerSide) || 0;
      totalPositions += perSide * 2; // left + right
      const label = AXLE_TYPE_OPTIONS.find((o) => o.value === axle.type)?.label ?? (axle.type || 'Unset');
      typeCounts[label] = (typeCounts[label] ?? 0) + 1;
    }

    return { totalPositions, typeCounts };
  }, [axles]);

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <span className="font-medium text-blue-900">
          {axles.length} {axles.length === 1 ? 'axle' : 'axles'}
        </span>
        <span className="text-blue-700">
          {stats.totalPositions} tyre {stats.totalPositions === 1 ? 'position' : 'positions'}
        </span>
        <span className="text-blue-600">
          {Object.entries(stats.typeCounts)
            .map(([type, count]) => `${count} ${type}`)
            .join(', ')}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AxleTyreConfigStep({ formData, setFormData }: FormStepProps) {
  const axles = formData.axles;

  // Update a single field on a single axle
  const handleUpdateAxle = useCallback(
    (key: string, field: keyof Omit<AxleConfig, 'key'>, value: string) => {
      setFormData({
        ...formData,
        axles: formData.axles.map((a) =>
          a.key === key ? { ...a, [field]: value } : a
        ),
      });
    },
    [formData, setFormData]
  );

  // Remove an axle
  const handleRemoveAxle = useCallback(
    (key: string) => {
      setFormData({
        ...formData,
        axles: formData.axles.filter((a) => a.key !== key),
      });
    },
    [formData, setFormData]
  );

  // Add a new axle (blank — user fills in all fields)
  const handleAddAxle = useCallback(() => {
    if (formData.axles.length >= MAX_AXLES) return;

    setFormData({
      ...formData,
      axles: [...formData.axles, createDefaultAxle()],
    });
  }, [formData, setFormData]);

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Axle Configuration</h3>
          <p className="text-sm text-gray-500">
            Configure each axle with its type, tyre positions, and specifications.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAxle}
          disabled={axles.length >= MAX_AXLES}
          className="shrink-0"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Axle
        </Button>
      </div>

      {/* Axle Cards */}
      <div className="space-y-3">
        {axles.map((axle, index) => (
          <AxleCard
            key={axle.key}
            axle={axle}
            index={index}
            canRemove={axles.length > 1}
            onUpdate={handleUpdateAxle}
            onRemove={handleRemoveAxle}
          />
        ))}
      </div>

      {/* Add Axle — bottom CTA (when there are already axles) */}
      {axles.length > 0 && axles.length < MAX_AXLES && (
        <button
          type="button"
          onClick={handleAddAxle}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-600"
        >
          <Plus className="h-4 w-4" />
          Add Axle
        </button>
      )}

      {/* Summary */}
      {axles.length > 0 && <AxleSummary axles={axles} />}

      {/* Help text */}
      <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
        <p className="text-sm text-green-800">
          After you submit, you&apos;ll be able to assign tyres to these positions.
        </p>
      </div>
    </div>
  );
}
