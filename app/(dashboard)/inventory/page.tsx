'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, History, ShoppingCart, Trash2 } from 'lucide-react';
import InventoryTable from '@/components/features/inventory/InventoryTable';
import { MOCK_INVENTORY_ITEMS } from '@/constants/inventory';

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className=" px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Track spare parts removed from trucks</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/inventory/history">
              <Button variant="outline" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            </Link>
            <Link href="/inventory/add">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Part</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6">
        <InventoryTable items={MOCK_INVENTORY_ITEMS} />
      </div>
    </div>
  );
}
