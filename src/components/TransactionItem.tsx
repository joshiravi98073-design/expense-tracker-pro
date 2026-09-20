import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Trash2, Paperclip, ChevronRight } from 'lucide-react';
import { Transaction, Category } from '../types';
import { useAuth } from '../context/AuthContext';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onSelect: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  showUserBadge?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  category,
  onSelect,
  onDelete,
  showUserBadge = false,
}) => {
  const { currencySymbol } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const x = useMotionValue(0);

  // Background trash color opacity scales as user swipes left
  const trashOpacity = useTransform(x, [-100, -30, 0], [1, 0.5, 0]);
  const trashScale = useTransform(x, [-100, -40, 0], [1.1, 0.9, 0.5]);

  const handleDragEnd = (_: any, info: any) => {
    // If swiped left beyond -85px, trigger delete with confirmation
    if (info.offset.x < -85) {
      setIsDeleting(true);
      setTimeout(() => {
        onDelete(transaction.id);
      }, 200);
    }
  };

  const isIncome = transaction.type === 'income';
  const categoryIcon = category?.icon || '🏷️';
  const categoryColor = category?.color || '#64748b';

  return (
    <div className="relative overflow-hidden my-1 rounded-2xl bg-slate-900/40">
      {/* Background action revealing on swipe left */}
      <motion.div
        style={{ opacity: trashOpacity }}
        className="absolute inset-0 bg-rose-600/90 rounded-2xl flex items-center justify-end px-5 z-0"
      >
        <motion.div style={{ scale: trashScale }} className="flex items-center gap-1 text-white font-medium text-xs">
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </motion.div>
      </motion.div>

      {/* Foreground swipable row */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        animate={isDeleting ? { x: -300, opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        onClick={() => onSelect(transaction)}
        className="relative z-10 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 active:bg-slate-700/60 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Category Icon Badge */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm"
            style={{ backgroundColor: `${categoryColor}25`, border: `1px solid ${categoryColor}40` }}
          >
            {categoryIcon}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold text-slate-100 truncate">
                {transaction.description}
              </h4>
              {transaction.receipt && (
                <Paperclip className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Receipt attached" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span>{category?.name || 'General'}</span>
              <span>•</span>
              <span>{transaction.date}</span>
              {showUserBadge && transaction.user_name && (
                <>
                  <span>•</span>
                  <span className="text-[10px] bg-slate-700/80 text-slate-300 px-1.5 py-0.2 rounded">
                    {transaction.user_name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Amount & chevron */}
        <div className="flex items-center gap-1.5 shrink-0 ml-3">
          <div className="text-right">
            <span
              className={`font-semibold text-sm sm:text-base ${
                isIncome ? 'text-emerald-400' : 'text-slate-100'
              }`}
            >
              {isIncome ? '+' : '-'}
              {currencySymbol}
              {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </motion.div>
    </div>
  );
};
