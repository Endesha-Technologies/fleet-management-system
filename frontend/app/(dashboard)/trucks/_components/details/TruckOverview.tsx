'use client';

import React from 'react';
import {
  FileText,
  Shield,
  AlertTriangle,
  Truck as TruckIcon,
  Settings,
  DollarSign,
  Calendar,
  User,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TruckOverviewProps } from '../../_types';

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

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1_000 * 60 * 60 * 24));
}

type ComplianceStatus = 'valid' | 'expiring' | 'expired' | 'unknown';

function getComplianceStatus(expiryDate: string | null): {
  status: ComplianceStatus;
  label: string;
  days: number | null;
} {
  const days = daysUntil(expiryDate);
  if (days === null) return { status: 'unknown', label: 'No date set', days: null };
  if (days < 0) return { status: 'expired', label: `Expired ${Math.abs(days)}d ago`, days };
  if (days <= 30) return { status: 'expiring', label: `${days}d remaining`, days };
  return { status: 'valid', label: `Valid • ${days}d remaining`, days };
}

const statusColors: Record<ComplianceStatus, string> = {
  valid: 'bg-green-500',
  expiring: 'bg-yellow-500',
  expired: 'bg-red-500',
  unknown: 'bg-gray-300',
};

const statusTextColors: Record<ComplianceStatus, string> = {
  valid: 'text-green-600',
  expiring: 'text-yellow-600',
  expired: 'text-red-600',
  unknown: 'text-gray-400',
};

function formatBodyType(bt: string): string {
  return bt.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDriveType(dt: string | null): string {
  if (!dt) return '—';
  const map: Record<string, string> = {
    FOUR_BY_TWO: '4×2',
    SIX_BY_TWO: '6×2',
    SIX_BY_FOUR: '6×4',
    EIGHT_BY_FOUR: '8×4',
  };
  return map[dt] ?? dt;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
        {value || '—'}
      </span>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  iconColor,
  title,
  children,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        {title}
      </h3>
      {children}
    </div>
  );
}

function ComplianceRow({
  label,
  expiryDate,
  policyOrNumber,
}: {
  label: string;
  expiryDate: string | null;
  policyOrNumber?: string | null;
}) {
  const { status, label: statusLabel } = getComplianceStatus(expiryDate);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-100">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {policyOrNumber && (
          <p className="text-xs text-gray-400 truncate">{policyOrNumber}</p>
        )}
        <p className={`text-xs mt-0.5 ${statusTextColors[status]}`}>
          {expiryDate ? `${formatDate(expiryDate)} • ${statusLabel}` : statusLabel}
        </p>
      </div>
      <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${statusColors[status]}`} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function TruckOverview({ truck }: TruckOverviewProps) {
  const alertItems: { severity: 'high' | 'medium' | 'low'; title: string; description: string }[] = [];

  // Generate real alerts from compliance data
  const complianceChecks = [
    { label: 'Registration', date: truck.registrationExpiry },
    { label: 'Insurance', date: truck.insuranceExpiry },
    { label: 'Inspection', date: truck.inspectionExpiry },
    { label: 'Operating License', date: truck.operatingLicenseExpiry },
  ];

  complianceChecks.forEach(({ label, date }) => {
    const { status, days } = getComplianceStatus(date);
    if (status === 'expired') {
      alertItems.push({
        severity: 'high',
        title: `${label} Expired`,
        description: `${label} expired ${Math.abs(days!)} days ago. Immediate action required.`,
      });
    } else if (status === 'expiring') {
      alertItems.push({
        severity: 'medium',
        title: `${label} Expiring Soon`,
        description: `${label} expires in ${days} days (${formatDate(date)}).`,
      });
    }
  });

  // Maintenance alerts from _count
  if (truck._count.maintenancePlans > 0) {
    alertItems.push({
      severity: 'low',
      title: 'Active Maintenance Plans',
      description: `${truck._count.maintenancePlans} maintenance plan(s) assigned to this truck.`,
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Column 1: Vehicle Information */}
      <div className="space-y-6">
        <SectionCard icon={TruckIcon} iconColor="text-blue-600" title="Vehicle Identity">
          <div className="space-y-0.5">
            <InfoRow label="Registration" value={truck.registrationNumber} />
            <InfoRow label="Fleet Number" value={truck.fleetNumber} />
            <InfoRow label="Make / Model" value={`${truck.make} ${truck.model}`} />
            <InfoRow label="Year" value={truck.year} />
            <InfoRow label="Body Type" value={formatBodyType(truck.bodyType)} />
            <InfoRow label="Color" value={truck.color} />
            <InfoRow label="VIN" value={
              <span className="font-mono text-xs">{truck.vin || '—'}</span>
            } />
            <InfoRow label="Engine Number" value={
              <span className="font-mono text-xs">{truck.engineNumber || '—'}</span>
            } />
            <InfoRow
              label="Status"
              value={
                <Badge
                  variant={
                    truck.status === 'ACTIVE'
                      ? 'success'
                      : truck.status === 'IN_MAINTENANCE'
                      ? 'warning'
                      : 'secondary'
                  }
                >
                  {truck.status.replace(/_/g, ' ')}
                </Badge>
              }
            />
          </div>
        </SectionCard>

        <SectionCard icon={DollarSign} iconColor="text-emerald-600" title="Purchase & Ownership">
          <div className="space-y-0.5">
            <InfoRow label="Ownership" value={truck.ownershipType} />
            <InfoRow label="Purchase Date" value={formatDate(truck.purchaseDate)} />
            <InfoRow
              label="Purchase Price"
              value={
                truck.purchasePrice != null
                  ? `KES ${truck.purchasePrice.toLocaleString()}`
                  : null
              }
            />
            <InfoRow label="Purchased From" value={truck.purchasedFrom} />
            <InfoRow label="Home Depot" value={truck.homeDepot} />
          </div>
        </SectionCard>
      </div>

      {/* Column 2: Technical Specifications & Compliance */}
      <div className="space-y-6">
        <SectionCard icon={Settings} iconColor="text-indigo-600" title="Technical Specifications">
          <div className="space-y-0.5">
            <InfoRow label="Fuel Type" value={truck.fuelType} />
            <InfoRow
              label="Engine Capacity"
              value={truck.engineCapacityCc ? `${truck.engineCapacityCc.toLocaleString()} cc` : null}
            />
            <InfoRow
              label="Horsepower"
              value={truck.horsepower ? `${truck.horsepower} hp` : null}
            />
            <InfoRow label="Transmission" value={truck.transmissionType} />
            <InfoRow label="Gears" value={truck.numberOfGears} />
            <InfoRow label="Drive Type" value={formatDriveType(truck.driveType)} />
            <InfoRow
              label="Tank Capacity"
              value={truck.tankCapacityLiters ? `${truck.tankCapacityLiters} L` : null}
            />
            <InfoRow
              label="AdBlue Tank"
              value={truck.adBlueTankLiters ? `${truck.adBlueTankLiters} L` : null}
            />
          </div>
        </SectionCard>

        <SectionCard icon={FileText} iconColor="text-gray-600" title="Weight & Dimensions">
          <div className="space-y-0.5">
            <InfoRow
              label="Gross Vehicle Mass"
              value={truck.grossVehicleMass ? `${truck.grossVehicleMass.toLocaleString()} kg` : null}
            />
            <InfoRow
              label="Tare Weight"
              value={truck.tareWeight ? `${truck.tareWeight.toLocaleString()} kg` : null}
            />
            <InfoRow
              label="Payload Capacity"
              value={truck.payloadCapacity ? `${truck.payloadCapacity.toLocaleString()} kg` : null}
            />
            <InfoRow
              label="Length"
              value={truck.lengthMm ? `${(truck.lengthMm / 1000).toFixed(1)} m` : null}
            />
            <InfoRow
              label="Width"
              value={truck.widthMm ? `${(truck.widthMm / 1000).toFixed(1)} m` : null}
            />
            <InfoRow
              label="Height"
              value={truck.heightMm ? `${(truck.heightMm / 1000).toFixed(1)} m` : null}
            />
            <InfoRow
              label="Wheelbase"
              value={truck.wheelbaseMm ? `${(truck.wheelbaseMm / 1000).toFixed(1)} m` : null}
            />
          </div>
        </SectionCard>
      </div>

      {/* Column 3: Compliance + Alerts + Meta */}
      <div className="space-y-6">
        <SectionCard icon={Shield} iconColor="text-green-600" title="Compliance Status">
          <div className="space-y-3">
            <ComplianceRow
              label="Vehicle Registration"
              expiryDate={truck.registrationExpiry}
            />
            <ComplianceRow
              label="Insurance"
              expiryDate={truck.insuranceExpiry}
              policyOrNumber={truck.insurancePolicyNumber}
            />
            <ComplianceRow
              label="Inspection Certificate"
              expiryDate={truck.inspectionExpiry}
            />
            <ComplianceRow
              label="Operating License"
              expiryDate={truck.operatingLicenseExpiry}
              policyOrNumber={truck.operatingLicenseNumber}
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={AlertTriangle}
          iconColor={alertItems.length > 0 ? 'text-red-600' : 'text-gray-400'}
          title={`Alerts (${alertItems.length})`}
        >
          {alertItems.length > 0 ? (
            <div className="space-y-3">
              {alertItems.map((alert, idx) => (
                <AlertCard key={idx} {...alert} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Shield className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">All clear — no active alerts</p>
            </div>
          )}
        </SectionCard>

        {/* Activity counts & metadata */}
        <SectionCard icon={Info} iconColor="text-gray-500" title="Activity Summary">
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Trips" value={truck._count.trips} />
            <MiniStat label="Fuel Logs" value={truck._count.fuelLogs} />
            <MiniStat label="Service Logs" value={truck._count.serviceLogs} />
            <MiniStat label="Documents" value={truck._count.documents} />
            <MiniStat label="Assets Installed" value={truck._count.assetInstallations} />
            <MiniStat label="Maintenance Plans" value={truck._count.maintenancePlans} />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <User className="h-3 w-3" />
              Created by {truck.creator.firstName} {truck.creator.lastName}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              {formatDate(truck.createdAt)}
            </div>
          </div>
        </SectionCard>

        {/* Notes */}
        {truck.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">Notes</h4>
            <p className="text-sm text-yellow-700 whitespace-pre-line">{truck.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helper components
// ---------------------------------------------------------------------------

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function AlertCard({
  severity,
  title,
  description,
}: {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}) {
  const colors = {
    high: 'bg-red-50 border-red-200 text-red-700',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    low: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[severity]}`}>
      <h4 className="font-medium text-sm">{title}</h4>
      <p className="text-xs mt-0.5 opacity-90">{description}</p>
    </div>
  );
}
