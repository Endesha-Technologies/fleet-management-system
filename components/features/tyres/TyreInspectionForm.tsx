'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { TyreInspectionDetail, TreadDepthReading } from '@/types/inspection';
import {
  TYRE_CONDITIONS,
  DAMAGE_TYPES,
  DAMAGE_SEVERITIES,
  RECOMMENDED_ACTIONS,
  ACTION_URGENCIES,
  MIN_TREAD_DEPTH,
  RECOMMENDED_MIN_TREAD_DEPTH,
} from '@/constants/inspections';
import { AlertCircle, Camera, Trash2 } from 'lucide-react';

interface TyreInspectionFormProps {
  tyreId: string;
  position: string;
  onSave: (inspection: TyreInspectionDetail) => void;
  initialData?: TyreInspectionDetail;
}

export function TyreInspectionForm({
  tyreId,
  position,
  onSave,
  initialData,
}: TyreInspectionFormProps) {
  const [treadDepth, setTreadDepth] = useState<TreadDepthReading>(
    initialData?.treadDepth || { inner: 0, center: 0, outer: 0 }
  );
  const [pressure, setPressure] = useState(initialData?.pressure || 0);
  const [recommendedPressure, setRecommendedPressure] = useState(
    initialData?.recommendedPressure || 32
  );
  const [condition, setCondition] = useState(initialData?.condition || 'good');
  const [selectedDamages, setSelectedDamages] = useState<string[]>(
    initialData?.damages.map((d) => d.type) || []
  );
  const [damageSeverity, setDamageSeverity] = useState(
    initialData?.damages[0]?.severity || 'minor'
  );
  const [damageDescription, setDamageDescription] = useState(
    initialData?.damages[0]?.description || ''
  );
  const [recommendedAction, setRecommendedAction] = useState(
    initialData?.recommendedAction || 'continue-use'
  );
  const [urgency, setUrgency] = useState(initialData?.urgency || 'next-service');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const calculateRemainingTreadLife = () => {
    const avgTread = (treadDepth.inner + treadDepth.center + treadDepth.outer) / 3;
    const maxTread = 8; // Assume new tyre has 8mm
    return Math.max(0, Math.min(100, ((avgTread - MIN_TREAD_DEPTH) / (maxTread - MIN_TREAD_DEPTH)) * 100));
  };

  const getInspectionResult = () => {
    const avgTread = (treadDepth.inner + treadDepth.center + treadDepth.outer) / 3;
    if (avgTread < MIN_TREAD_DEPTH) return 'fail';
    if (selectedDamages.length > 0 && damageSeverity === 'severe') return 'fail';
    return 'pass';
  };

  const avgTreadDepth = (treadDepth.inner + treadDepth.center + treadDepth.outer) / 3;
  const isCritical = avgTreadDepth < RECOMMENDED_MIN_TREAD_DEPTH;

  const handleSubmit = () => {
    const inspection: TyreInspectionDetail = {
      tyreId,
      position,
      treadDepth,
      pressure,
      recommendedPressure,
      condition,
      damages: selectedDamages.map((type) => ({
        type: type as any,
        severity: damageSeverity,
        description: damageDescription,
      })),
      result: getInspectionResult(),
      recommendedAction,
      urgency,
      photos: [],
      notes,
      remainingTreadLife: calculateRemainingTreadLife(),
    };
    onSave(inspection);
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{position}</h3>
        <p className="text-sm text-gray-600">Tyre ID: {tyreId}</p>
      </div>

      {/* Tread Depth */}
      <div className="mb-6">
        <Label className="text-base font-semibold mb-3 block">Tread Depth (mm)</Label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`${position}-inner`}>Inner</Label>
            <Input
              id={`${position}-inner`}
              type="number"
              step="0.1"
              value={treadDepth.inner || ''}
              onChange={(e) =>
                setTreadDepth({ ...treadDepth, inner: parseFloat(e.target.value) || 0 })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`${position}-center`}>Center</Label>
            <Input
              id={`${position}-center`}
              type="number"
              step="0.1"
              value={treadDepth.center || ''}
              onChange={(e) =>
                setTreadDepth({ ...treadDepth, center: parseFloat(e.target.value) || 0 })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`${position}-outer`}>Outer</Label>
            <Input
              id={`${position}-outer`}
              type="number"
              step="0.1"
              value={treadDepth.outer || ''}
              onChange={(e) =>
                setTreadDepth({ ...treadDepth, outer: parseFloat(e.target.value) || 0 })
              }
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                isCritical ? 'bg-red-500' : avgTreadDepth < 4 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, (avgTreadDepth / 8) * 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium">
            Avg: {avgTreadDepth.toFixed(1)}mm ({calculateRemainingTreadLife().toFixed(0)}%)
          </span>
        </div>
        {isCritical && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            Below recommended minimum ({RECOMMENDED_MIN_TREAD_DEPTH}mm)
          </div>
        )}
      </div>

      {/* Pressure */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${position}-pressure`}>Current Pressure (PSI)</Label>
          <Input
            id={`${position}-pressure`}
            type="number"
            value={pressure || ''}
            onChange={(e) => setPressure(parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`${position}-rec-pressure`}>Recommended Pressure (PSI)</Label>
          <Input
            id={`${position}-rec-pressure`}
            type="number"
            value={recommendedPressure || ''}
            onChange={(e) => setRecommendedPressure(parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
      </div>

      {/* Condition */}
      <div className="mb-6">
        <Label className="text-base font-semibold mb-2 block">Overall Condition</Label>
        <div className="flex gap-3">
          {TYRE_CONDITIONS.map((cond) => (
            <button
              key={cond.value}
              type="button"
              onClick={() => setCondition(cond.value)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                condition === cond.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {cond.label}
            </button>
          ))}
        </div>
      </div>

      {/* Damage Types */}
      <div className="mb-6">
        <Label className="text-base font-semibold mb-2 block">Damage Types</Label>
        <div className="grid grid-cols-2 gap-3">
          {DAMAGE_TYPES.map((damage) => (
            <div key={damage.value} className="flex items-center gap-2">
              <Checkbox
                id={`${position}-${damage.value}`}
                checked={selectedDamages.includes(damage.value)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.checked) {
                    setSelectedDamages([...selectedDamages, damage.value]);
                  } else {
                    setSelectedDamages(selectedDamages.filter((d) => d !== damage.value));
                  }
                }}
              />
              <Label htmlFor={`${position}-${damage.value}`} className="cursor-pointer">
                {damage.label}
              </Label>
            </div>
          ))}
        </div>

        {selectedDamages.length > 0 && (
          <div className="mt-4 space-y-3">
            <div>
              <Label>Damage Severity</Label>
              <div className="flex gap-2 mt-1">
                {DAMAGE_SEVERITIES.map((sev) => (
                  <button
                    key={sev.value}
                    type="button"
                    onClick={() => setDamageSeverity(sev.value)}
                    className={`px-3 py-1 rounded text-sm border-2 ${
                      damageSeverity === sev.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    {sev.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor={`${position}-damage-desc`}>Damage Description</Label>
              <Input
                id={`${position}-damage-desc`}
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                placeholder="Describe the damage..."
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Recommended Action */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <Label>Recommended Action</Label>
          <select
            value={recommendedAction}
            onChange={(e) => setRecommendedAction(e.target.value as any)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {RECOMMENDED_ACTIONS.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Urgency</Label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as any)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {ACTION_URGENCIES.map((urg) => (
              <option key={urg.value} value={urg.value}>
                {urg.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <Label htmlFor={`${position}-notes`}>Notes</Label>
        <textarea
          id={`${position}-notes`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Any additional observations..."
        />
      </div>

      {/* Result Preview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Inspection Result:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              getInspectionResult() === 'pass'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {getInspectionResult().toUpperCase()}
          </span>
        </div>
      </div>

      <Button onClick={handleSubmit} className="w-full">
        Save Inspection
      </Button>
    </Card>
  );
}
