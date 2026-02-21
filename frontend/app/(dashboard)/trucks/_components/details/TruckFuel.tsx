import React from 'react';
import type { TruckFuelProps } from '../../_types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TruckFuel({ truckId }: TruckFuelProps) {
  // Mock Fuel Data
  const fuelLogs = [
    {
      id: 'FL-001',
      date: '2026-02-01',
      litres: 150,
      cost: 25500,
      odometer: 125400,
      consumption: '32.1 L/100km',
      station: 'Total Mombasa Rd',
    },
    {
      id: 'FL-002',
      date: '2026-01-28',
      litres: 140,
      cost: 23800,
      odometer: 124915,
      consumption: '31.8 L/100km',
      station: 'Shell Voi',
    },
    {
      id: 'FL-003',
      date: '2026-01-25',
      litres: 60,
      cost: 10200,
      odometer: 124425,
      consumption: '33.5 L/100km',
      station: 'Rubis Nakuru',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm">
          <p className="text-sm text-orange-600 font-medium">Avg Consumption</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">32.5 <span className="text-sm font-normal text-gray-500">L/100km</span></p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
          <p className="text-sm text-blue-600 font-medium">Total Fuel Cost (MTD)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">KES 59,500</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
          <p className="text-sm text-green-600 font-medium">Last Refuel</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">1 Feb 2026</p>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Litres</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Cost (KES)</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Odometer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Consumption</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Station</th>
            </tr>
          </thead>
          <tbody>
            {fuelLogs.map((log) => (
              <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-700">{log.date}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{log.litres}</td>
                <td className="px-4 py-3 text-gray-700">{log.cost.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-700">{log.odometer.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {log.consumption}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{log.station}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
