'use client'

import { notFound } from 'next/navigation'
import { MOCK_TRIPS } from '@/constants/trips'
import { TripDetails } from '@/components/features/trips/TripDetails'
import { use } from 'react'

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TripDetailsPage({ params }: PageProps) {
  const { id } = use(params)
  const trip = MOCK_TRIPS.find((t) => t.id === id)

  if (!trip) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <TripDetails trip={trip} />
      </div>
    </div>
  )
}
