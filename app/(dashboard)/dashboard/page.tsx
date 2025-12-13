import React from 'react';
import { 
  Truck, 
  MapPin, 
  AlertTriangle, 
  Fuel, 
  TrendingUp, 
  Calendar,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500">Overview of your fleet's performance and status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button>
            Download Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Fleet</CardTitle>
            <Truck className="h-4 w-4 text-[#020887]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +4
              </span>
              new vehicles this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Trips</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +12%
              </span>
              vs last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Maintenance Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">7</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-red-600 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +2
              </span>
              critical issues
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Fuel Efficiency</CardTitle>
            <Fuel className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4 <span className="text-sm font-normal text-gray-500">km/L</span></div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +2.1%
              </span>
              improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Left Column: Live Status & Recent Activity */}
        <div className="col-span-4 space-y-4">
          {/* Live Fleet Status */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Live Fleet Status</CardTitle>
              <CardDescription>Real-time vehicle status distribution.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                <p className="text-gray-500 flex items-center">
                  <MapPin className="mr-2 h-5 w-5" /> Map Visualization Placeholder
                </p>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">85</div>
                  <div className="text-xs text-gray-500">On Route</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#020887]">24</div>
                  <div className="text-xs text-gray-500">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">12</div>
                  <div className="text-xs text-gray-500">Idle</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <div className="text-xs text-gray-500">Maintenance</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest trips and alerts from your fleet.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  {
                    vehicle: "Truck #104",
                    action: "Completed delivery to Warehouse A",
                    time: "10 mins ago",
                    status: "success",
                    initials: "T1"
                  },
                  {
                    vehicle: "Van #023",
                    action: "Started route: City Distribution",
                    time: "25 mins ago",
                    status: "info",
                    initials: "V2"
                  },
                  {
                    vehicle: "Truck #089",
                    action: "Maintenance alert: Oil pressure low",
                    time: "1 hour ago",
                    status: "warning",
                    initials: "T8"
                  },
                  {
                    vehicle: "Truck #112",
                    action: "Refueled at Station 4 (150L)",
                    time: "2 hours ago",
                    status: "default",
                    initials: "T1"
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className={
                        item.status === 'warning' ? 'bg-red-100 text-red-600' :
                        item.status === 'success' ? 'bg-green-100 text-green-600' :
                        item.status === 'info' ? 'bg-[#020887]/10 text-[#020887]' :
                        'bg-gray-100 text-gray-600'
                      }>
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.vehicle}</p>
                      <p className="text-sm text-gray-500">{item.action}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-gray-400">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Maintenance & Drivers */}
        <div className="col-span-3 space-y-4">
          {/* Upcoming Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Maintenance</CardTitle>
              <CardDescription>Vehicles due for service this week.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "V-001", type: "Oil Change", due: "Today", priority: "High" },
                  { id: "T-105", type: "Brake Inspection", due: "Tomorrow", priority: "Medium" },
                  { id: "V-042", type: "Tire Rotation", due: "Dec 15", priority: "Low" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-gray-900">{item.id}</span>
                      <span className="text-xs text-gray-500">{item.type}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        item.priority === 'High' ? 'bg-red-100 text-red-700' :
                        item.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-[#020887]/10 text-[#020887]'
                      }`}>
                        {item.due}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 text-xs">View Schedule</Button>
            </CardContent>
          </Card>

          {/* Top Drivers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Drivers</CardTitle>
              <CardDescription>Based on safety and efficiency scores.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "John Doe", score: 98, trips: 142 },
                  { name: "Sarah Smith", score: 96, trips: 115 },
                  { name: "Mike Johnson", score: 94, trips: 98 },
                ].map((driver, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#020887]/10 text-[#020887] font-bold text-xs">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{driver.name}</p>
                        <p className="text-xs text-gray-500">{driver.trips} trips</p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      {driver.score}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
