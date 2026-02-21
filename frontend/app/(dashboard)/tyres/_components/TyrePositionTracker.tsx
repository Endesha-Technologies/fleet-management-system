'use client';

import type { TyreWearData } from '../_types';
import { TYRE_POSITIONS, TREAD_DEPTH_THRESHOLDS } from '@/constants/rotation';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface TyrePositionTrackerProps {
  wearData: TyreWearData[];
  title?: string;
  showWearPercentage?: boolean;
}

export function TyrePositionTracker({
  wearData,
  title = 'Tyre Position & Wear Analysis',
  showWearPercentage = true,
}: TyrePositionTrackerProps) {
  const getTreadDepthStatus = (depth: number) => {
    if (depth <= TREAD_DEPTH_THRESHOLDS.CRITICAL) {
      return { status: 'critical', color: 'bg-red-600', label: 'Replace' };
    }
    if (depth <= TREAD_DEPTH_THRESHOLDS.WARNING) {
      return { status: 'warning', color: 'bg-orange-500', label: 'Rotate' };
    }
    if (depth <= TREAD_DEPTH_THRESHOLDS.GOOD) {
      return { status: 'good', color: 'bg-yellow-500', label: 'Monitor' };
    }
    return { status: 'excellent', color: 'bg-green-600', label: 'Good' };
  };

  const getWearIcon = (depth: number) => {
    if (depth <= TREAD_DEPTH_THRESHOLDS.CRITICAL) {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
    if (depth <= TREAD_DEPTH_THRESHOLDS.WARNING) {
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const calculateAverageWear = () => {
    if (wearData.length === 0) return 0;
    const totalWear = wearData.reduce((sum, d) => sum + d.wearPercentage, 0);
    return Math.round(totalWear / wearData.length);
  };

  const getMaxWearVariation = () => {
    if (wearData.length === 0) return 0;
    const maxTread = Math.max(...wearData.map((d) => d.treadDepth));
    const minTread = Math.min(...wearData.map((d) => d.treadDepth));
    return (maxTread - minTread).toFixed(2);
  };

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xs text-gray-600 uppercase tracking-wider">Average Tread</div>
            <div className="text-lg font-bold text-gray-900 mt-1">
              {wearData.length > 0 ? (
                <>
                  {(wearData.reduce((sum, d) => sum + d.treadDepth, 0) / wearData.length).toFixed(1)}
                  <span className="text-sm text-gray-600"> mm</span>
                </>
              ) : (
                'N/A'
              )}
            </div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xs text-gray-600 uppercase tracking-wider">Average Wear</div>
            <div className="text-lg font-bold text-gray-900 mt-1">
              {calculateAverageWear()}
              <span className="text-sm text-gray-600">%</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xs text-gray-600 uppercase tracking-wider">Wear Variation</div>
            <div className="text-lg font-bold text-gray-900 mt-1">
              {getMaxWearVariation()}
              <span className="text-sm text-gray-600"> mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tyre Position Grid */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TYRE_POSITIONS.filter((pos) => pos.value !== 'spare').map((position) => {
            const wear = wearData.find((d) => d.position === position.value);
            const status = wear ? getTreadDepthStatus(wear.treadDepth) : null;

            return (
              <div
                key={position.value}
                className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Position Label */}
                <div className="font-semibold text-gray-900 text-center mb-3">
                  {position.label}
                </div>

                {wear ? (
                  <>
                    {/* Tread Depth */}
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <div className="text-xs text-gray-600 mb-1">Tread Depth</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {wear.treadDepth.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">mm</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Remaining</span>
                        {showWearPercentage && (
                          <span className="text-xs font-medium text-gray-900">
                            {wear.wearPercentage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${status?.color}`}
                          style={{ width: `${Math.max(0, 100 - wear.wearPercentage)}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      {getWearIcon(wear.treadDepth)}
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        status?.status === 'excellent'
                          ? 'bg-green-100 text-green-800'
                          : status?.status === 'good'
                          ? 'bg-yellow-100 text-yellow-800'
                          : status?.status === 'warning'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {status?.label}
                      </span>
                    </div>

                    {/* Last Checked */}
                    <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
                      Checked: {new Date(wear.lastChecked).toLocaleDateString()}
                    </div>

                    {/* Rotation Count */}
                    <div className="text-xs text-gray-500">
                      Rotations: {wear.rotationCount}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-sm">No data</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Spare Tyre */}
        {wearData.find((d) => d.position === 'spare') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-4 border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">Spare</div>
                  <div className="text-xs text-gray-600">
                    {wearData.find((d) => d.position === 'spare')?.treadDepth.toFixed(1)} mm
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-900">
                  Last Checked:{' '}
                  {new Date(wearData.find((d) => d.position === 'spare')!.lastChecked).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Keep spare properly maintained for emergency use
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wear Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Wear Analysis</h3>
        <div className="space-y-2 text-sm">
          {calculateAverageWear() > 75 && (
            <div className="flex items-start gap-2 p-2 bg-red-50 rounded">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-red-900">Replace Tyres Soon</div>
                <div className="text-red-800 text-xs">Average wear is above 75%. Schedule replacement.</div>
              </div>
            </div>
          )}
          {Number(getMaxWearVariation()) > 2 && (
            <div className="flex items-start gap-2 p-2 bg-orange-50 rounded">
              <AlertCircle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-orange-900">Uneven Wear Detected</div>
                <div className="text-orange-800 text-xs">Variation exceeds 2mm. Rotation recommended.</div>
              </div>
            </div>
          )}
          {calculateAverageWear() <= 50 && Number(getMaxWearVariation()) <= 1.5 && (
            <div className="flex items-start gap-2 p-2 bg-green-50 rounded">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-green-900">Tyres in Good Condition</div>
                <div className="text-green-800 text-xs">Wear is even and within normal range.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
