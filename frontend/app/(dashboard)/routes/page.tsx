'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RouteTable } from '@/components/features/routes/RouteTable';
import { RouteCard } from '@/components/features/routes/RouteCard';
import { MOCK_ROUTES } from '@/constants/routes';

export default function RoutesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoutes = MOCK_ROUTES.filter((route) =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.endLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Routes</h1>
          <p className="text-muted-foreground">
            Manage and optimize your fleet routes.
          </p>
        </div>
        <Link href="/routes/create" scroll={false}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create Route
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search routes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <RouteTable routes={filteredRoutes} />
      
      <div className="md:hidden">
        {filteredRoutes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </div>
  );
}
