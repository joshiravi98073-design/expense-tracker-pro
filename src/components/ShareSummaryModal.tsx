import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Copy, Check, Download, FileSpreadsheet, Sparkles } from 'lucide-react';
import { DashboardSummary, Category, Transaction } from '../types';
import { useAuth } from '../context/AuthContext';
import { exportTransactionsToCSV } from '../lib/api';

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DashboardSummary | null;
  transactions: Transaction[];
  categories: Category[];
}

export const ShareSummaryModal: React.FC<ShareSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  transactions,
  categories,
}) => {
  const { user, currencySymbol } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const netSavings = summary.income_this_month - summary.expense_this_month;
  const savingsRate = summary.income_this_month > 0
    ? Math.max(0, Math.round((netSavings / summary.income_this_month) * 100))
    : 0;

  const summaryText = `📊 Financial Summary for ${monthName}
👤 User: ${user?.name || 'Demo User'}
━━━━━━━━━━━━━━━━━━━━
💰 Total Income: ${currencySymbol}${summary.income_this_month.toLocaleString()}
💸 Total Expenses: ${currencySymbol}${summary.expense_this_month.toLocaleString()}
🎯 Monthly Budget: ${currencySymbol}${summary.monthly_budget.toLocaleString()} (${summary.budget_spent_percent}% utilized)
🌱 Net Savings: ${currencySymbol}${netSavings.toLocaleString()} (${savingsRate}% savings rate)

🏷️ Top Spending Categories:
${summary.category_breakdown
  .slice(0, 3)
  .map(c => `• ${c.icon} ${c.category_name}: ${currencySymbol}${c.amount.toLocaleString()} (${c.percentage}%)`)
  .join('\n')}

Generated with Expense Tracker Pro.`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Expense Tracker Pro — ${monthName} Summary`,
          text: summaryText,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCSV = () => {
    exportTransactionsToCSV(transactions, categories, currencySymbol);
  };

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
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-50 text-slate-100 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Share Summary</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Card */}
            <div className="p-5 space-y-4">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner max-h-56 overflow-y-auto">
                {summaryText}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleNativeShare}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-[0.98]"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share via Native Sheet (WhatsApp, Mail, etc.)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopy}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadCSV}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
