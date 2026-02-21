import React from 'react';
import { Shield, AlertTriangle, FileText } from 'lucide-react';
import type { TruckOverviewProps, AlertCardProps } from '../../_types';

export function TruckOverview({ truck }: TruckOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Truck Information */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Truck Information
          </h3>
          <div className="space-y-3">
            <InfoRow label="Plate Number" value={truck.plateNumber} />
            <InfoRow label="VIN" value={truck.vinNumber} />
            <InfoRow label="Make / Model" value={`${truck.make} ${truck.model}`} />
            <InfoRow label="Year" value={truck.year} />
            <InfoRow label="Engine Number" value={truck.engineNumber} />
            <InfoRow label="Engine Capacity" value={`${truck.engineCapacity} CC`} />
            <InfoRow label="Fuel Type" value={truck.fuelType} />
            <InfoRow label="Fuel Tank" value={`${truck.fuelTankCapacity} Litres`} />
            <InfoRow label="Transmission" value={truck.transmissionType} />
            <InfoRow label="Axle Config" value={truck.axleConfig} />
            <InfoRow label="Color" value={truck.color} />
          </div>
        </div>

        {/* Compliance Info */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Compliance Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Insurance</p>
                <p className="text-xs text-green-600">Valid until {truck.insuranceExpiryDate || 'N/A'}</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Road License</p>
                <p className="text-xs text-green-600">Valid until {truck.roadLicenceExpiryDate || 'N/A'}</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Inspection</p>
                <p className="text-xs text-yellow-600">Due in 15 days {truck.inspectionExpiryDate && `(${truck.inspectionExpiryDate})`}</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div>
        <div className="bg-white rounded-lg p-6 border border-gray-200 h-full shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Active Alerts
          </h3>
          
          {truck.alerts > 0 ? (
            <div className="space-y-3">
              {/* Mock Alerts */}
              <AlertCard 
                severity="high" 
                title="Service Overdue" 
                date="2 days ago"
                description="Scheduled maintenance A is overdue by 500km."
              />
              <AlertCard 
                severity="medium" 
                title="Low Tyre Pressure" 
                date="Today, 08:30 AM"
                description="Detected low pressure in Drive Axle 1 - Left Outer tyre."
              />
              <AlertCard 
                severity="medium" 
                title="Fuel Efficiency Drop" 
                date="3 days ago"
                description="Fuel consumption increased by 15% in the last trip."
              />
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <Shield className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No active alerts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || '-'}</span>
    </div>
  );
}

function AlertCard({ severity, title, date, description }: AlertCardProps) {
  const colors = {
    high: "bg-red-50 border-red-200 text-red-700",
    medium: "bg-yellow-50 border-yellow-200 text-yellow-700",
    low: "bg-blue-50 border-blue-200 text-blue-700"
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[severity as keyof typeof colors]}`}>
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-medium text-sm">{title}</h4>
        <span className="text-xs opacity-75">{date}</span>
      </div>
      <p className="text-sm opacity-90">{description}</p>
    </div>
  );
}
