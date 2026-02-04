'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Calendar,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockMaintenanceDashboard } from '@/constants/maintenance';

export default function MaintenancePage() {
  const { stats, alerts, vehicleStatus, workOrderStatus, recentActivity } = mockMaintenanceDashboard;

  const criticalAlerts = alerts.filter(a => a.severity === 'critical').slice(0, 3);
  const recentActivities = recentActivity.slice(0, 5);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor fleet maintenance operations</p>
        </div>
        {/* <Button asChild>
          <Link href="/maintenance/work-orders/create">
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Link>
        </Button> */}
      </div>

      {/* Quick Actions - Mobile First Priority */}
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
           <Button variant="outline" className="min-w-fit whitespace-nowrap snap-start" asChild>
            <Link href="/maintenance/schedule">
              Schedule Maintenance
            </Link>
          </Button>
          <Button variant="outline" className="min-w-fit whitespace-nowrap snap-start" asChild>
            <Link href="/maintenance/work-orders">
              Work Orders
            </Link>
          </Button>
         
          {/* <Button variant="outline" className="min-w-fit whitespace-nowrap snap-start" asChild>
            <Link href="/maintenance/breakdown">
              Report Breakdown
            </Link>
          </Button> */}
          <Button variant="outline" className="min-w-fit whitespace-nowrap snap-start" asChild>
            <Link href="/maintenance/parts">
              Parts Inventory
            </Link>
          </Button>
          <Button variant="outline" className="min-w-fit whitespace-nowrap snap-start" asChild>
            <Link href="/maintenance/service-history">
              Service History
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Active Work Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.totalActiveWorkOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">In progress</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-3xl font-bold mt-2 text-red-600">{stats.vehiclesOverdue}</p>
                <p className="text-xs text-muted-foreground mt-1">Need attention</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-3xl font-bold mt-2">{stats.scheduledThisWeek}</p>
                <p className="text-xs text-muted-foreground mt-1">This week</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Operational</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{vehicleStatus.operational}</p>
                <p className="text-xs text-muted-foreground mt-1">Of {vehicleStatus.operational + vehicleStatus.dueForService + vehicleStatus.inWorkshop + vehicleStatus.outOfService} vehicles</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Alerts & Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold">Critical Alerts</CardTitle>
              <Link href="/maintenance/alerts" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {criticalAlerts.length > 0 ? (
                criticalAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-900">{alert.message}</p>
                      <p className="text-xs text-red-600 mt-1" suppressHydrationWarning>
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No critical alerts</p>
              )}
            </CardContent>
          </Card>

          {/* Fleet Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Fleet Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Operational</span>
                    <span className="text-sm font-bold text-green-600">{vehicleStatus.operational}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${(vehicleStatus.operational / 105) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Due for Service</span>
                    <span className="text-sm font-bold text-amber-600">{vehicleStatus.dueForService}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${(vehicleStatus.dueForService / 105) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">In Workshop</span>
                    <span className="text-sm font-bold text-blue-600">{vehicleStatus.inWorkshop}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(vehicleStatus.inWorkshop / 105) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Out of Service</span>
                    <span className="text-sm font-bold text-red-600">{vehicleStatus.outOfService}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${(vehicleStatus.outOfService / 105) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Activity (Desktop Only) */}
        <div className="hidden lg:block space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/maintenance/schedule">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Maintenance
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/maintenance/work-orders">
                  <FileText className="mr-2 h-4 w-4" />
                  View Work Orders
                </Link>
              </Button>
             
              {/* <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/maintenance/breakdown">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report Breakdown
                </Link>
              </Button> */}
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/maintenance/service-history">
                  <FileText className="mr-2 h-4 w-4" />
                  Service History
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="shrink-0 mt-1">
                      <div className={`h-2 w-2 rounded-full ${
                        activity.type === 'work-order-completed' ? 'bg-green-500' :
                        activity.type === 'breakdown-reported' ? 'bg-red-500' :
                        activity.type === 'service-started' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
                        {activity.vehiclePlate} • {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
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
