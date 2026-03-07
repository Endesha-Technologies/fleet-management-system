'use client';

import { AlertTriangle, CheckCircle, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TripIncidentsProps, TripIncident } from '../_types';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-UG', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const SEVERITY_STYLES: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const TYPE_ICONS: Record<string, string> = {
  accident: '🚗',
  breakdown: '🔧',
  weather: '🌧️',
  road_closure: '🚧',
  theft: '🚨',
  delay: '⏱️',
  resume: '▶️',
  other: '📋',
};

function IncidentCard({ incident, onResolve }: { incident: TripIncident; onResolve: (id: string) => void }) {
  const isOpen = !incident.resolvedAt;

  return (
    <div className={`rounded-lg border p-3 ${isOpen ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-lg mt-0.5">{TYPE_ICONS[incident.type] ?? '📋'}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 capitalize">
              {incident.type.replace('_', ' ')} — {incident.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <Badge className={`text-[10px] ${SEVERITY_STYLES[incident.severity]}`}>
                {incident.severity}
              </Badge>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(incident.reportedAt)}
              </span>
              {incident.locationName && (
                <span className="text-xs text-gray-500">📍 {incident.locationName}</span>
              )}
              <span className="text-xs text-gray-400">Source: {incident.source}</span>
            </div>
          </div>
        </div>
        {isOpen && (
          <Button size="sm" variant="outline" className="shrink-0 text-xs" onClick={() => onResolve(incident.id)}>
            Resolve
          </Button>
        )}
        {incident.resolvedAt && (
          <span className="flex items-center gap-1 text-xs text-green-600 shrink-0">
            <CheckCircle className="h-3.5 w-3.5" />
            Resolved
          </span>
        )}
      </div>
    </div>
  );
}

export function TripIncidents({ incidents, onReport, onResolve }: TripIncidentsProps) {
  const active = incidents.filter(i => !i.resolvedAt);
  const resolved = incidents.filter(i => i.resolvedAt);

  return (
    <div className="space-y-4 p-4 md:p-0">
      {/* Header with report button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg border border-gray-100 px-3 py-1.5 text-center">
            <span className="text-xs text-gray-500">Total</span>
            <p className="text-sm font-bold">{incidents.length}</p>
          </div>
          {active.length > 0 && (
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 px-3 py-1.5 text-center">
              <span className="text-xs text-yellow-600">Active</span>
              <p className="text-sm font-bold text-yellow-700">{active.length}</p>
            </div>
          )}
        </div>
        <Button size="sm" onClick={onReport} className="bg-yellow-600 hover:bg-yellow-700 text-white">
          <Plus className="h-3.5 w-3.5 mr-1" /> Report Incident
        </Button>
      </div>

      {/* Active incidents */}
      {active.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Incidents</h4>
          {active.map(inc => (
            <IncidentCard key={inc.id} incident={inc} onResolve={onResolve} />
          ))}
        </div>
      )}

      {/* Resolved incidents */}
      {resolved.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Incident History</h4>
          {resolved.map(inc => (
            <IncidentCard key={inc.id} incident={inc} onResolve={onResolve} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {incidents.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No incidents reported</p>
        </div>
      )}
    </div>
  );
}
