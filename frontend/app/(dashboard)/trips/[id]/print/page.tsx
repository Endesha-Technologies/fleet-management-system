'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { MOCK_TRIPS } from '@/constants/trips'
import { Trip } from '@/types/trip'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PrintTripPage({ params }: PageProps) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ id }) => {
      const foundTrip = MOCK_TRIPS.find((t) => t.id === id)
      if (!foundTrip) {
        notFound()
      }
      setTrip(foundTrip)
      setLoading(false)

      // Auto-trigger print dialog after page loads
      const timer = setTimeout(() => {
        window.print()
      }, 500)

      return () => clearTimeout(timer)
    })
  }, [params])

  if (loading || !trip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <PrintView trip={trip} />
}

function PrintView({ trip }: { trip: Trip }) {
  const scheduledStart = new Date(trip.scheduledStartTime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const scheduledEnd = new Date(trip.scheduledEndTime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const actualStart = trip.actualStartTime
    ? new Date(trip.actualStartTime).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Not started'
  const actualEnd = trip.actualEndTime
    ? new Date(trip.actualEndTime).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : trip.status === 'In Progress'
    ? 'Ongoing'
    : 'Not completed'

  const statusColors = {
    'Completed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Scheduled': 'bg-yellow-100 text-yellow-800',
    'Cancelled': 'bg-red-100 text-red-800',
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="border-b-4 border-blue-600 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Details - #{trip.id}</h1>
          <p className="text-gray-600">Fleet Management System</p>
        </div>

        {/* Status */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Status</h2>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[trip.status as keyof typeof statusColors]}`}>
            {trip.status}
          </span>
        </div>

        {/* Route Information */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Route Information</h2>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-600">Route</p>
              <p className="text-base text-gray-900">{trip.routeName}</p>
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Assignment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Driver</p>
              <p className="text-base text-gray-900">{trip.driverName}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Vehicle</p>
              <p className="text-base text-gray-900">{trip.vehiclePlate}</p>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Schedule</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Scheduled Start</p>
              <p className="text-base text-gray-900">{scheduledStart}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Scheduled End</p>
              <p className="text-base text-gray-900">{scheduledEnd}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Actual Start</p>
              <p className="text-base text-gray-900">{actualStart}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Actual End</p>
              <p className="text-base text-gray-900">{actualEnd}</p>
            </div>
          </div>
        </div>

        {/* Fuel & Odometer */}
        {(trip.fuelStart || trip.fuelEnd || trip.odometerStart || trip.odometerEnd) && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Fuel & Odometer</h2>
            <div className="grid grid-cols-2 gap-4">
              {trip.fuelStart && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Fuel Start</p>
                  <p className="text-base text-gray-900">{trip.fuelStart}L</p>
                </div>
              )}
              {trip.fuelEnd && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Fuel End</p>
                  <p className="text-base text-gray-900">{trip.fuelEnd}L</p>
                </div>
              )}
              {trip.fuelConsumed && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Fuel Consumed</p>
                  <p className="text-base text-gray-900">{trip.fuelConsumed}L</p>
                </div>
              )}
              {trip.odometerStart && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Odometer Start</p>
                  <p className="text-base text-gray-900">{trip.odometerStart.toLocaleString()} km</p>
                </div>
              )}
              {trip.odometerEnd && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Odometer End</p>
                  <p className="text-base text-gray-900">{trip.odometerEnd.toLocaleString()} km</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {(trip.notes || trip.dispatcherNotes) && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Notes</h2>
            {trip.dispatcherNotes && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-600">Dispatcher Notes</p>
                <p className="text-base text-gray-900">{trip.dispatcherNotes}</p>
              </div>
            )}
            {trip.notes && (
              <div>
                <p className="text-sm font-semibold text-gray-600">Trip Notes</p>
                <p className="text-base text-gray-900">{trip.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>Printed on {new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
        </div>
      </div>
    </>
  )
}
