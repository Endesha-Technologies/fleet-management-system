'use client';

import { useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { mockWorkOrders } from '@/constants/maintenance';
import { WorkOrderStatus, WorkOrderPriority } from '@/types/maintenance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Camera, Mic } from 'lucide-react';
import Link from 'next/link';

function NativeSelect({ value, onValueChange, children, ...props }: any) {
  return (
    <div className="relative">
      <select
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

function SimpleTextarea(props: any) {
  return (
    <textarea
      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  );
}

export default function UpdateStatusPage() {
  const params = useParams();
  const router = useRouter();
  const workOrder = mockWorkOrders.find(wo => wo.id === params.id);
  const [loading, setLoading] = useState(false);

  // Form State
  const [status, setStatus] = useState<WorkOrderStatus>(workOrder?.status || 'pending');
  const [progress, setProgress] = useState('50');
  const [timeSpent, setTimeSpent] = useState('');
  const [workCompleted, setWorkCompleted] = useState('');
  const [issuesEncountered, setIssuesEncountered] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [notifyManager, setNotifyManager] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  if (!workOrder) {
    notFound();
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'awaiting-parts': return 'warning';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock submission
    console.log({
      workOrderId: workOrder.id,
      status,
      progress,
      timeSpent,
      workCompleted,
      issuesEncountered,
      nextSteps,
      notifyManager,
      photos: photos.map(p => p.name),
    });

    setTimeout(() => {
      setLoading(false);
      router.push(`/maintenance/work-orders/${workOrder.id}`);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/maintenance/work-orders/${workOrder.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Update Status</h1>
          <p className="text-muted-foreground mt-1">
            {workOrder.id} - {workOrder.vehiclePlate}
          </p>
        </div>
      </div>

      {/* Current Status */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Status</p>
              <Badge variant={getStatusColor(workOrder.status)}>
                {workOrder.status.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Priority</p>
              <p className="font-semibold capitalize">{workOrder.priority}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Status Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Status Update */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">New Status *</Label>
                <NativeSelect id="status" value={status} onValueChange={setStatus} required>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="awaiting-parts">Awaiting Parts</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">Progress (%)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="progress"
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                    className="flex-1"
                  />
                  <span className="font-semibold text-lg w-12 text-right">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeSpent">Time Spent (hours)</Label>
                <Input
                  id="timeSpent"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="e.g. 2.5"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(e.target.value)}
                />
              </div>
            </div>

            {/* Progress Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Progress Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="workCompleted">Work Completed *</Label>
                <SimpleTextarea
                  id="workCompleted"
                  placeholder="Describe what work has been completed..."
                  value={workCompleted}
                  onChange={(e: any) => setWorkCompleted(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuesEncountered">Issues Encountered</Label>
                <SimpleTextarea
                  id="issuesEncountered"
                  placeholder="Describe any issues or challenges..."
                  value={issuesEncountered}
                  onChange={(e: any) => setIssuesEncountered(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextSteps">Next Steps</Label>
                <SimpleTextarea
                  id="nextSteps"
                  placeholder="What needs to be done next..."
                  value={nextSteps}
                  onChange={(e: any) => setNextSteps(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Photos & Documentation */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Photos & Documentation</h3>
              
              <div className="space-y-2">
                <Label htmlFor="photos">Upload Photos</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="photos"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="cursor-pointer"
                    />
                  </div>
                  <Button type="button" variant="outline" size="icon">
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon">
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
                {photos.length > 0 && (
                  <div className="text-sm text-gray-600 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="font-medium mb-1 text-green-900">{photos.length} photo(s) selected:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {photos.map((file, index) => (
                        <li key={index} className="truncate text-green-700">{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Notifications</h3>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notifyManager"
                  checked={notifyManager}
                  onChange={(e) => setNotifyManager(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="notifyManager" className="font-normal cursor-pointer">
                  Notify Fleet Manager
                </Label>
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t p-6 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Status
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
