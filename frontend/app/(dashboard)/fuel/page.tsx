'use client';

import Link from 'next/link';
import { MOCK_FUEL_LOGS } from '@/constants/fuel';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { FuelTable } from './_components';

export default function FuelPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="flex justify-end px-6 py-4">
        <Link href="/fuel/create">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4" />
            Log Fuel
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <FuelTable logs={MOCK_FUEL_LOGS} />
      </div>
    </div>
  );
}
