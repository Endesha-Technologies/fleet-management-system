'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormDateInput, FormTextarea } from '@/components/ui/form';
import { PlayCircle } from 'lucide-react';
import type { StartTripModalProps } from '../_types';

export function StartTripModal({ trip, isOpen, onClose, onConfirm }: StartTripModalProps) {
  const [actualStartTime, setActualStartTime] = useState('');
  const [reason, setReason] = useState('');
  const [showReasonField, setShowReasonField] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Set current date/time as default
      const now = new Date();
      const formattedDateTime = now.toISOString().slice(0, 16);
      
      // Check if there's a time difference
      const scheduledStart = new Date(trip.scheduledStartTime);
      const timeDiff = Math.abs(now.getTime() - scheduledStart.getTime()) / (1000 * 60); // difference in minutes
      
      // Batch state updates
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setActualStartTime(formattedDateTime);
      setShowReasonField(timeDiff > 15);
      setReason('');
    }
  }, [isOpen, trip.scheduledStartTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(actualStartTime, showReasonField ? reason : undefined);
    onClose();
  };

  if (!isOpen) return null;

  const scheduledStart = new Date(trip.scheduledStartTime);
  const actualStart = actualStartTime ? new Date(actualStartTime) : null;
  const timeDiff = actualStart 
    ? Math.round((actualStart.getTime() - scheduledStart.getTime()) / (1000 * 60))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <PlayCircle className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Start Trip</h2>
            <p className="text-sm text-gray-500">Trip #{trip.id}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Scheduled Start Time */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Scheduled Start Time</Label>
            <p className="mt-1 px-3 py-2 bg-gray-50 rounded-md text-gray-900">
              {scheduledStart.toLocaleString('en-US', { 
                dateStyle: 'medium', 
                timeStyle: 'short' 
              })}
            </p>
          </div>

          {/* Actual Start Time */}
          <FormDateInput
            label="Actual Start Time"
            includeTime
            value={actualStartTime}
            onChange={(e) => {
              setActualStartTime(e.target.value);
              // Recalculate if reason field should be shown
              const newTime = new Date(e.target.value);
              const diff = Math.abs(newTime.getTime() - scheduledStart.getTime()) / (1000 * 60);
              setShowReasonField(diff > 15);
            }}
            required
          />

          {/* Time Difference Indicator */}
          {timeDiff !== 0 && (
            <div className={`p-3 rounded-md ${
              Math.abs(timeDiff) > 15 
                ? 'bg-orange-50 border border-orange-200' 
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className="text-sm">
                {timeDiff > 0 ? (
                  <>Starting <strong>{timeDiff} minutes late</strong></>
                ) : (
                  <>Starting <strong>{Math.abs(timeDiff)} minutes early</strong></>
                )}
              </p>
            </div>
          )}

          {/* Reason Field (conditional) */}
          {showReasonField && (
            <FormTextarea
              label="Reason for Time Difference"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required={showReasonField}
              rows={3}
              placeholder="Explain why the trip is starting at a different time..."
            />
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Trip
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
