'use client';

import { notFound, useParams } from 'next/navigation';
import { mockWorkOrders } from '@/constants/maintenance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Edit, Printer, CheckCircle, Clock, 
  User, Wrench, Package, DollarSign, FileText, 
  MapPin, Calendar, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function WorkOrderDetailsPage() {
  const params = useParams();
  const workOrder = mockWorkOrders.find(wo => wo.id === params.id);

  if (!workOrder) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'awaiting-parts': return 'warning';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/maintenance/work-orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{workOrder.id}</h1>
            <p className="text-muted-foreground mt-1">
              {workOrder.vehiclePlate} - {workOrder.vehicleModel}
            </p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
            <Link href={`/maintenance/work-orders/${workOrder.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
            <Link href={`/maintenance/work-orders/${workOrder.id}/print`}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild className="flex-1 sm:flex-none">
            <Link href={`/maintenance/work-orders/${workOrder.id}/update-status`}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Update Status
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge variant={getStatusColor(workOrder.status)}>
                {workOrder.status.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Priority</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(workOrder.priority)}`}>
                {workOrder.priority === 'critical' && <AlertCircle className="mr-1 h-3 w-3" />}
                {workOrder.priority.toUpperCase()}
              </span>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Type</p>
              <p className="font-medium capitalize">{workOrder.type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-base">{workOrder.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                  <p className="text-base capitalize">{workOrder.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Service Location</p>
                  <p className="text-base flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Workshop
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Plate Number</p>
                  <p className="text-base font-semibold">{workOrder.vehiclePlate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Model</p>
                  <p className="text-base">{workOrder.vehicleModel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Current Status</p>
                  <Badge variant="outline">In Workshop</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Odometer</p>
                  <p className="text-base">125,430 km</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parts Used */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Parts Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">Engine Oil Filter</p>
                    <p className="text-sm text-muted-foreground">Qty: 2</p>
                  </div>
                  <p className="font-semibold">UGX 25,000</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">Brake Pads (Front)</p>
                    <p className="text-sm text-muted-foreground">Qty: 1 set</p>
                  </div>
                  <p className="font-semibold">UGX 85,000</p>
                </div>
                <div className="pt-3 border-t flex justify-between items-center">
                  <p className="font-medium">Total Parts Cost</p>
                  <p className="text-lg font-bold">UGX 110,000</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Labor Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Labor Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{workOrder.assignedTo || 'Unassigned'}</p>
                    <p className="text-sm text-muted-foreground">4 hours @ UGX 500/hr</p>
                  </div>
                  <p className="font-semibold">UGX 2,000</p>
                </div>
                <div className="pt-3 border-t flex justify-between items-center">
                  <p className="font-medium">Total Labor Cost</p>
                  <p className="text-lg font-bold">UGX 2,000</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Parts Cost</p>
                  <p className="font-medium">UGX 110,000</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Labor Cost</p>
                  <p className="font-medium">UGX 2,000</p>
                </div>
                <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
                  <p className="text-lg font-semibold">Total Cost</p>
                  <p className="text-2xl font-bold text-blue-600">UGX 112,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Created</p>
                <p className="font-medium">{formatDate(workOrder.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Due Date</p>
                <p className="font-medium">{formatDate(workOrder.dueDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Estimated Duration</p>
                <p className="font-medium">4 hours</p>
              </div>
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Technician</p>
                <p className="font-medium">{workOrder.assignedTo || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Workshop/Bay</p>
                <p className="font-medium">Bay 3</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Supervisor</p>
                <p className="font-medium">James Supervisor</p>
              </div>
            </CardContent>
          </Card>

          {/* Progress Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progress Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs mb-1">2 hours ago</p>
                  <p>Started brake pad replacement</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs mb-1">4 hours ago</p>
                  <p>Completed oil change</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link href={`/maintenance/work-orders/${workOrder.id}/update-status`}>
                    Add Note
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
