'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MOCK_INSPECTIONS, INSPECTION_STATUSES, INSPECTION_RESULTS } from '@/constants/inspections';
import {
  ArrowLeft,
  Calendar,
  User,
  Gauge,
  Download,
  AlertCircle,
  CheckCircle,
  TrendingDown,
} from 'lucide-react';

export default function InspectionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const inspection = MOCK_INSPECTIONS.find((i) => i.id === params.id);

  if (!inspection) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="p-12 text-center">
          <p className="text-gray-500">Inspection not found</p>
          <Button onClick={() => router.push('/tyres/inspections')} className="mt-4">
            Back to Inspections
          </Button>
        </Card>
      </div>
    );
  }

  const statusConfig = INSPECTION_STATUSES.find((s) => s.value === inspection.status);
  const failedTyres = inspection.tyreInspections.filter((t) => t.result === 'fail');
  const criticalIssues = inspection.tyreInspections.filter((t) => t.urgency === 'immediate');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inspection Details</h1>
            <p className="text-gray-600">{inspection.id}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Card */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">Inspection Date</span>
            </div>
            <p className="text-lg font-semibold">
              {new Date(inspection.inspectionDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">Inspector</span>
            </div>
            <p className="text-lg font-semibold">{inspection.inspectorName}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">Odometer</span>
            </div>
            <p className="text-lg font-semibold">{inspection.currentOdometer.toLocaleString()} km</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Status</span>
            </div>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusConfig?.color}`}>
              {statusConfig?.label}
            </span>
          </div>
        </div>
      </Card>

      {/* Vehicle Info */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Vehicle Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Vehicle Name</span>
            <p className="text-lg font-medium">{inspection.vehicleName}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Registration</span>
            <p className="text-lg font-medium">{inspection.vehicleRegistration}</p>
          </div>
        </div>
      </Card>

      {/* Alerts */}
      {(failedTyres.length > 0 || criticalIssues.length > 0) && (
        <Card className="p-6 mb-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Critical Issues Detected</h3>
              {failedTyres.length > 0 && (
                <p className="text-red-800 mb-2">
                  {failedTyres.length} tyre{failedTyres.length > 1 ? 's' : ''} failed inspection
                </p>
              )}
              {criticalIssues.length > 0 && (
                <p className="text-red-800">
                  {criticalIssues.length} issue{criticalIssues.length > 1 ? 's' : ''} require immediate attention
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tyre Inspections */}
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold">Tyre Inspection Results</h2>
        {inspection.tyreInspections.map((tyreInspection) => {
          const resultConfig = INSPECTION_RESULTS.find((r) => r.value === tyreInspection.result);
          const avgTread =
            (tyreInspection.treadDepth.inner +
              tyreInspection.treadDepth.center +
              tyreInspection.treadDepth.outer) / 3;

          return (
            <Card key={tyreInspection.position} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{tyreInspection.position}</h3>
                  <p className="text-sm text-gray-600">Tyre ID: {tyreInspection.tyreId}</p>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${resultConfig?.color}`}>
                  {resultConfig?.label}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                {/* Tread Depth */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tread Depth (mm)</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Inner:</span>
                      <span className="font-medium">{tyreInspection.treadDepth.inner.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Center:</span>
                      <span className="font-medium">{tyreInspection.treadDepth.center.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Outer:</span>
                      <span className="font-medium">{tyreInspection.treadDepth.outer.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1 border-t">
                      <span className="text-gray-600">Average:</span>
                      <span className="font-semibold">{avgTread.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Pressure */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Pressure</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium">{tyreInspection.pressure} PSI</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Recommended:</span>
                      <span className="font-medium">{tyreInspection.recommendedPressure} PSI</span>
                    </div>
                    {Math.abs(tyreInspection.pressure - tyreInspection.recommendedPressure) > 2 && (
                      <div className="flex items-center gap-1 text-orange-600 text-sm mt-2">
                        <AlertCircle className="h-3 w-3" />
                        <span>Adjust pressure</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Condition & Life */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Condition</h4>
                  <div className="space-y-2">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        tyreInspection.condition === 'good'
                          ? 'bg-green-100 text-green-800'
                          : tyreInspection.condition === 'fair'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tyreInspection.condition.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2 text-sm mt-2">
                      <TrendingDown className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {tyreInspection.remainingTreadLife}% life remaining
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recommended Action</h4>
                  <div className="space-y-2">
                    <p className="text-sm font-medium capitalize">
                      {tyreInspection.recommendedAction.replace('-', ' ')}
                    </p>
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        tyreInspection.urgency === 'immediate'
                          ? 'bg-red-100 text-red-800'
                          : tyreInspection.urgency === 'within-week'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tyreInspection.urgency.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Damages */}
              {tyreInspection.damages.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Damages Identified</h4>
                  <div className="space-y-2">
                    {tyreInspection.damages.map((damage, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                        <div>
                          <span className="font-medium capitalize">{damage.type.replace('-', ' ')}</span>
                          <span
                            className={`ml-2 px-2 py-0.5 rounded text-xs ${
                              damage.severity === 'severe'
                                ? 'bg-red-100 text-red-800'
                                : damage.severity === 'moderate'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {damage.severity}
                          </span>
                          {damage.description && (
                            <p className="text-gray-600 mt-1">{damage.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {tyreInspection.notes && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                  <p className="text-sm text-gray-600">{tyreInspection.notes}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Overall Notes */}
      {inspection.overallNotes && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Overall Notes</h2>
          <p className="text-gray-700">{inspection.overallNotes}</p>
        </Card>
      )}

      {/* Inspector Signature */}
      {inspection.inspectorSignature && (
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Inspector Signature</p>
              <p className="font-medium">{inspection.inspectorSignature}</p>
            </div>
            {inspection.completedAt && (
              <div className="ml-auto text-right">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-sm font-medium">
                  {new Date(inspection.completedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
