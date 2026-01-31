'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  Wrench,
  DollarSign,
  Bell,
  Settings,
  Edit,
  Trash2,
  Play,
  Pause,
  FileText,
  AlertCircle,
  Check,
} from 'lucide-react';
import { mockMaintenanceSchedules } from '@/constants/schedules';
import type { MaintenanceSchedule } from '@/types/maintenance';

export default function ScheduleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [schedule, setSchedule] = useState<MaintenanceSchedule | undefined>(undefined);

  useEffect(() => {
    const scheduleId = params.id as string;
    const foundSchedule = mockMaintenanceSchedules.find(s => s.id === scheduleId);
    setSchedule(foundSchedule);
  }, [params.id]);

  if (!schedule) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Schedule Not Found</h2>
          <p className="text-sm text-gray-600 mb-4">
            The maintenance schedule you're looking for doesn't exist.
          </p>
          <Link href="/maintenance/schedule">
            <Button>Back to Schedules</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[priority as keyof typeof styles]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const calculateProgress = () => {
    if (schedule.triggerType === 'mileage' && schedule.currentOdometer && schedule.nextDueMileage) {
      const lastMileage = schedule.lastServiceOdometer || schedule.startingOdometer || 0;
      const totalInterval = schedule.nextDueMileage - lastMileage;
      const currentProgress = schedule.currentOdometer - lastMileage;
      return Math.min(Math.round((currentProgress / totalInterval) * 100), 100);
    }
    
    if (schedule.triggerType === 'time' && schedule.nextDueDate && schedule.lastServiceDate) {
      const lastDate = new Date(schedule.lastServiceDate).getTime();
      const nextDate = new Date(schedule.nextDueDate).getTime();
      const now = Date.now();
      const totalInterval = nextDate - lastDate;
      const currentProgress = now - lastDate;
      return Math.min(Math.round((currentProgress / totalInterval) * 100), 100);
    }
    
    return 0;
  };

  const handleCreateWorkOrder = () => {
    console.log('Creating work order from schedule:', schedule.id);
    // In real implementation, navigate to work order creation with pre-filled data
    router.push(`/maintenance/work-orders/create?scheduleId=${schedule.id}`);
  };

  const handleToggleActive = () => {
    setSchedule({ ...schedule, isActive: !schedule.isActive });
    console.log('Toggling schedule active status');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      console.log('Deleting schedule:', schedule.id);
      router.push('/maintenance/schedule');
    }
  };

  const progress = calculateProgress();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/maintenance/schedule">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{schedule.serviceName}</h1>
            <p className="text-sm text-gray-600 mt-1">Schedule ID: {schedule.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/maintenance/schedule/${schedule.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleToggleActive}>
            {schedule.isActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="flex flex-wrap gap-3">
        {getStatusBadge(schedule.status)}
        {getPriorityBadge(schedule.priority)}
        {!schedule.isActive && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
            Inactive
          </span>
        )}
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 capitalize">
          {schedule.triggerType.replace('-', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Information */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">Vehicle Information</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Vehicle Plate</p>
                <p className="text-base font-medium text-gray-900">{schedule.vehiclePlate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Model</p>
                <p className="text-base font-medium text-gray-900">{schedule.vehicleModel}</p>
              </div>
              {schedule.currentOdometer && (
                <div>
                  <p className="text-sm text-gray-600">Current Odometer</p>
                  <p className="text-base font-medium text-gray-900">{schedule.currentOdometer.toLocaleString()} km</p>
                </div>
              )}
            </div>
          </Card>

          {/* Service Details */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">Service Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Service Category</p>
                <p className="text-base font-medium text-gray-900 capitalize">
                  {schedule.serviceCategory.replace('-', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-base text-gray-900">{schedule.description}</p>
              </div>
            </div>
          </Card>

          {/* Schedule Details */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">Schedule Details</h2>
            </div>
            <div className="space-y-4">
              {/* Time-based */}
              {(schedule.triggerType === 'time' || schedule.triggerType === 'combined') && (
                <Card className="p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Time-based Schedule</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Frequency</p>
                      <p className="text-base font-medium text-gray-900">
                        Every {schedule.frequencyValue} {schedule.frequencyUnit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="text-base font-medium text-gray-900">{formatDate(schedule.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Due Date</p>
                      <p className="text-base font-medium text-gray-900">{formatDate(schedule.nextDueDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Service</p>
                      <p className="text-base font-medium text-gray-900">{formatDate(schedule.lastServiceDate)}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Mileage-based */}
              {(schedule.triggerType === 'mileage' || schedule.triggerType === 'combined') && (
                <Card className="p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Mileage-based Schedule</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Mileage Interval</p>
                      <p className="text-base font-medium text-gray-900">
                        {schedule.mileageInterval?.toLocaleString()} km
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Starting Odometer</p>
                      <p className="text-base font-medium text-gray-900">
                        {schedule.startingOdometer?.toLocaleString()} km
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Due Mileage</p>
                      <p className="text-base font-medium text-gray-900">
                        {schedule.nextDueMileage?.toLocaleString()} km
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Service Odometer</p>
                      <p className="text-base font-medium text-gray-900">
                        {schedule.lastServiceOdometer?.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Progress to Next Service</p>
                  <p className="text-sm font-medium text-gray-900">{progress}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      progress >= 90 ? 'bg-red-600' :
                      progress >= 70 ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Assignment Details */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">Assignment</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {schedule.defaultTechnicianName && (
                <div>
                  <p className="text-sm text-gray-600">Default Technician</p>
                  <p className="text-base font-medium text-gray-900">{schedule.defaultTechnicianName}</p>
                </div>
              )}
              {schedule.workshopLocation && (
                <div>
                  <p className="text-sm text-gray-600">Workshop Location</p>
                  <p className="text-base font-medium text-gray-900">{schedule.workshopLocation}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Estimated Duration</p>
                <p className="text-base font-medium text-gray-900">{schedule.estimatedDuration} hours</p>
              </div>
              {schedule.preferredTimeSlot && (
                <div>
                  <p className="text-sm text-gray-600">Preferred Time</p>
                  <p className="text-base font-medium text-gray-900 capitalize">
                    {schedule.preferredTimeSlot}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Cost Estimates */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">Cost Estimates</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Parts Cost</span>
                <span className="font-medium text-gray-900">
                  UGX {schedule.estimatedPartsCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Labor ({schedule.estimatedLaborHours} hrs)</span>
                <span className="font-medium text-gray-900">
                  UGX {(schedule.estimatedLaborHours * 35000).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total Estimated Cost</span>
                <span className="font-semibold text-gray-900">
                  UGX {schedule.estimatedTotalCost.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full" onClick={handleCreateWorkOrder}>
                <Play className="w-4 h-4 mr-2" />
                Create Work Order
              </Button>
              <Link href={`/maintenance/schedule/${schedule.id}/edit`}>
                <Button variant="outline" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Schedule
                </Button>
              </Link>
            </div>
          </Card>

          {/* Alerts & Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Notifications</h3>
            </div>
            <div className="space-y-3 text-sm">
              {schedule.advanceNotificationDays && (
                <div>
                  <p className="text-gray-600">Advance Notice (Days)</p>
                  <p className="font-medium text-gray-900">{schedule.advanceNotificationDays} days before</p>
                </div>
              )}
              {schedule.advanceNotificationKm && (
                <div>
                  <p className="text-gray-600">Advance Notice (km)</p>
                  <p className="font-medium text-gray-900">{schedule.advanceNotificationKm} km before</p>
                </div>
              )}
              <div>
                <p className="text-gray-600 mb-2">Recipients:</p>
                <div className="space-y-1">
                  {schedule.notifyFleetManager && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900">Fleet Manager</span>
                    </div>
                  )}
                  {schedule.notifyDriver && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900">Driver</span>
                    </div>
                  )}
                  {schedule.notifySupervisor && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900">Supervisor</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Settings</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Allow Deferment</span>
                <span className="font-medium text-gray-900">
                  {schedule.allowDeferment ? 'Yes' : 'No'}
                </span>
              </div>
              {schedule.allowDeferment && schedule.maxDeferrals && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Deferrals</span>
                  <span className="font-medium text-gray-900">{schedule.maxDeferrals}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Auto-create WO</span>
                <span className="font-medium text-gray-900">
                  {schedule.autoCreateWorkOrder ? 'Yes' : 'No'}
                </span>
              </div>
              {schedule.gracePeriodDays && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Grace Period</span>
                  <span className="font-medium text-gray-900">{schedule.gracePeriodDays} days</span>
                </div>
              )}
            </div>
          </Card>

          {/* Service History */}
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Service History</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Count</span>
                <span className="font-medium text-gray-900">{schedule.completedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deferred Count</span>
                <span className="font-medium text-gray-900">{schedule.deferredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium text-gray-900">{formatDate(schedule.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium text-gray-900">{formatDate(schedule.updatedAt)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
