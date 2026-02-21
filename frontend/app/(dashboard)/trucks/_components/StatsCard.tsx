import React from 'react';
import type { StatsCardProps } from '../_types';

const colorClasses: Record<string, string> = {
  blue: "text-blue-600 bg-blue-50",
  green: "text-green-600 bg-green-50",
  purple: "text-purple-600 bg-purple-50",
  orange: "text-orange-600 bg-orange-50",
  indigo: "text-indigo-600 bg-indigo-50",
  cyan: "text-cyan-600 bg-cyan-50",
  red: "text-red-600 bg-red-50",
  gray: "text-gray-600 bg-gray-50",
};

export function StatsCard({ icon: Icon, label, value, subtext, color }: StatsCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.gray}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{subtext}</p>
    </div>
  );
}
