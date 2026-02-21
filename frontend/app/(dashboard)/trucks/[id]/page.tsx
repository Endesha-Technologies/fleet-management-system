'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Map, 
  Wrench, 
  Edit2, 
  RefreshCw,
  Gauge,
  Clock,
  Droplet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOCK_TRUCKS } from '@/constants/trucks';
import { TruckOverview } from '../_components/details/TruckOverview';
import { TruckTrips } from '../_components/details/TruckTrips';
import { TruckFuel } from '../_components/details/TruckFuel';
import { TruckTyres } from '../_components/details/TruckTyres';
import { AddTruckDrawer } from '../_components/AddTruckDrawer';
import { RotateTyresDrawer } from '../_components/details/RotateTyresDrawer';
import { StatsCard } from '../_components/StatsCard';

export default function TruckDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const truck = MOCK_TRUCKS.find(t => t.id === id) || MOCK_TRUCKS[0]; // Fallback for dev
  
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showRotateDrawer, setShowRotateDrawer] = useState(false);

  if (!truck) {
    return <div>Truck not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <button 
            onClick={() => router.back()} 
            className="hover:text-gray-900 flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Trucks
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{truck.plateNumber}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{truck.plateNumber}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {truck.make} {truck.model} • {truck.year} • {truck.status}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              <Map className="h-4 w-4 mr-2" />
              Start Trip
            </Button>
            <Button variant="outline" onClick={() => setShowEditDrawer(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Truck
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowRotateDrawer(true)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Rotate Tyres
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          icon={Gauge} 
          label="Odometer" 
          value={`${truck.currentOdometer.toLocaleString()} km`} 
          subtext="Last updated: Just now"
          color="blue"
        />
        <StatsCard 
          icon={Clock} 
          label="Engine Hours" 
          value={`${truck.engineHours.toLocaleString()} hrs`} 
          subtext="Total run time"
          color="green"
        />
        <StatsCard 
          icon={Map} 
          label="Total Trips" 
          value="142" 
          subtext="Run this year"
          color="purple"
        />
        <StatsCard 
          icon={Droplet} 
          label="Avg Consumption" 
          value="32.5 L/100km" 
          subtext="-2.1% vs fleet avg"
          color="orange"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="trips" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Trips</TabsTrigger>
          <TabsTrigger value="fuel" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Fuel</TabsTrigger>
          <TabsTrigger value="tyres" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Tyres</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview">
            <TruckOverview truck={truck} />
          </TabsContent>
          <TabsContent value="trips">
            <TruckTrips truckId={truck.id} />
          </TabsContent>
          <TabsContent value="fuel">
            <TruckFuel truckId={truck.id} />
          </TabsContent>
          <TabsContent value="tyres">
            <TruckTyres truck={truck} />
          </TabsContent>
        </div>
      </Tabs>

      <AddTruckDrawer
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
        initialTruck={truck}
        onAddComplete={() => setShowEditDrawer(false)}
      />

      <RotateTyresDrawer
        open={showRotateDrawer}
        onOpenChange={setShowRotateDrawer}
        truck={truck}
      />
    </div>
  );
}
