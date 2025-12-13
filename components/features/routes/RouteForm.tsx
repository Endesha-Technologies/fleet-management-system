'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Route } from '@/types/route';

interface RouteFormProps {
  initialData?: Route;
  isEditing?: boolean;
}

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
        <div className="space-y-2">
          <Label htmlFor="name">Route Name</Label>
          <Input 
            id="name" 
            placeholder="e.g. Morning Delivery Route A" 
            defaultValue={initialData?.name}
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input 
            id="date" 
            type="date" 
            defaultValue={initialData?.date}
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start">Start Location</Label>
          <Input 
            id="start" 
            placeholder="Enter start location" 
            defaultValue={initialData?.startLocation}
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end">End Location</Label>
          <Input 
            id="end" 
            placeholder="Enter destination" 
            defaultValue={initialData?.endLocation}
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="distance">Estimated Distance</Label>
          <Input 
            id="distance" 
            placeholder="e.g. 15.4 km" 
            defaultValue={initialData?.distance}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration">Estimated Duration</Label>
          <Input 
            id="duration" 
            placeholder="e.g. 45 mins" 
            defaultValue={initialData?.estimatedDuration}
          />
        </div>
      </div>
    </form>
  );
}
