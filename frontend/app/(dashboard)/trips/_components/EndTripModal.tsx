'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormDateInput, FormTextarea } from '@/components/ui/form';
import { StopCircle } from 'lucide-react';
import type { EndTripModalProps } from '../_types';

export function EndTripModal({ trip, isOpen, onClose, onConfirm }: EndTripModalProps) {
  const [actualEndTime, setActualEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [showReasonField, setShowReasonField] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Set current date/time as default
      const now = new Date();
      const formattedDateTime = now.toISOString().slice(0, 16);
      
      // Check if there's a time difference
      const scheduledEnd = new Date(trip.scheduledEndTime);
      const timeDiff = Math.abs(now.getTime() - scheduledEnd.getTime()) / (1000 * 60); // difference in minutes
      
      // Batch state updates
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setActualEndTime(formattedDateTime);
      setShowReasonField(timeDiff > 15);
      setReason('');
    }
  }, [isOpen, trip.scheduledEndTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(actualEndTime, showReasonField ? reason : undefined);
    onClose();
  };

  if (!isOpen) return null;

  const scheduledEnd = new Date(trip.scheduledEndTime);
  const actualEnd = actualEndTime ? new Date(actualEndTime) : null;
  const timeDiff = actualEnd 
    ? Math.round((actualEnd.getTime() - scheduledEnd.getTime()) / (1000 * 60))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <StopCircle className="h-6 w-6 text-red-700" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">End Trip</h2>
            <p className="text-sm text-gray-500">Trip #{trip.id}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trip Started At */}
          {trip.actualStartTime && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Trip Started</Label>
              <p className="mt-1 px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                {new Date(trip.actualStartTime).toLocaleString('en-US', { 
                  dateStyle: 'medium', 
                  timeStyle: 'short' 
                })}
              </p>
            </div>
          )}

          {/* Scheduled End Time */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Scheduled End Time</Label>
            <p className="mt-1 px-3 py-2 bg-gray-50 rounded-md text-gray-900">
              {scheduledEnd.toLocaleString('en-US', { 
                dateStyle: 'medium', 
                timeStyle: 'short' 
              })}
            </p>
          </div>

          {/* Actual End Time */}
          <FormDateInput
            label="Actual End Time"
            includeTime
            value={actualEndTime}
            onChange={(e) => {
              setActualEndTime(e.target.value);
              // Recalculate if reason field should be shown
              const newTime = new Date(e.target.value);
              const diff = Math.abs(newTime.getTime() - scheduledEnd.getTime()) / (1000 * 60);
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
                  <>Ending <strong>{timeDiff} minutes late</strong></>
                ) : (
                  <>Ending <strong>{Math.abs(timeDiff)} minutes early</strong></>
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
              placeholder="Explain why the trip is ending at a different time..."
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
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <StopCircle className="h-4 w-4 mr-2" />
              End Trip
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
