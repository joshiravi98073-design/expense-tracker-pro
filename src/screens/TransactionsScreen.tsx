import React, { useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowUpDown,
  Calendar,
  X,
} from 'lucide-react';
import { Transaction, Category, TransactionFilter } from '../types';
import { TransactionItem } from '../components/TransactionItem';

interface TransactionsScreenProps {
  transactions: Transaction[];
  categories: Category[];
  totalCount: number;
  filter: TransactionFilter;
  onFilterChange: (filter: TransactionFilter) => void;
  onOpenFilterSheet: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  categories,
  totalCount,
  filter,
  onFilterChange,
  onOpenFilterSheet,
  onSelectTransaction,
  onDeleteTransaction,
  onOpenAddModal,
  onRefresh,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState(filter.searchQuery || '');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categoryMap = new Map<string, Category>(categories.map(c => [c.id, c]));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filter, searchQuery });
  };

  const handlePullRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const hasActiveFilters = !!(
    (filter.type && filter.type !== 'all') ||
    (filter.category_id && filter.category_id !== 'all') ||
    filter.startDate ||
    filter.endDate ||
    filter.searchQuery
  );

  return (
    <div className="flex-1 pb-24 px-4 pt-3 space-y-3">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Transactions</h2>
          <span className="text-[11px] text-slate-400">
            {totalCount} total entries
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePullRefresh}
            disabled={isRefreshing || isLoading}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition"
            title="Refresh Transactions"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Search Bar + Filter Trigger */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes, merchants..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onFilterChange({ ...filter, searchQuery: undefined });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <button
          onClick={onOpenFilterSheet}
          className={`p-2.5 rounded-2xl border flex items-center justify-center transition relative ${
            hasActiveFilters
              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
              : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
          }`}
          title="Filter transactions"
        >
          <Filter className="w-4 h-4" />
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 ring-2 ring-slate-900" />
          )}
        </button>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {filter.type && filter.type !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 text-[11px] px-2.5 py-1 rounded-full border border-slate-700">
              Type: <strong className="text-white capitalize">{filter.type}</strong>
              <button
                onClick={() => onFilterChange({ ...filter, type: undefined })}
                className="text-slate-400 hover:text-white ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filter.category_id && filter.category_id !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 text-[11px] px-2.5 py-1 rounded-full border border-slate-700">
              {categoryMap.get(filter.category_id)?.icon} {categoryMap.get(filter.category_id)?.name}
              <button
                onClick={() => onFilterChange({ ...filter, category_id: undefined })}
                className="text-slate-400 hover:text-white ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(filter.startDate || filter.endDate) && (
            <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 text-[11px] px-2.5 py-1 rounded-full border border-slate-700">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{filter.startDate || 'Any'} → {filter.endDate || 'Now'}</span>
              <button
                onClick={() => onFilterChange({ ...filter, startDate: undefined, endDate: undefined })}
                className="text-slate-400 hover:text-white ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={() => onFilterChange({})}
            className="text-[10px] text-emerald-400 hover:underline px-1 py-1 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Swipe gesture help tip */}
      <div className="text-[10px] text-slate-400 text-center py-0.5">
        Tip: Swipe left on any transaction to delete, or tap to view/edit details.
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mb-2 text-emerald-500" />
          <span>Updating records...</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-16 text-center text-slate-500 space-y-3 bg-slate-800/30 rounded-3xl p-6 border border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <ArrowUpDown className="w-6 h-6" />
          </div>
          <p className="text-xs">No transactions match your search or filter.</p>
          <button
            onClick={() => {
              onFilterChange({});
              setSearchQuery('');
            }}
            className="text-xs text-emerald-400 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map(tx => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              category={categoryMap.get(tx.category_id)}
              onSelect={onSelectTransaction}
              onDelete={onDeleteTransaction}
            />
          ))}
        </div>
      )}
    </div>
  );
};
