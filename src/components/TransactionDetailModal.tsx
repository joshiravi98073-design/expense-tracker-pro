import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  Paperclip,
  ZoomIn,
  X,
  User as UserIcon,
} from 'lucide-react';
import { Transaction, Category } from '../types';
import { useAuth } from '../context/AuthContext';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  category,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { currencySymbol } = useAuth();
  const [showFullReceipt, setShowFullReceipt] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!transaction) return null;

  const isIncome = transaction.type === 'income';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-50 text-slate-100 flex flex-col max-h-[85vh]"
          >
            {/* Top Navigation */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-semibold text-slate-200">Transaction Details</h3>
              <button
                onClick={() => {
                  onClose();
                  onEdit(transaction);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-emerald-400 transition"
                title="Edit Transaction"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {/* Big Amount Card */}
              <div className="text-center py-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl">
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-2 flex items-center justify-center text-2xl shadow-sm"
                  style={{
                    backgroundColor: `${category?.color || '#64748b'}25`,
                    border: `1px solid ${category?.color || '#64748b'}40`,
                  }}
                >
                  {category?.icon || '🏷️'}
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                    isIncome ? 'text-emerald-400' : 'text-slate-100'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {currencySymbol}
                  {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-400 mt-1 capitalize font-medium">
                  {transaction.type} • {category?.name || 'General'}
                </div>
              </div>

              {/* Meta Rows */}
              <div className="space-y-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-500" /> Description
                  </span>
                  <span className="font-semibold text-slate-200 text-right max-w-[180px] truncate">
                    {transaction.description}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Date
                  </span>
                  <span className="font-medium text-slate-200">{transaction.date}</span>
                </div>

                {transaction.user_name && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-slate-500" /> Created By
                    </span>
                    <span className="font-medium text-slate-200">{transaction.user_name}</span>
                  </div>
                )}
              </div>

              {/* Receipt photo preview */}
              {transaction.receipt && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-400" /> Attached Receipt
                    </span>
                    <button
                      onClick={() => setShowFullReceipt(true)}
                      className="text-[11px] text-emerald-400 flex items-center gap-1 hover:underline"
                    >
                      <ZoomIn className="w-3 h-3" /> View Full
                    </button>
                  </div>
                  <div
                    onClick={() => setShowFullReceipt(true)}
                    className="relative rounded-2xl overflow-hidden border border-slate-700/80 cursor-pointer group"
                  >
                    <img
                      src={transaction.receipt}
                      alt="Receipt Attachment"
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                      Tap to zoom
                    </div>
                  </div>
                </div>
              )}

              {/* Delete with confirmation */}
              <div className="pt-2">
                {isConfirmingDelete ? (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2">
                    <p className="text-xs text-rose-300 text-center font-medium">
                      Are you sure you want to delete this transaction?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setIsConfirmingDelete(false)}
                        className="py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onDelete(transaction.id);
                          onClose();
                        }}
                        className="py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="w-full py-3 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 border border-rose-600/20 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Transaction</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Full-screen Receipt Zoom Overlay */}
          <AnimatePresence>
            {showFullReceipt && transaction.receipt && (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
                <button
                  onClick={() => setShowFullReceipt(false)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={transaction.receipt}
                  alt="Full receipt"
                  className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
