'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  List, 
  Plus, 
  Search, 
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  Wrench,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { mockMaintenanceSchedules } from '@/constants/schedules';
import type { MaintenanceSchedule, MaintenanceScheduleStatus } from '@/types/maintenance';
import type { ViewMode, CalendarView } from '../_types';

export default function MaintenanceSchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaintenanceScheduleStatus | 'all'>('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter schedules based on search and status
  const filteredSchedules = mockMaintenanceSchedules.filter((schedule) => {
    const matchesSearch = 
      schedule.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.vehiclePlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.vehicleModel?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    
    return matchesSearch && matchesStatus && schedule.isActive;
  });

  // Group schedules by status
  const scheduledCount = filteredSchedules.filter(s => s.status === 'scheduled').length;
  const overdueCount = filteredSchedules.filter(s => s.status === 'overdue').length;
  const inProgressCount = filteredSchedules.filter(s => s.status === 'in-progress').length;
  const completedCount = filteredSchedules.filter(s => s.status === 'completed').length;

  const getStatusBadge = (status: MaintenanceScheduleStatus) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
    };
    
    const labels = {
      scheduled: 'Scheduled',
      overdue: 'Overdue',
      'in-progress': 'In Progress',
      completed: 'Completed',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateProgress = (schedule: MaintenanceSchedule) => {
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

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Maintenance Schedule</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage preventive maintenance schedules</p>
        </div>
        <Link href="/maintenance/schedule/create">
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Schedule
          </Button>
        </Link>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{scheduledCount}</p>
              <p className="text-xs text-gray-600">Scheduled</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
              <p className="text-xs text-gray-600">Overdue</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Wrench className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
              <p className="text-xs text-gray-600">In Progress</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by vehicle, service name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('scheduled')}
            >
              Scheduled
            </Button>
            <Button
              variant={statusFilter === 'overdue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('overdue')}
            >
              Overdue
            </Button>
            <Button
              variant={statusFilter === 'in-progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('in-progress')}
            >
              In Progress
            </Button>
          </div>

          {/* View Mode Toggle */}
          {/* <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
          </div> */}
        </div>
      </Card>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </h3>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={calendarView === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCalendarView('month')}
              >
                Month
              </Button>
              <Button
                variant={calendarView === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCalendarView('week')}
              >
                Week
              </Button>
              <Button
                variant={calendarView === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCalendarView('day')}
              >
                Day
              </Button>
            </div>
          </div>
          <div className="text-center text-gray-500 py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">Calendar view coming soon</p>
            <p className="text-xs text-gray-400 mt-2">
              Will display schedules in an interactive calendar format
            </p>
          </div>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase">Vehicle</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase">Service</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase">Type</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase">Next Due</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase">Progress</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase">Priority</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-gray-500">
                          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-sm">No schedules found</p>
                          <p className="text-xs text-gray-400 mt-2">Try adjusting your filters or create a new schedule</p>
                        </td>
                      </tr>
                    ) : (
                      filteredSchedules.map((schedule) => {
                        const progress = calculateProgress(schedule);
                        return (
                          <tr key={schedule.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{schedule.vehiclePlate}</p>
                                <p className="text-xs text-gray-500">{schedule.vehicleModel}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{schedule.serviceName}</p>
                                <p className="text-xs text-gray-500 capitalize">{schedule.serviceCategory.replace('-', ' ')}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs text-gray-600 capitalize">
                                {schedule.triggerType.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                {schedule.nextDueDate && (
                                  <p className="text-sm text-gray-900">{formatDate(schedule.nextDueDate)}</p>
                                )}
                                {schedule.nextDueMileage && (
                                  <p className="text-xs text-gray-500">{schedule.nextDueMileage.toLocaleString()} km</p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="w-24">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        progress >= 90 ? 'bg-red-600' :
                                        progress >= 70 ? 'bg-yellow-600' :
                                        'bg-green-600'
                                      }`}
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600">{progress}%</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(schedule.status)}
                            </td>
                            <td className="py-3 px-4">
                              {getPriorityBadge(schedule.priority)}
                            </td>
                            <td className="py-3 px-4">
                              <Link href={`/maintenance/schedule/${schedule.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredSchedules.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-500">No schedules found</p>
                <p className="text-xs text-gray-400 mt-2">Try adjusting your filters or create a new schedule</p>
              </Card>
            ) : (
              filteredSchedules.map((schedule) => {
                const progress = calculateProgress(schedule);
                return (
                  <Card key={schedule.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{schedule.serviceName}</h3>
                        <p className="text-sm text-gray-600 mt-1">{schedule.vehiclePlate} • {schedule.vehicleModel}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(schedule.status)}
                        {getPriorityBadge(schedule.priority)}
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="text-gray-900 capitalize">{schedule.triggerType.replace('-', ' ')}</span>
                      </div>
                      {schedule.nextDueDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Next Due:</span>
                          <span className="text-gray-900">{formatDate(schedule.nextDueDate)}</span>
                        </div>
                      )}
                      {schedule.nextDueMileage && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Due at:</span>
                          <span className="text-gray-900">{schedule.nextDueMileage.toLocaleString()} km</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                progress >= 90 ? 'bg-red-600' :
                                progress >= 70 ? 'bg-yellow-600' :
                                'bg-green-600'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-gray-900">{progress}%</span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/maintenance/schedule/${schedule.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
