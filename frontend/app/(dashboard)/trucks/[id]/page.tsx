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
import { MOCK_TRUCKS } from '@/constants/trucks';
import { TruckOverview } from '@/components/features/trucks/details/TruckOverview';
import { TruckTrips } from '@/components/features/trucks/details/TruckTrips';
import { TruckFuel } from '@/components/features/trucks/details/TruckFuel';
import { TruckTyres } from '@/components/features/trucks/details/TruckTyres';
import { AddTruckDrawer } from '@/components/features/trucks/AddTruckDrawer';
import { RotateTyresDrawer } from '@/components/features/trucks/details/RotateTyresDrawer';

// We need to implement Tabs properly or import from shadcn
// Assuming standard shadcn tabs structure here, but need to check if it's available.
// If not, I'll use a simple state-based tab system for now.

interface SimpleTabsProps {
  children: React.ReactNode;
  defaultValue: string;
  className?: string;
}

function SimpleTabs({ children, defaultValue, className }: SimpleTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.cloneElement(child, { activeTab, setActiveTab } as any);
        }
        return child;
      })}
    </div>
  );
}

interface SimpleTabsListProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
  className?: string;
}

function SimpleTabsList({ children, activeTab, setActiveTab, className }: SimpleTabsListProps) {
  return (
    <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.cloneElement(child, { activeTab, setActiveTab } as any);
        }
        return child;
      })}
    </div>
  );
}

interface SimpleTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

function SimpleTabsTrigger({ value, children, activeTab, setActiveTab }: SimpleTabsTriggerProps) {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab && setActiveTab(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${isActive ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-900'}
      `}
    >
      {children}
    </button>
  );
}

interface SimpleTabsContentProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
}

function SimpleTabsContent({ value, children, activeTab }: SimpleTabsContentProps) {
  if (value !== activeTab) return null;
  return <div className="mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2">{children}</div>;
}

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
      <SimpleTabs defaultValue="overview" className="">
        <SimpleTabsList className="mb-6 w-full sm:w-auto overflow-x-auto">
          <SimpleTabsTrigger value="overview">Overview</SimpleTabsTrigger>
            <SimpleTabsTrigger value="trips">Trips</SimpleTabsTrigger>
            <SimpleTabsTrigger value="fuel">Fuel</SimpleTabsTrigger>
            <SimpleTabsTrigger value="tyres">Tyres</SimpleTabsTrigger>
          </SimpleTabsList>

          <SimpleTabsContent value="overview">
            <TruckOverview truck={truck} />
          </SimpleTabsContent>
          <SimpleTabsContent value="trips">
            <TruckTrips truckId={truck.id} />
          </SimpleTabsContent>
          <SimpleTabsContent value="fuel">
            <TruckFuel truckId={truck.id} />
          </SimpleTabsContent>
          <SimpleTabsContent value="tyres">
            <TruckTyres truck={truck} />
          </SimpleTabsContent>
        </SimpleTabs>

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatsCard({ icon: Icon, label, value, subtext, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
    indigo: "text-indigo-600 bg-indigo-50",
    cyan: "text-cyan-600 bg-cyan-50",
    red: "text-red-600 bg-red-50",
    gray: "text-gray-600 bg-gray-50",
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.gray}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{subtext}</p>
    </div>
  );
}
