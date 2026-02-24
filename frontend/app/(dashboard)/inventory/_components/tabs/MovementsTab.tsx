'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  Wrench,
  Trash2,
  ShoppingCart,
  RotateCcw,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { assetsService } from '@/api/assets';
import type { AssetTransaction, TransactionAction } from '@/api/assets/assets.types';
import type { Pagination } from '@/api/types';
import type { MovementsTabProps } from '../../_types';
import type { MovementType } from '@/api/assets/assets.types';

// ---- Transaction action display config -----------------------------------

const ACTION_CONFIG: Record<TransactionAction, { label: string; icon: React.ReactNode; color: string; badgeClass: string }> = {
  CREATE: {
    label: 'Created',
    icon: <PlusCircle className="h-3.5 w-3.5" />,
    color: 'text-slate-600',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  PURCHASE: {
    label: 'Purchase',
    icon: <ShoppingCart className="h-3.5 w-3.5" />,
    color: 'text-green-600',
    badgeClass: 'bg-green-50 text-green-700 border-green-200',
  },
  INSTALL: {
    label: 'Install',
    icon: <Wrench className="h-3.5 w-3.5" />,
    color: 'text-blue-600',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  REMOVE: {
    label: 'Remove',
    icon: <RotateCcw className="h-3.5 w-3.5" />,
    color: 'text-orange-600',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  DISPOSE: {
    label: 'Dispose',
    icon: <Trash2 className="h-3.5 w-3.5" />,
    color: 'text-red-600',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
  },
  ADJUST: {
    label: 'Adjustment',
    icon: <SlidersHorizontal className="h-3.5 w-3.5" />,
    color: 'text-purple-600',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
};

// Movement summary display config (reused for summary cards)
const MOVEMENT_CONFIG: Record<MovementType, { label: string; icon: React.ReactNode; color: string; badgeVariant: string }> = {
  INITIAL: { label: 'Initial Stock', icon: <Package className="h-3.5 w-3.5" />, color: 'text-slate-600', badgeVariant: 'bg-slate-50 text-slate-700 border-slate-200' },
  PURCHASE: { label: 'Purchase', icon: <ShoppingCart className="h-3.5 w-3.5" />, color: 'text-green-600', badgeVariant: 'bg-green-50 text-green-700 border-green-200' },
  TYRE_MOUNT: { label: 'Tyre Mount', icon: <Wrench className="h-3.5 w-3.5" />, color: 'text-blue-600', badgeVariant: 'bg-blue-50 text-blue-700 border-blue-200' },
  TYRE_DISMOUNT: { label: 'Tyre Dismount', icon: <RotateCcw className="h-3.5 w-3.5" />, color: 'text-orange-600', badgeVariant: 'bg-orange-50 text-orange-700 border-orange-200' },
  INSTALL: { label: 'Install', icon: <Wrench className="h-3.5 w-3.5" />, color: 'text-blue-600', badgeVariant: 'bg-blue-50 text-blue-700 border-blue-200' },
  REMOVAL: { label: 'Removal', icon: <RotateCcw className="h-3.5 w-3.5" />, color: 'text-orange-600', badgeVariant: 'bg-orange-50 text-orange-700 border-orange-200' },
  DISPOSAL: { label: 'Disposal', icon: <Trash2 className="h-3.5 w-3.5" />, color: 'text-red-600', badgeVariant: 'bg-red-50 text-red-700 border-red-200' },
  ADJUSTMENT: { label: 'Adjustment', icon: <SlidersHorizontal className="h-3.5 w-3.5" />, color: 'text-purple-600', badgeVariant: 'bg-purple-50 text-purple-700 border-purple-200' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---- Component ------------------------------------------------------------

export default function MovementsTab({ assetId, movementSummary }: MovementsTabProps) {
  const [transactions, setTransactions] = useState<AssetTransaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 20;

  const fetchTransactions = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await assetsService.getTransactionHistory(assetId, {
        page,
        limit: PAGE_SIZE,
      });
      setTransactions(result.data);
      setPagination(result.pagination);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [fetchTransactions, currentPage]);




  return (
    <div className="space-y-4">

      {/* Movement type breakdown from stock summary */}
      {movementSummary && movementSummary.length > 0 && (
        <Card className="border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Stock Movement Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {movementSummary.map((s, idx) => {
                const config = MOVEMENT_CONFIG[s.movementType];
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${config?.badgeVariant ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    <span className={config?.color ?? 'text-gray-600'}>{config?.icon}</span>
                    <span className="font-medium">{config?.label ?? s.movementType.replace(/_/g, ' ')}</span>
                    <span className="text-gray-400">•</span>
                    <span>
                      {s.direction === 'IN' ? '+' : '-'}{s._sum.quantity} ({s._count}×)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction history table */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All recorded transactions for this asset — purchases, installs, removals, disposals, and adjustments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center h-32 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-500">Loading transactions…</span>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center h-32 gap-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchTransactions(currentPage)}>
                Retry
              </Button>
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && (
            <>
              <div className="border border-gray-200 rounded-md bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="w-[110px]">Date</TableHead>
                      <TableHead className="w-[130px]">Action</TableHead>
                      <TableHead className="w-[70px] text-right">Qty</TableHead>
                      <TableHead className="w-[180px]">Location</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Odometer</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24 text-gray-400">
                          No transactions recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((txn) => {
                        const config = ACTION_CONFIG[txn.action];
                        const hasLocation = txn.fromLocation || txn.toLocation;

                        return (
                          <TableRow key={txn.id} className="border-gray-200">
                            <TableCell className="text-sm">
                              <div className="font-medium text-gray-900">{formatDate(txn.createdAt)}</div>
                              <div className="text-xs text-gray-400">{formatTime(txn.createdAt)}</div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`gap-1 text-xs font-medium ${config?.badgeClass ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}
                              >
                                <span className={config?.color}>{config?.icon}</span>
                                {config?.label ?? txn.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-semibold text-sm text-gray-900">
                                {txn.quantity}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {hasLocation ? (
                                <div className="flex items-center gap-1 text-xs">
                                  {txn.fromLocation && (
                                    <span className="flex items-center gap-0.5">
                                      <MapPin className="h-3 w-3 text-gray-400" />
                                      {txn.fromLocation}
                                    </span>
                                  )}
                                  {txn.fromLocation && txn.toLocation && (
                                    <ArrowRight className="h-3 w-3 text-gray-300 mx-0.5" />
                                  )}
                                  {txn.toLocation && (
                                    <span className="font-medium text-gray-900">{txn.toLocation}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              <span className="truncate max-w-[100px] inline-block" title={txn.performedBy}>
                                {txn.performedBy.length > 12
                                  ? txn.performedBy.slice(0, 10) + '…'
                                  : txn.performedBy}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {txn.odometerReading != null ? (
                                <span className="font-mono text-xs">{txn.odometerReading.toLocaleString()} km</span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500 italic truncate max-w-[150px]" title={txn.notes ?? undefined}>
                              {txn.notes || <span className="text-gray-300 not-italic">—</span>}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-gray-500">
                    Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, pagination.total)} of {pagination.total} transactions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 px-2">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNextPage}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
