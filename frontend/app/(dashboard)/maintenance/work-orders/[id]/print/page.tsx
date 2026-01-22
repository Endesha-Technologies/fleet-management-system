'use client';

import { notFound, useParams } from 'next/navigation';
import { mockWorkOrders } from '@/constants/maintenance';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

export default function PrintWorkOrderPage() {
  const params = useParams();
  const workOrder = mockWorkOrders.find(wo => wo.id === params.id);

  useEffect(() => {
    // Auto-trigger print dialog after page loads
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!workOrder) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'awaiting-parts': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="print:p-8 p-4 max-w-4xl mx-auto bg-white">
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            margin: 1cm;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>

      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Work Order</h1>
            <p className="text-xl font-semibold mt-2">{workOrder.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Date Printed</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Status & Priority */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg print:bg-gray-100">
        <div>
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workOrder.status)}`}>
            {workOrder.status.replace('-', ' ').toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Priority</p>
          <p className="font-semibold capitalize">{workOrder.priority}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Type</p>
          <p className="font-semibold capitalize">{workOrder.type}</p>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Vehicle Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Plate Number</p>
            <p className="font-semibold text-lg">{workOrder.vehiclePlate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Model</p>
            <p className="font-medium">{workOrder.vehicleModel}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Odometer Reading</p>
            <p className="font-medium">125,430 km</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Service Category</p>
            <p className="font-medium capitalize">{workOrder.category}</p>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Service Details</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Description</p>
            <p className="font-medium">{workOrder.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Service Location</p>
              <p className="font-medium">Workshop</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Schedule</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Created Date</p>
            <p className="font-medium">{formatDate(workOrder.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="font-medium">{formatDate(workOrder.dueDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Estimated Duration</p>
            <p className="font-medium">4 hours</p>
          </div>
        </div>
      </div>

      {/* Assignment */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Assignment</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Assigned Technician</p>
            <p className="font-medium">{workOrder.assignedTo || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Workshop/Bay</p>
            <p className="font-medium">Bay 3</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Supervisor</p>
            <p className="font-medium">James Supervisor</p>
          </div>
        </div>
      </div>

      {/* Parts */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Parts Used</h2>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 border">Part Name</th>
              <th className="text-center p-2 border">Quantity</th>
              <th className="text-right p-2 border">Unit Cost</th>
              <th className="text-right p-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">Engine Oil Filter</td>
              <td className="text-center p-2 border">2</td>
              <td className="text-right p-2 border">UGX 12,500</td>
              <td className="text-right p-2 border">UGX 25,000</td>
            </tr>
            <tr>
              <td className="p-2 border">Brake Pads (Front)</td>
              <td className="text-center p-2 border">1 set</td>
              <td className="text-right p-2 border">UGX 85,000</td>
              <td className="text-right p-2 border">UGX 85,000</td>
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td colSpan={3} className="p-2 border text-right">Subtotal:</td>
              <td className="text-right p-2 border">UGX 110,000</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Labor */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Labor</h2>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 border">Technician</th>
              <th className="text-center p-2 border">Hours</th>
              <th className="text-right p-2 border">Rate/Hour</th>
              <th className="text-right p-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">{workOrder.assignedTo || 'Unassigned'}</td>
              <td className="text-center p-2 border">4</td>
              <td className="text-right p-2 border">UGX 500</td>
              <td className="text-right p-2 border">UGX 2,000</td>
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td colSpan={3} className="p-2 border text-right">Subtotal:</td>
              <td className="text-right p-2 border">UGX 2,000</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Cost Summary */}
      <div className="mb-6 border-2 border-gray-300 rounded-lg p-4 bg-gray-50 print:bg-gray-100">
        <h2 className="text-xl font-bold mb-3">Cost Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Parts Cost:</span>
            <span className="font-medium">UGX 110,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Labor Cost:</span>
            <span className="font-medium">UGX 2,000</span>
          </div>
          <div className="flex justify-between pt-2 border-t-2 border-gray-400 text-lg font-bold">
            <span>Total Cost:</span>
            <span>UGX 112,000</span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t-2">
        <div>
          <div className="border-t border-gray-400 pt-2 mt-16">
            <p className="text-sm text-gray-600">Technician Signature</p>
            <p className="font-medium">{workOrder.assignedTo || '_______________'}</p>
          </div>
        </div>
        <div>
          <div className="border-t border-gray-400 pt-2 mt-16">
            <p className="text-sm text-gray-600">Supervisor Signature</p>
            <p className="font-medium">_______________</p>
          </div>
        </div>
      </div>

      {/* No Print Button */}
      <div className="no-print mt-8 text-center">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Print Again
        </button>
        <button
          onClick={() => window.history.back()}
          className="ml-3 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
