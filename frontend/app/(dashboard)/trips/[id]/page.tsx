'use client';

import { use, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  TripHeader,
  LiveDashboardStrip,
  TripMap,
  TripOverview,
  TripStops,
  TripIncidents,
  TripDeviations,
  TripFuelLogs,
  TripGpsTrail,
} from './_components';
import { MOCK_DETAILED_TRIPS } from './_mock-data';
import type { TripPageProps } from '../_types';

export default function TripDetailsPage({ params }: TripPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const trip = MOCK_DETAILED_TRIPS[id];

  const [activeTab, setActiveTab] = useState('overview');
  const [highlightedPoint, setHighlightedPoint] = useState<{ lat: number; lng: number } | null>(null);

  if (!trip) {
    notFound();
  }

  const handleBack = useCallback(() => {
    router.push('/trips');
  }, [router]);

  const handleAction = useCallback((action: string) => {
    // Placeholder – these would call API endpoints
    switch (action) {
      case 'start':
        alert(`Starting trip ${trip.id}...`);
        break;
      case 'complete':
        alert(`Completing trip ${trip.id}...`);
        break;
      case 'cancel':
        if (confirm('Are you sure you want to cancel this trip?')) {
          alert(`Trip ${trip.id} cancelled`);
        }
        break;
      case 'delay':
        alert('Opening delay incident form...');
        break;
      case 'resume':
        alert('Resuming trip...');
        break;
      case 'report-incident':
        alert('Opening incident report form...');
        break;
      case 'edit':
        router.push(`/trips/${trip.id}/edit`);
        break;
      case 'export':
        alert('Exporting trip report...');
        break;
      case 'print':
        window.print();
        break;
      case 'view-reason':
        alert(trip.cancellationReason ?? 'No reason provided');
        break;
      default:
        console.log('Unhandled action:', action);
    }
  }, [trip, router]);

  const handleLocate = useCallback((lat: number, lng: number) => {
    setHighlightedPoint({ lat, lng });
    // On mobile, scroll to map
    document.getElementById('trip-map')?.scrollIntoView({ behavior: 'smooth' });
    // Clear highlight after a delay
    setTimeout(() => setHighlightedPoint(null), 3000);
  }, []);

  const handleResolveIncident = useCallback((incidentId: string) => {
    alert(`Resolving incident ${incidentId}...`);
  }, []);

  const handleAcknowledgeDeviation = useCallback((deviationId: string) => {
    alert(`Acknowledging deviation ${deviationId}...`);
  }, []);

  const handleReportIncident = useCallback(() => {
    alert('Opening incident report form...');
  }, []);

  return (
    <div className="flex flex-col lg:h-full -m-4 md:-mt-6 md:-mr-6 md:-mb-6 md:ml-0">
      {/* ── Header ───────────────────────────────────────────────── */}
      <TripHeader trip={trip} onBack={handleBack} onAction={handleAction} />

      {/* ── Main Content: Map + Data Panel ───────────────────────── */}
      {/*
        Mobile  → single column, scrollable. Map gets a fixed band, rest flows.
        Desktop → side-by-side 6+6 grid filling the remaining viewport height.
      */}
      <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 lg:overflow-hidden">

        {/* ── Left column: Map ───────────────────────────── */}
        <div id="trip-map" className="lg:col-span-6 h-[250px] sm:h-[300px] lg:h-full">
          <TripMap trip={trip} highlightedPoint={highlightedPoint} />
        </div>

        {/* ── Right column: Dashboard Strip + Tabs ────────────────── */}
        <div className="lg:col-span-6 flex flex-col min-h-0 lg:h-full lg:overflow-hidden bg-gray-50 lg:border-l border-gray-200">
          {/* Live Dashboard Strip */}
          <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
            <LiveDashboardStrip trip={trip} />
          </div>

          {/* Tabbed Data Panel */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
              <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
                <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 overflow-x-auto flex-nowrap">
                  <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2.5 text-xs md:text-sm whitespace-nowrap">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="fuel" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2.5 text-xs md:text-sm whitespace-nowrap">
                    Fuel
                  </TabsTrigger>
                  <TabsTrigger value="stops" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2.5 text-xs md:text-sm whitespace-nowrap">
                    Stops
                    {trip.stops.length > 0 && (
                      <span className="ml-1.5 bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                        {trip.stops.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="incidents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2.5 text-xs md:text-sm whitespace-nowrap">
                    Incidents
                    {trip.incidents.length > 0 && (
                      <span className="ml-1.5 bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                        {trip.incidents.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="deviations" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2.5 text-xs md:text-sm whitespace-nowrap">
                    Deviations
                    {trip.deviations.length > 0 && (
                      <span className="ml-1.5 bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                        {trip.deviations.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="gps" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2.5 text-xs md:text-sm whitespace-nowrap">
                    GPS Trail
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 py-3 md:p-4">
                <TabsContent value="overview" className="m-0 mt-0">
                  <TripOverview trip={trip} />
                </TabsContent>
                <TabsContent value="fuel" className="m-0 mt-0">
                  <TripFuelLogs
                    fuelLogs={trip.fuelLogs}
                    trip={trip}
                    onLocate={handleLocate}
                  />
                </TabsContent>
                <TabsContent value="stops" className="m-0 mt-0">
                  <TripStops stops={trip.stops} onLocate={handleLocate} />
                </TabsContent>
                <TabsContent value="incidents" className="m-0 mt-0">
                  <TripIncidents
                    tripId={trip.id}
                    incidents={trip.incidents}
                    onReport={handleReportIncident}
                    onResolve={handleResolveIncident}
                  />
                </TabsContent>
                <TabsContent value="deviations" className="m-0 mt-0">
                  <TripDeviations
                    deviations={trip.deviations}
                    onAcknowledge={handleAcknowledgeDeviation}
                    onLocate={handleLocate}
                  />
                </TabsContent>
                <TabsContent value="gps" className="m-0 mt-0">
                  <TripGpsTrail
                    gpsPoints={trip.trail ?? []}
                    speedLimit={trip.route.speedLimitKmh}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
