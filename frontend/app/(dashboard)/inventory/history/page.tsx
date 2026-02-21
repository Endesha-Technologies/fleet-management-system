'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_INVENTORY_TRANSACTIONS } from '@/constants/inventory';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Download, Calendar, Package, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { FormInput, FormSelect, FormDateInput } from '@/components/ui/form';

export default function InventoryHistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Filter transactions
  const filteredTransactions = MOCK_INVENTORY_TRANSACTIONS.filter(transaction => {
    const matchesSearch =
      searchQuery === '' ||
      transaction.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.partNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || transaction.transactionType === typeFilter;

    return matchesSearch && matchesType;
  });

  // Calculate summary stats
  const stats = {
    total: filteredTransactions.length,
    added: filteredTransactions.filter(t => t.transactionType === 'Added').length,
    sold: filteredTransactions.filter(t => t.transactionType === 'Sold').length,
    disposed: filteredTransactions.filter(t => t.transactionType === 'Disposed').length,
    used: filteredTransactions.filter(t => t.transactionType === 'Used').length,
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Added':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'Sold':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'Disposed':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'Used':
        return <Activity className="h-4 w-4 text-purple-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'Added':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sold':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Disposed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Used':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className=" mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Transaction History</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{stats.total} transactions</p>
            </div>
          </div>
          <Button variant="outline" className="shrink-0">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Total</div>
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
            <div className="text-xs sm:text-sm text-blue-700 mb-1">Added</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-900">{stats.added}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
            <div className="text-xs sm:text-sm text-green-700 mb-1">Sold</div>
            <div className="text-xl sm:text-2xl font-bold text-green-900">{stats.sold}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-200">
            <div className="text-xs sm:text-sm text-red-700 mb-1">Disposed</div>
            <div className="text-xl sm:text-2xl font-bold text-red-900">{stats.disposed}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-200">
            <div className="text-xs sm:text-sm text-purple-700 mb-1">Used</div>
            <div className="text-xl sm:text-2xl font-bold text-purple-900">{stats.used}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <FormInput
                  type="text"
                  placeholder="Search parts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <FormSelect
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'Added', label: 'Added' },
                { value: 'Sold', label: 'Sold' },
                { value: 'Disposed', label: 'Disposed' },
                { value: 'Used', label: 'Used' },
              ]}
            />

            <div className="sm:col-span-2 lg:col-span-2">
              <div className="grid grid-cols-2 gap-2">
                <FormDateInput
                  placeholder="From"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
                <FormDateInput
                  placeholder="To"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Part
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(transaction.transactionDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{transaction.partName}</div>
                      <div className="text-gray-500 text-xs">{transaction.partNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getTransactionColor(transaction.transactionType)}`}>
                        {getTransactionIcon(transaction.transactionType)}
                        {transaction.transactionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.saleAmount ? formatCurrency(transaction.saleAmount) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.performedBy}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">{transaction.partName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{transaction.partNumber}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border shrink-0 ml-2 ${getTransactionColor(transaction.transactionType)}`}>
                  {getTransactionIcon(transaction.transactionType)}
                  {transaction.transactionType}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block mb-1">Date</span>
                  <span className="font-medium text-gray-900">{formatDate(transaction.transactionDate)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Quantity</span>
                  <span className="font-medium text-gray-900">{transaction.quantity}</span>
                </div>
                {transaction.saleAmount && (
                  <div>
                    <span className="text-gray-500 block mb-1">Amount</span>
                    <span className="font-medium text-gray-900">{formatCurrency(transaction.saleAmount)}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 block mb-1">Performed By</span>
                  <span className="font-medium text-gray-900">{transaction.performedBy}</span>
                </div>
              </div>

              {/* Notes */}
              {transaction.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-600">{transaction.notes}</p>
                </div>
              )}
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
