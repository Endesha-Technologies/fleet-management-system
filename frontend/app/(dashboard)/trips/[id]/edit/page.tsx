'use client'

import { notFound } from 'next/navigation'
import { MOCK_TRIPS } from '@/constants/trips'
import { TripForm } from '../../_components'
import { use } from 'react'
import type { TripPageProps } from '../../_types'

export default function EditTripPage({ params }: TripPageProps) {
  const { id } = use(params)
  const trip = MOCK_TRIPS.find((t) => t.id === id)

  if (!trip) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <TripForm initialData={trip} isEditing />
      </div>
    </div>
  )
}
