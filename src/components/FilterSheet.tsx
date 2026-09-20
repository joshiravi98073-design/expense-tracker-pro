import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw } from 'lucide-react';
import { Category, TransactionFilter } from '../types';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentFilter: TransactionFilter;
  onApplyFilter: (newFilter: TransactionFilter) => void;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  categories,
  currentFilter,
  onApplyFilter,
}) => {
  const [type, setType] = useState<'all' | 'income' | 'expense'>(currentFilter.type || 'all');
  const [categoryId, setCategoryId] = useState<string>(currentFilter.category_id || 'all');
  const [dateRangePreset, setDateRangePreset] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>(currentFilter.startDate || '');
  const [endDate, setEndDate] = useState<string>(currentFilter.endDate || '');

  const applyPreset = (preset: string) => {
    setDateRangePreset(preset);
    const now = new Date();
    if (preset === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(end);
    } else if (preset === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(end);
    } else if (preset === 'last_90') {
      const start = new Date(now.getTime() - 90 * 86400000).toISOString().split('T')[0];
      const end = now.toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(end);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleReset = () => {
    setType('all');
    setCategoryId('all');
    setDateRangePreset('all');
    setStartDate('');
    setEndDate('');
    onApplyFilter({});
    onClose();
  };

  const handleApply = () => {
    onApplyFilter({
      ...currentFilter,
      type: type === 'all' ? undefined : type,
      category_id: categoryId === 'all' ? undefined : categoryId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full max-w-lg bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-5 shadow-2xl z-50 max-h-[85vh] flex flex-col text-slate-100"
          >
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-3 shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Filter Transactions</h3>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 ml-2 font-medium"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-3 space-y-4">
              {/* Type Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60">
                  {(['all', 'expense', 'income'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 rounded-xl text-xs font-semibold capitalize transition ${
                        type === t
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Date Range
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'this_month', label: 'This Month' },
                    { id: 'last_month', label: 'Last Month' },
                    { id: 'last_90', label: 'Last 90 Days' },
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border transition ${
                        dateRangePreset === p.id
                          ? 'bg-slate-700 border-emerald-500 text-emerald-400'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Pickers */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">From Date</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => {
                        setDateRangePreset('custom');
                        setStartDate(e.target.value);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">To Date</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => {
                        setDateRangePreset('custom');
                        setEndDate(e.target.value);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-2">
              <button
                onClick={handleApply}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl shadow-lg transition"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
