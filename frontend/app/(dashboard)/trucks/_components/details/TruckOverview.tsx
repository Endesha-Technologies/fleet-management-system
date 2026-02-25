'use client';

import React from 'react';
import {
  Gauge,
  Clock,
  Map,
  Droplet,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Truck as TruckIcon,
  Settings,
  DollarSign,
  Calendar,
  User,
  Fuel,
  Cog,
  Ruler,
  Weight,
  FileText,
  ChevronRight,
  Hash,
  Palette,
  Building2,
  MapPin,
  StickyNote,
  Activity,
  CircleDot,
  Route,
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

type ComplianceLevel = 'valid' | 'expiring' | 'expired' | 'unknown';

function getComplianceLevel(expiryDate: string | null): {
  level: ComplianceLevel;
  days: number | null;
  label: string;
} {
  const days = daysUntil(expiryDate);
  if (days === null) return { level: 'unknown', label: 'Not set', days: null };
  if (days < 0) return { level: 'expired', label: `Expired ${Math.abs(days)}d ago`, days };
  if (days <= 30) return { level: 'expiring', label: `${days} days left`, days };
  return { level: 'valid', label: `${days} days left`, days };
}

const complianceBadgeConfig: Record<ComplianceLevel, { variant: 'success' | 'warning' | 'destructive' | 'secondary'; dotColor: string }> = {
  valid: { variant: 'success', dotColor: 'bg-green-500' },
  expiring: { variant: 'warning', dotColor: 'bg-yellow-500' },
  expired: { variant: 'destructive', dotColor: 'bg-red-500' },
  unknown: { variant: 'secondary', dotColor: 'bg-gray-300' },
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

function formatCurrency(v: number | null): string {
  if (v == null) return '—';
  return `KES ${v.toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Stat card used in the KPI row at top of overview */
function KpiCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-2.5 rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/** A single detail item in the grid */
function DetailItem({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="p-1.5 bg-gray-50 rounded-md mt-0.5 flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 leading-none">{label}</p>
        <p className={`text-sm font-medium text-gray-900 mt-0.5 ${mono ? 'font-mono text-xs' : ''}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

/** Section wrapper with title */
function Section({
  title,
  icon: Icon,
  iconColor = 'text-gray-400',
  children,
  className = '',
}: {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

/** Compliance item card */
function ComplianceCard({
  label,
  expiryDate,
  detail,
}: {
  label: string;
  expiryDate: string | null;
  detail?: string | null;
}) {
  const { level, label: statusLabel } = getComplianceLevel(expiryDate);
  const { variant, dotColor } = complianceBadgeConfig[level];

  return (
    <div className="flex items-center justify-between p-3.5 bg-gray-50/60 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {detail && <p className="text-xs text-gray-400 truncate mt-0.5">{detail}</p>}
          {expiryDate && (
            <p className="text-xs text-gray-400 mt-0.5">
              Expires {formatDate(expiryDate)}
            </p>
          )}
        </div>
      </div>
      <Badge variant={variant} className="flex-shrink-0 ml-3">
        {statusLabel}
      </Badge>
    </div>
  );
}

/** Activity metric */
function ActivityMetric({
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
    <div className="flex items-center gap-3 py-2">
      <div className={`p-1.5 rounded-md ${color}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-sm text-gray-600 flex-1">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function TruckOverview({ truck }: TruckOverviewProps) {
  // Build alerts from compliance data
  const complianceChecks = [
    { label: 'Registration', date: truck.registrationExpiry },
    { label: 'Insurance', date: truck.insuranceExpiry },
    { label: 'Inspection', date: truck.inspectionExpiry },
    { label: 'Operating License', date: truck.operatingLicenseExpiry },
  ];

  const alerts: { severity: 'high' | 'medium'; title: string; message: string }[] = [];
  complianceChecks.forEach(({ label, date }) => {
    const { level, days } = getComplianceLevel(date);
    if (level === 'expired') {
      alerts.push({
        severity: 'high',
        title: `${label} Expired`,
        message: `Expired ${Math.abs(days!)} days ago. Immediate action needed.`,
      });
    } else if (level === 'expiring') {
      alerts.push({
        severity: 'medium',
        title: `${label} Expiring Soon`,
        message: `Expires in ${days} days — ${formatDate(date)}.`,
      });
    }
  });

  // Calculate compliance health score
  const complianceLevels = complianceChecks.map(c => getComplianceLevel(c.date).level);
  const complianceHealthCount = complianceLevels.filter(l => l === 'valid').length;
  const complianceHealthPct = Math.round((complianceHealthCount / complianceChecks.length) * 100);

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Gauge}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Odometer"
          value={`${truck.currentOdometer.toLocaleString()} km`}
          sub={`Updated ${new Date(truck.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
        />
        <KpiCard
          icon={Clock}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Engine Hours"
          value={`${truck.engineHours.toLocaleString()} hrs`}
          sub="Total run time"
        />
        <KpiCard
          icon={Route}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          label="Total Trips"
          value={String(truck._count.trips)}
          sub={`${truck._count.fuelLogs} fuel logs recorded`}
        />
        <KpiCard
          icon={Fuel}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Fuel Tank"
          value={truck.tankCapacityLiters ? `${truck.tankCapacityLiters} L` : '—'}
          sub={truck.fuelType}
        />
      </div>

      {/* ── Alerts Banner (if any) ────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                alert.severity === 'high'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                  alert.severity === 'high' ? 'text-red-500' : 'text-amber-500'
                }`}
              />
              <div>
                <p className={`text-sm font-semibold ${
                  alert.severity === 'high' ? 'text-red-800' : 'text-amber-800'
                }`}>
                  {alert.title}
                </p>
                <p className={`text-xs mt-0.5 ${
                  alert.severity === 'high' ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Main Grid: 2-column layout ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN (wider) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Details */}
          <Section title="Vehicle Details" icon={TruckIcon} iconColor="text-blue-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
              <DetailItem icon={Hash} label="Registration" value={truck.registrationNumber} />
              <DetailItem icon={Hash} label="Fleet Number" value={truck.fleetNumber} />
              <DetailItem icon={TruckIcon} label="Make & Model" value={`${truck.make} ${truck.model}`} />
              <DetailItem icon={Calendar} label="Year" value={truck.year} />
              <DetailItem icon={TruckIcon} label="Body Type" value={formatBodyType(truck.bodyType)} />
              <DetailItem icon={Palette} label="Color" value={truck.color} />
              <DetailItem icon={Hash} label="VIN" value={truck.vin} mono />
              <DetailItem icon={Cog} label="Engine Number" value={truck.engineNumber} mono />
            </div>
          </Section>

          {/* Technical Specifications */}
          <Section title="Technical Specifications" icon={Settings} iconColor="text-indigo-600">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-0">
              {/* Engine & Drivetrain */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Engine & Drivetrain</p>
                <DetailItem icon={Fuel} label="Fuel Type" value={truck.fuelType} />
                <DetailItem icon={Cog} label="Engine Capacity" value={truck.engineCapacityCc ? `${truck.engineCapacityCc.toLocaleString()} cc` : null} />
                <DetailItem icon={Gauge} label="Horsepower" value={truck.horsepower ? `${truck.horsepower} hp` : null} />
                <DetailItem icon={Settings} label="Transmission" value={truck.transmissionType} />
                <DetailItem icon={Cog} label="Gears" value={truck.numberOfGears} />
                <DetailItem icon={CircleDot} label="Drive Type" value={formatDriveType(truck.driveType)} />
              </div>

              {/* Capacity */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Capacity & Weight</p>
                <DetailItem icon={Droplet} label="Tank Capacity" value={truck.tankCapacityLiters ? `${truck.tankCapacityLiters} L` : null} />
                <DetailItem icon={Droplet} label="AdBlue Tank" value={truck.adBlueTankLiters ? `${truck.adBlueTankLiters} L` : null} />
                <DetailItem icon={Weight} label="GVM" value={truck.grossVehicleMass ? `${truck.grossVehicleMass.toLocaleString()} kg` : null} />
                <DetailItem icon={Weight} label="Tare Weight" value={truck.tareWeight ? `${truck.tareWeight.toLocaleString()} kg` : null} />
                <DetailItem icon={Weight} label="Payload" value={truck.payloadCapacity ? `${truck.payloadCapacity.toLocaleString()} kg` : null} />
              </div>

              {/* Dimensions */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Dimensions</p>
                <DetailItem icon={Ruler} label="Length" value={truck.lengthMm ? `${(truck.lengthMm / 1000).toFixed(1)} m` : null} />
                <DetailItem icon={Ruler} label="Width" value={truck.widthMm ? `${(truck.widthMm / 1000).toFixed(1)} m` : null} />
                <DetailItem icon={Ruler} label="Height" value={truck.heightMm ? `${(truck.heightMm / 1000).toFixed(1)} m` : null} />
                <DetailItem icon={Ruler} label="Wheelbase" value={truck.wheelbaseMm ? `${(truck.wheelbaseMm / 1000).toFixed(1)} m` : null} />
                {truck.fifthWheelHeight != null && (
                  <DetailItem icon={Ruler} label="5th Wheel" value={`${truck.fifthWheelHeight} mm`} />
                )}
              </div>
            </div>
          </Section>

          {/* Compliance & Licensing */}
          <Section
            title="Compliance & Licensing"
            icon={complianceHealthPct === 100 ? ShieldCheck : complianceHealthPct >= 50 ? Shield : ShieldAlert}
            iconColor={complianceHealthPct === 100 ? 'text-green-600' : complianceHealthPct >= 50 ? 'text-yellow-600' : 'text-red-600'}
          >
            {/* Health bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Compliance Health</span>
                <span className={`text-sm font-bold ${
                  complianceHealthPct === 100 ? 'text-green-600' : complianceHealthPct >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {complianceHealthPct}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    complianceHealthPct === 100 ? 'bg-green-500' : complianceHealthPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${complianceHealthPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ComplianceCard
                label="Vehicle Registration"
                expiryDate={truck.registrationExpiry}
                detail={truck.registrationNumber}
              />
              <ComplianceCard
                label="Insurance"
                expiryDate={truck.insuranceExpiry}
                detail={truck.insurancePolicyNumber ? `Policy: ${truck.insurancePolicyNumber}` : truck.insuranceProvider}
              />
              <ComplianceCard
                label="Inspection Certificate"
                expiryDate={truck.inspectionExpiry}
              />
              <ComplianceCard
                label="Operating License"
                expiryDate={truck.operatingLicenseExpiry}
                detail={truck.operatingLicenseNumber ? `License: ${truck.operatingLicenseNumber}` : null}
              />
            </div>
          </Section>

          {/* Axle Configuration (if present) */}
          {truck.truckAxles && truck.truckAxles.length > 0 && (
            <Section title="Axle Configuration" icon={CircleDot} iconColor="text-gray-600">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-2 font-medium">Axle</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Positions/Side</th>
                      <th className="pb-2 font-medium">Tyre Size</th>
                      <th className="pb-2 font-medium text-right">Max Load</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {truck.truckAxles
                      .sort((a, b) => a.axleIndex - b.axleIndex)
                      .map((axle) => (
                        <tr key={axle.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-medium text-gray-900">{axle.axleName}</td>
                          <td className="py-2.5">
                            <Badge variant="outline" className="text-xs">
                              {axle.axleType}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-gray-600">{axle.positionsPerSide}</td>
                          <td className="py-2.5 font-mono text-xs text-gray-600">{axle.tyreSize}</td>
                          <td className="py-2.5 text-right text-gray-600">
                            {axle.maxLoadKg ? `${axle.maxLoadKg.toLocaleString()} kg` : '—'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
        </div>

        {/* ── RIGHT COLUMN (sidebar) ── */}
        <div className="space-y-6">
          {/* Activity Summary */}
          <Section title="Activity Summary" icon={Activity} iconColor="text-violet-600">
            <div className="space-y-0.5">
              <ActivityMetric icon={Route} label="Trips" value={truck._count.trips} color="bg-blue-50 text-blue-600" />
              <ActivityMetric icon={Fuel} label="Fuel Logs" value={truck._count.fuelLogs} color="bg-amber-50 text-amber-600" />
              <ActivityMetric icon={Settings} label="Service Logs" value={truck._count.serviceLogs} color="bg-indigo-50 text-indigo-600" />
              <ActivityMetric icon={FileText} label="Documents" value={truck._count.documents} color="bg-gray-100 text-gray-600" />
              <ActivityMetric icon={CircleDot} label="Assets Installed" value={truck._count.assetInstallations} color="bg-emerald-50 text-emerald-600" />
              <ActivityMetric icon={Settings} label="Maintenance Plans" value={truck._count.maintenancePlans} color="bg-rose-50 text-rose-600" />
            </div>
          </Section>

          {/* Purchase & Ownership */}
          <Section title="Purchase & Ownership" icon={DollarSign} iconColor="text-emerald-600">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Ownership</span>
                <Badge variant="outline" className="text-xs">
                  {truck.ownershipType || 'Not specified'}
                </Badge>
              </div>
              {truck.purchaseDate && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Purchase Date</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(truck.purchaseDate)}</span>
                </div>
              )}
              {truck.purchasePrice != null && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Purchase Price</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(truck.purchasePrice)}</span>
                </div>
              )}
              {truck.purchasedFrom && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Purchased From</span>
                  <span className="text-sm font-medium text-gray-900">{truck.purchasedFrom}</span>
                </div>
              )}
              {truck.homeDepot && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Home Depot</span>
                  <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    {truck.homeDepot}
                  </span>
                </div>
              )}
            </div>
          </Section>

          {/* Notes */}
          {truck.notes && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <StickyNote className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-amber-800">Notes</h3>
              </div>
              <p className="text-sm text-amber-700 whitespace-pre-line leading-relaxed">
                {truck.notes}
              </p>
            </div>
          )}

          {/* Metadata footer */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <User className="h-3 w-3 flex-shrink-0" />
              <span>
                Created by <span className="text-gray-600 font-medium">{truck.creator.firstName} {truck.creator.lastName}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>{formatDate(truck.createdAt)}</span>
            </div>
            {truck.updater && truck.updater.id !== truck.creator.id && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <User className="h-3 w-3 flex-shrink-0" />
                <span>
                  Last updated by <span className="text-gray-600 font-medium">{truck.updater.firstName} {truck.updater.lastName}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
