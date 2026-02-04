import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TruckTripsProps {
  truckId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TruckTrips({ truckId }: TruckTripsProps) {
  // Mock Trips Data
  const trips = [
    {
      id: 'TR-2026-001',
      date: '2026-02-01',
      route: 'Nairobi - Mombasa',
      distance: '485 km',
      fuelUsed: '160 L',
      driver: 'John Karanja',
      turnBoy: 'Mike Omondi',
      status: 'Completed',
    },
    {
      id: 'TR-2026-005',
      date: '2026-01-28',
      route: 'Mombasa - Nairobi',
      distance: '490 km',
      fuelUsed: '165 L',
      driver: 'John Karanja',
      turnBoy: 'Mike Omondi',
      status: 'Completed',
    },
    {
      id: 'TR-2026-012',
      date: '2026-01-25',
      route: 'Nairobi - Nakuru',
      distance: '160 km',
      fuelUsed: '55 L',
      driver: 'Peter Kipchoge',
      turnBoy: 'Dennis Mwangi',
      status: 'Completed',
    },
    {
      id: 'TR-2026-018',
      date: '2026-02-03',
      route: 'Nairobi - Kisumu',
      distance: '350 km',
      fuelUsed: '120 L',
      driver: 'John Karanja',
      turnBoy: 'Mike Omondi',
      status: 'In Progress',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Scheduled': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="font-medium text-gray-900">Trip History</h3>
        <div className="text-sm text-gray-500">
          Total Distance: <span className="font-medium text-gray-900">1,485 km</span> | 
          Total Fuel: <span className="font-medium text-gray-900">500 L</span>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-700">Trip ID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Route</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Distance</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Fuel Used</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Driver</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Turn Boy</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-blue-600">{trip.id}</td>
                <td className="px-4 py-3 text-gray-700">{trip.date}</td>
                <td className="px-4 py-3 text-gray-700">{trip.route}</td>
                <td className="px-4 py-3 text-gray-700">{trip.distance}</td>
                <td className="px-4 py-3 text-gray-700">{trip.fuelUsed}</td>
                <td className="px-4 py-3 text-gray-700">{trip.driver}</td>
                <td className="px-4 py-3 text-gray-700">{trip.turnBoy}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4 text-gray-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
