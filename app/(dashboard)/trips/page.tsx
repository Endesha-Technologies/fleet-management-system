'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { TripTable } from '@/components/features/trips/TripTable';
import { MOCK_TRIPS } from '@/constants/trips';

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'in-progress' | 'completed'>('all');

  const filteredTrips = MOCK_TRIPS.filter(trip => {
    if (activeTab === 'all') return true;
    if (activeTab === 'scheduled') return trip.status === 'Scheduled';
    if (activeTab === 'in-progress') return trip.status === 'In Progress';
    if (activeTab === 'completed') return trip.status === 'Completed';
    return true;
  });

  const stats = {
    active: MOCK_TRIPS.filter(t => t.status === 'In Progress').length,
    scheduled: MOCK_TRIPS.filter(t => t.status === 'Scheduled').length,
    completed: MOCK_TRIPS.filter(t => t.status === 'Completed').length,
    cancelled: MOCK_TRIPS.filter(t => t.status === 'Cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip Dispatch Center</h1>
          <p className="text-sm text-gray-500 mt-1">Assign, track, and manage all fleet trips</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" asChild>
          <Link href="/trips/create" scroll={false} prefetch={true}>
            <Plus className="h-4 w-4 mr-2" />
            Assign New Trip
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Trips</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.active}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Scheduled</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.scheduled}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4 md:space-x-8 px-4 md:px-6 min-w-max" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3 md:py-4 px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All ({MOCK_TRIPS.length})
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`py-3 md:py-4 px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap transition-colors ${
                activeTab === 'scheduled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Scheduled ({stats.scheduled})
            </button>
            <button
              onClick={() => setActiveTab('in-progress')}
              className={`py-3 md:py-4 px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap transition-colors ${
                activeTab === 'in-progress'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              In Progress ({stats.active})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-3 md:py-4 px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap transition-colors ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed ({stats.completed})
            </button>
          </nav>
        </div>

        {/* Trips Table */}
        <div className="p-4 md:p-6">
          <TripTable trips={filteredTrips} />
        </div>
      </div>
    </div>
  );
}
