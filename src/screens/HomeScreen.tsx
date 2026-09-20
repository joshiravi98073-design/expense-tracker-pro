import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Share2,
  Receipt,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { DashboardSummary, Transaction, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { TransactionItem } from '../components/TransactionItem';

interface HomeScreenProps {
  summary: DashboardSummary | null;
  categories: Category[];
  onOpenAddModal: (type?: 'expense' | 'income') => void;
  onOpenShareModal: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onViewAllTransactions: () => void;
  onRefresh: () => Promise<void>;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  summary,
  categories,
  onOpenAddModal,
  onOpenShareModal,
  onSelectTransaction,
  onDeleteTransaction,
  onViewAllTransactions,
  onRefresh,
}) => {
  const { user, currencySymbol } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePullRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (!summary) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-500 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-500" />
        Loading your finances...
      </div>
    );
  }

  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const isBudgetWarning = summary.budget_spent_percent >= 75 && summary.budget_spent_percent < 100;
  const isBudgetExceeded = summary.budget_spent_percent >= 100;

  // Chart data calculations
  const maxTrendVal = Math.max(
    ...summary.monthly_trends.map(t => Math.max(t.income, t.expense)),
    1000
  );

  return (
    <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
      {/* Top Greeting & Pull to Refresh indicator */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">
            Welcome back,
          </span>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
            {user?.name || 'Demo User'}
            {user?.role === 'admin' && (
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-normal">
                Admin
              </span>
            )}
          </h2>
        </div>

        <button
          onClick={handlePullRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition"
          title="Pull to Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-slate-800 via-slate-800/90 to-slate-900 border border-slate-700/60 shadow-xl">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium tracking-wide">Total Balance</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 hover:text-slate-200 transition"
              title={showBalance ? 'Hide Balance' : 'Show Balance'}
            >
              {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {showBalance ? (
                <>
                  {currencySymbol}
                  {summary.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </>
              ) : (
                '••••••••'
              )}
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-5 pt-3 border-t border-slate-700/50">
            <button
              onClick={() => onOpenAddModal('expense')}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-700/40 hover:bg-slate-700/70 border border-slate-600/30 transition text-slate-200 active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium">Expense</span>
            </button>

            <button
              onClick={() => onOpenAddModal('income')}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-700/40 hover:bg-slate-700/70 border border-slate-600/30 transition text-slate-200 active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium">Income</span>
            </button>

            <button
              onClick={onOpenShareModal}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-700/40 hover:bg-slate-700/70 border border-slate-600/30 transition text-slate-200 active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium">Share</span>
            </button>

            <button
              onClick={() => onOpenAddModal('expense')}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-700/40 hover:bg-slate-700/70 border border-slate-600/30 transition text-slate-200 active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium">Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Income vs Expense monthly pills */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block">This Month Income</span>
            <span className="text-sm font-bold text-emerald-400 truncate block">
              +{currencySymbol}{summary.income_this_month.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block">This Month Spend</span>
            <span className="text-sm font-bold text-rose-400 truncate block">
              -{currencySymbol}{summary.expense_this_month.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Budget Progress Alert Card */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-200">Monthly Budget</span>
            {isBudgetExceeded ? (
              <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.2 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> 100%+ Exceeded
              </span>
            ) : isBudgetWarning ? (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> 75%+ Warning
              </span>
            ) : null}
          </div>
          <span className="text-slate-400 font-mono">
            {currencySymbol}{summary.expense_this_month.toLocaleString()} / {currencySymbol}{summary.monthly_budget.toLocaleString()}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(summary.budget_spent_percent, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isBudgetExceeded
                ? 'bg-rose-500'
                : isBudgetWarning
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{summary.budget_spent_percent}% utilized</span>
          <span>
            {summary.monthly_budget > summary.expense_this_month
              ? `${currencySymbol}${(summary.monthly_budget - summary.expense_this_month).toLocaleString()} remaining`
              : `${currencySymbol}${(summary.expense_this_month - summary.monthly_budget).toLocaleString()} over budget`}
          </span>
        </div>
      </div>

      {/* Category Breakdown (Pie / Donut Representation) */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
        <h3 className="text-xs font-bold text-slate-200 mb-3">Spending by Category</h3>

        {summary.category_breakdown.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No expense transactions logged this month yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {summary.category_breakdown.slice(0, 4).map(item => (
              <div key={item.category_id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="font-medium text-slate-200">{item.category_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-200">
                      {currencySymbol}{item.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color || '#10b981',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Income vs Expense Monthly Trend Bar Chart */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-200">Recent Months Trend</h3>
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Income
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Expense
            </div>
          </div>
        </div>

        {/* Bar chart container */}
        <div className="h-28 flex items-end justify-between gap-2 pt-4">
          {summary.monthly_trends.map(t => {
            const incHeight = maxTrendVal > 0 ? (t.income / maxTrendVal) * 80 : 0;
            const expHeight = maxTrendVal > 0 ? (t.expense / maxTrendVal) * 80 : 0;

            return (
              <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1 h-20">
                  {/* Income bar */}
                  <div
                    style={{ height: `${Math.max(incHeight, 4)}px` }}
                    className="w-2.5 sm:w-3 bg-emerald-500/90 rounded-t-sm transition-all"
                    title={`Income: ${currencySymbol}${t.income}`}
                  />
                  {/* Expense bar */}
                  <div
                    style={{ height: `${Math.max(expHeight, 4)}px` }}
                    className="w-2.5 sm:w-3 bg-rose-500/90 rounded-t-sm transition-all"
                    title={`Expense: ${currencySymbol}${t.expense}`}
                  />
                </div>
                <span className="text-[9px] text-slate-400 font-mono">{t.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200">Recent Transactions</h3>
          <button
            onClick={onViewAllTransactions}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {summary.recent_transactions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-800/40 rounded-2xl">
            No transactions yet. Tap the '+' button below to add your first one!
          </div>
        ) : (
          <div className="space-y-1">
            {summary.recent_transactions.map(tx => (
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
    </div>
  );
};
