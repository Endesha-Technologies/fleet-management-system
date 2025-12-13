import React from 'react';
import { 
  Fuel, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Download,
  Plus,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function FuelPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Fuel Management</h2>
          <p className="text-sm text-gray-500">Track fuel consumption, costs, and efficiency across your fleet.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            This Month
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Log Fuel
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Fuel Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-[#020887]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-red-600 flex items-center mr-1">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +4.5%
              </span>
              vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Consumption</CardTitle>
            <Fuel className="h-4 w-4 text-[#020887]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,240 L</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 flex items-center mr-1">
                <TrendingDown className="h-3 w-3 mr-0.5" /> -1.2%
              </span>
              vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#020887]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4 km/L</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 flex items-center mr-1">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +2.1%
              </span>
              improvement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cost per km</CardTitle>
            <DollarSign className="h-4 w-4 text-[#020887]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.51</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 flex items-center mr-1">
                <TrendingDown className="h-3 w-3 mr-0.5" /> -0.5%
              </span>
              vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Recent Fuel Logs */}
        <Card className="col-span-7 lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Fuel Logs</CardTitle>
              <CardDescription>Latest refueling transactions across the fleet.</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { vehicle: "Truck #104", driver: "John Doe", amount: "150 L", cost: "$225.00", location: "Shell Station 4", time: "2 hours ago", efficiency: "8.2 km/L" },
                { vehicle: "Van #023", driver: "Sarah Smith", amount: "45 L", cost: "$67.50", location: "BP Central", time: "5 hours ago", efficiency: "12.5 km/L" },
                { vehicle: "Truck #089", driver: "Mike Johnson", amount: "200 L", cost: "$300.00", location: "Caltex North", time: "Yesterday", efficiency: "7.8 km/L" },
                { vehicle: "Truck #112", driver: "Steve Wilson", amount: "180 L", cost: "$270.00", location: "Shell Station 4", time: "Yesterday", efficiency: "8.0 km/L" },
                { vehicle: "Van #045", driver: "Jane Davis", amount: "50 L", cost: "$75.00", location: "BP Central", time: "2 days ago", efficiency: "11.9 km/L" },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#020887]/10 text-[#020887]">
                      <Fuel className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{log.vehicle}</p>
                      <p className="text-sm text-gray-500">{log.driver} • {log.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-medium text-gray-900">{log.amount}</p>
                      <p className="text-xs text-gray-500">{log.efficiency}</p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="font-bold text-gray-900">{log.cost}</p>
                      <p className="text-xs text-gray-500">{log.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fuel Alerts & Insights */}
        <div className="col-span-7 lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Alerts</CardTitle>
              <CardDescription>Anomalies and potential theft.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Sudden Drop", vehicle: "Truck #055", desc: "Fuel level dropped 20% while idle", severity: "high" },
                  { title: "High Consumption", vehicle: "Van #012", desc: "25% above average consumption", severity: "medium" },
                  { title: "Missed Log", vehicle: "Truck #099", desc: "Refueling detected but not logged", severity: "low" },
                ].map((alert, i) => (
                  <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900">{alert.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                        alert.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-700 mb-0.5">{alert.vehicle}</p>
                    <p className="text-xs text-gray-500">{alert.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#020887] text-white">
            <CardHeader>
              <CardTitle className="text-white">Fuel Saving Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-100 mb-4">
                Reducing idle time by just 10% across your fleet could save approximately $1,200 per month in fuel costs.
              </p>
              <Button variant="secondary" className="w-full text-[#020887] bg-white hover:bg-gray-100">
                View Idle Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
