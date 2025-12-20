'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TripDetailsPage({ params }: PageProps) {
  const router = useRouter()
  
  useEffect(() => {
    // Unwrap params and redirect to trigger intercepting route (modal)
    params.then(({ id }) => {
      router.push(`/trips/${id}`)
    })
  }, [router, params])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
}
