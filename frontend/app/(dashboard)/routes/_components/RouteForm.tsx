'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FormInput, FormNumberInput } from '@/components/ui/form';
import type { RouteFormProps } from '../_types';

export function RouteForm({ initialData, isEditing = false }: RouteFormProps) {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted', isEditing ? 'Update' : 'Create');
    router.back();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full h-full flex flex-col">
      <div className="flex flex-col gap-6 pb-4 border-b border-gray-100 shrink-0">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{isEditing ? 'Edit Route' : 'Create New Route'}</h2>
          <p className="text-sm text-muted-foreground">
            {isEditing ? 'Update the route details below.' : 'Fill in the details to create a new route.'}
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {isEditing ? 'Save Changes' : 'Create Route'}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-4">
        <FormInput
          id="name"
          label="Route Name"
          placeholder="e.g. Morning Delivery Route A"
          defaultValue={initialData?.name}
          required
        />

        <FormInput
          id="origin"
          label="Origin"
          placeholder="Enter origin location"
          defaultValue={initialData?.origin.name}
          required
        />

        <FormInput
          id="destination"
          label="Destination"
          placeholder="Enter destination"
          defaultValue={initialData?.destination.name}
          required
        />

        <FormInput
          id="distance"
          label="Estimated Distance"
          placeholder="e.g. 15.4 km"
          defaultValue={initialData?.distance}
        />

        <FormInput
          id="duration"
          label="Estimated Duration"
          placeholder="e.g. 45 mins"
          defaultValue={initialData?.estimatedDuration}
        />

        <FormNumberInput
          id="deviationThreshold"
          label="Deviation Threshold (meters)"
          placeholder="e.g. 500"
          defaultValue={initialData?.deviationThreshold}
        />
      </div>
    </form>
  );
}
