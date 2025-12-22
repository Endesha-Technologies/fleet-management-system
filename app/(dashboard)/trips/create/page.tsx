'use client'

import { TripForm } from '@/components/features/trips/TripForm'

export default function CreateTripPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <TripForm />
      </div>
    </div>
  )
}
