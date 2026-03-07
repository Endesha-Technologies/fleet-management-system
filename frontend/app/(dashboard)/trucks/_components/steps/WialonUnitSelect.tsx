'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, Radio, Loader2, X, Wifi, WifiOff } from 'lucide-react';
import { FormField } from '@/components/ui/form';
import { trucksService } from '@/api/trucks/trucks.service';
import type { WialonUnit } from '@/api/trucks/trucks.types';
import { cn } from '@/lib/utils';

interface WialonUnitSelectProps {
  value: string;
  onChange: (wialonId: string) => void;
  label?: string;
  description?: string;
  error?: string;
}

export function WialonUnitSelect({
  value,
  onChange,
  label = 'Wialon Tracking Unit',
  description,
  error,
}: WialonUnitSelectProps) {
  const [units, setUnits] = useState<WialonUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch Wialon units on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchUnits() {
      setLoading(true);
      setFetchError(null);
      try {
        const data = await trucksService.getWialonUnits();
        if (!cancelled) setUnits(data);
      } catch {
        if (!cancelled) setFetchError('Failed to load Wialon units');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchUnits();
    return () => {
      cancelled = true;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter units by search term
  const filtered = useMemo(() => {
    if (!search.trim()) return units;
    const q = search.toLowerCase();
    return units.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.imei?.toLowerCase().includes(q) ||
        String(u.wialonId).includes(q),
    );
  }, [units, search]);

  // Currently selected unit
  const selectedUnit = useMemo(
    () => units.find((u) => String(u.wialonId) === value),
    [units, value],
  );

  const handleSelect = useCallback(
    (unit: WialonUnit) => {
      onChange(String(unit.wialonId));
      setSearch('');
      setIsOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange('');
    setSearch('');
  }, [onChange]);

  return (
    <FormField label={label} description={description} error={error || fetchError || undefined}>
      <div ref={containerRef} className="relative">
        {/* Selected value display / trigger */}
        {selectedUnit && !isOpen ? (
          <div
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-background px-3 py-2 text-sm cursor-pointer hover:border-gray-400 transition-colors',
              error && 'border-red-500',
            )}
            onClick={() => setIsOpen(true)}
          >
            <div className="flex items-center gap-2 min-w-0">
              {selectedUnit.isOnline ? (
                <Wifi className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              )}
              <span className="truncate font-medium">{selectedUnit.name}</span>
              <span className="text-gray-400 text-xs flex-shrink-0">
                #{selectedUnit.wialonId}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="ml-2 flex-shrink-0 p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          /* Search input */
          <div
            className={cn(
              'flex h-10 w-full items-center gap-2 rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
              error && 'border-red-500 focus-within:ring-red-500',
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin flex-shrink-0" />
            ) : (
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
            <input
              type="text"
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder={loading ? 'Loading units…' : 'Search by name, IMEI, or ID…'}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              disabled={loading}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="flex-shrink-0 p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Dropdown */}
        {isOpen && !loading && (
          <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-500">
                {fetchError ? (
                  fetchError
                ) : search ? (
                  <>No units match &quot;{search}&quot;</>
                ) : (
                  'No Wialon units available'
                )}
              </div>
            ) : (
              filtered.map((unit) => {
                const isSelected = String(unit.wialonId) === value;
                return (
                  <button
                    key={unit.wialonId}
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors',
                      isSelected && 'bg-blue-50 hover:bg-blue-50',
                    )}
                    onClick={() => handleSelect(unit)}
                  >
                    {/* Online indicator */}
                    {unit.isOnline ? (
                      <Wifi className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    ) : (
                      <WifiOff className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    )}

                    {/* Unit info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('font-medium truncate', isSelected && 'text-blue-700')}>
                          {unit.name}
                        </span>
                        {unit.isOnline && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                            Online
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>ID: {unit.wialonId}</span>
                        {unit.imei && <span>· IMEI: {unit.imei}</span>}
                        {unit.hwType && <span>· {unit.hwType}</span>}
                      </div>
                    </div>

                    {/* Selected check */}
                    {isSelected && (
                      <Radio className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </FormField>
  );
}
