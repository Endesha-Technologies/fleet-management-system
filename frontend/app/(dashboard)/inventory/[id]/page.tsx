'use client';

import { use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { MOCK_INVENTORY_ITEMS } from '@/constants/inventory';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Truck, Calendar, MapPin, User, DollarSign, ArrowRight, ShoppingCart, Trash2, Wrench } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InventoryDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const item = MOCK_INVENTORY_ITEMS.find((i) => i.id === id);

  if (!item) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Storage': return 'bg-blue-100 text-blue-800';
      case 'Sold': return 'bg-green-100 text-green-800';
      case 'Disposed': return 'bg-red-100 text-red-800';
      case 'Used in Maintenance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'New': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-yellow-600';
      case 'Poor': return 'text-orange-600';
      case 'Damaged': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{item.partName}</h1>
              <p className="text-xs sm:text-sm text-gray-600">{item.partNumber}</p>
            </div>
          </div>
          {item.status === 'In Storage' && (
            <Link href={`/inventory/${id}/move`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                <span className="hidden sm:inline">Move Part</span>
                <ArrowRight className="w-4 h-4 sm:ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex text-sm px-3 py-1.5 rounded-full font-medium ${getStatusColor(item.status)}`}>
              {item.status}
            </span>
            <span className={`text-lg font-semibold ${getConditionColor(item.condition)}`}>
              {item.condition} Condition
            </span>
          </div>

          {/* Part Information */}
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <h2 className="font-semibold text-base sm:text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Part Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">Part Name</span>
                <span className="font-medium text-gray-900">{item.partName}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Part Number</span>
                <span className="font-medium text-gray-900">{item.partNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Category</span>
                <span className="font-medium text-gray-900">{item.category}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Quantity</span>
                <span className="font-medium text-gray-900">{item.quantity}</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <h2 className="font-semibold text-base sm:text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Pricing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span className="text-gray-500 text-sm block mb-1">Unit Price</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(item.unitPrice)}</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <span className="text-blue-700 text-sm block mb-1">Total Value</span>
                <span className="text-xl font-bold text-blue-900">{formatCurrency(item.totalValue)}</span>
              </div>
            </div>
          </div>

          {/* Removal Details */}
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <h2 className="font-semibold text-base sm:text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Removal Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Truck className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-500 block">Removed From</span>
                  <span className="font-medium text-gray-900">{item.removedFromVehicle}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-500 block">Removal Date</span>
                  <span className="font-medium text-gray-900">{formatDate(item.removalDate)}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <span className="text-gray-500 block">Reason</span>
                  <span className="font-medium text-gray-900">{item.removalReason}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Storage & Personnel */}
          <div className="space-y-4">
            <h2 className="font-semibold text-base sm:text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Storage & Personnel
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-500 block">Storage Location</span>
                  <span className="font-medium text-gray-900">{item.storageLocation}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-500 block">Added By</span>
                  <span className="font-medium text-gray-900">{item.addedBy}</span>
                </div>
              </div>
            </div>
            {item.notes && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <span className="text-amber-900 text-sm font-medium block mb-2">Notes</span>
                <p className="text-amber-800 text-sm">{item.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
