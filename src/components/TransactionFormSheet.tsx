import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Image, Trash2, Check, AlertCircle } from 'lucide-react';
import { Transaction, Category, TransactionType, CurrencyCode } from '../types';
import { useAuth } from '../context/AuthContext';

interface TransactionFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialData?: Transaction | null;
  onSubmit: (data: Partial<Transaction>) => Promise<void>;
  onAddNewCategoryClick?: () => void;
}

export const TransactionFormSheet: React.FC<TransactionFormSheetProps> = ({
  isOpen,
  onClose,
  categories,
  initialData,
  onSubmit,
  onAddNewCategoryClick,
}) => {
  const { user, currencySymbol } = useAuth();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [receipt, setReceipt] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Sync initialData when editing
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(String(initialData.amount));
      setCategoryId(initialData.category_id);
      setDescription(initialData.description);
      setDate(initialData.date);
      setCurrency(initialData.currency || user?.currency || 'INR');
      setReceipt(initialData.receipt);
    } else {
      setType('expense');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setCurrency(user?.currency || 'INR');
      setReceipt(undefined);
      // Auto-select first matching category
      const defaultCat = categories.find(c => c.type === 'expense' || c.type === 'both');
      setCategoryId(defaultCat ? defaultCat.id : (categories[0]?.id || ''));
    }
    setError(null);
  }, [initialData, isOpen, categories, user?.currency]);

  // Filter categories by type
  const availableCategories = categories.filter(c => c.type === type || c.type === 'both');

  // Handle photo file read
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo exceeds 5MB size limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceipt(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a brief description (e.g. Grocery shopping)');
      return;
    }

    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        amount: num,
        category_id: categoryId,
        description: description.trim(),
        date: date || new Date().toISOString().split('T')[0],
        currency,
        receipt,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full max-w-lg bg-slate-900 border-t border-slate-700/80 rounded-t-[32px] p-5 shadow-2xl z-50 max-h-[90vh] flex flex-col overflow-hidden text-slate-100"
          >
            {/* Drag handle bar */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-3 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">
                {initialData ? 'Edit Transaction' : 'New Transaction'}
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pt-3 pb-2 space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Type toggle: Expense vs Income */}
              <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/50">
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    const firstExp = categories.find(c => c.type === 'expense' || c.type === 'both');
                    if (firstExp) setCategoryId(firstExp.id);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-semibold transition ${
                    type === 'expense'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💸 Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    const firstInc = categories.find(c => c.type === 'income' || c.type === 'both');
                    if (firstInc) setCategoryId(firstInc.id);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-semibold transition ${
                    type === 'income'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💰 Income
                </button>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Amount
                </label>
                <div className="relative rounded-2xl bg-slate-800 border border-slate-700 focus-within:border-emerald-500 transition flex items-center px-4 py-2">
                  <span className="text-xl font-bold text-slate-400 mr-2">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    autoFocus={!initialData}
                    className="w-full bg-transparent text-2xl font-bold text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium text-slate-400">
                    Category
                  </label>
                  {onAddNewCategoryClick && (
                    <button
                      type="button"
                      onClick={onAddNewCategoryClick}
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      + Add Custom
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                  {availableCategories.map(cat => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition ${
                          isSelected
                            ? 'bg-slate-700/90 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-xl mb-0.5">{cat.icon}</span>
                        <span className="text-[10px] font-medium truncate w-full">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Description / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grocery items, Dinner with Alex"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Receipt Photo Attachment (Native Camera / Gallery) */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Receipt Photo (Optional)
                </label>

                {/* Hidden native file inputs */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={galleryInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {receipt ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={receipt}
                        alt="Receipt Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-700"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">Receipt Attached</span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready to upload
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceipt(undefined)}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Remove receipt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs font-medium text-slate-300 transition"
                    >
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Take Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs font-medium text-slate-300 transition"
                    >
                      <Image className="w-4 h-4 text-blue-400" />
                      <span>Choose Gallery</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>{initialData ? 'Update Transaction' : 'Save Transaction'}</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
