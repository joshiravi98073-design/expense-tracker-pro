import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  Calendar,
  Share2,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
} from 'lucide-react';
import { Transaction, Category, DashboardSummary } from '../types';
import { useAuth } from '../context/AuthContext';
import { exportTransactionsToCSV } from '../lib/api';

interface ReportsScreenProps {
  summary: DashboardSummary | null;
  transactions: Transaction[];
  categories: Category[];
  onOpenShareModal: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  summary,
  transactions,
  categories,
  onOpenShareModal,
}) => {
  const { currencySymbol } = useAuth();
  const [reportPeriod, setReportPeriod] = useState<'month' | 'year' | 'all'>('month');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Filter transactions based on active period
  const filteredTx = transactions.filter(t => {
    const d = new Date(t.date);
    if (reportPeriod === 'month') {
      return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
    }
    if (reportPeriod === 'year') {
      return d.getFullYear() === currentYear;
    }
    return true;
  });

  const totalIncome = filteredTx
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = filteredTx
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  // Category breakdown for filtered period
  const catMap = new Map<string, number>();
  filteredTx
    .filter(t => t.type === 'expense')
    .forEach(t => {
      catMap.set(t.category_id, (catMap.get(t.category_id) || 0) + t.amount);
    });

  const categoryAnalysis = Array.from(catMap.entries())
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: cat ? cat.name : 'Other',
        icon: cat ? cat.icon : '🏷️',
        color: cat ? cat.color : '#64748b',
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTx, categories, currencySymbol);
  };

  return (
    <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Financial Reports</h2>
          <span className="text-[11px] text-slate-400">
            Insights, analytics & visual breakdowns
          </span>
        </div>

        {/* Export & Share buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportCSV}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </button>
          <button
            onClick={onOpenShareModal}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
            title="Share Financial Summary"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60">
        {(['month', 'year', 'all'] as const).map(p => (
          <button
            key={p}
            onClick={() => setReportPeriod(p)}
            className={`py-2 rounded-xl text-xs font-semibold capitalize transition ${
              reportPeriod === p
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {p === 'month' ? 'This Month' : p === 'year' ? 'This Year' : 'All Time'}
          </button>
        ))}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Income</span>
          <span className="text-xs sm:text-sm font-bold text-emerald-400 truncate block">
            +{currencySymbol}{totalIncome.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Expense</span>
          <span className="text-xs sm:text-sm font-bold text-rose-400 truncate block">
            -{currencySymbol}{totalExpense.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Net Savings</span>
          <span
            className={`text-xs sm:text-sm font-bold truncate block ${
              netSavings >= 0 ? 'text-teal-400' : 'text-rose-400'
            }`}
          >
            {currencySymbol}{netSavings.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Savings Rate Card */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-800 to-slate-900 border border-emerald-900/50 rounded-3xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Savings Efficiency</span>
            <span className="text-[10px] text-slate-400">Portion of earnings retained</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-emerald-400">{savingsRate}%</span>
        </div>
      </div>

      {/* Category Breakdown Analysis */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-emerald-400" />
          <span>Category Spending Analysis</span>
        </h3>

        {categoryAnalysis.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No expenses recorded for this time period.
          </div>
        ) : (
          <div className="space-y-3">
            {categoryAnalysis.map(item => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-semibold text-slate-200">{item.name}</span>
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
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
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

      {/* Export / Share Banner */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-4 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-200">Need to export records?</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Download your transactions as a spreadsheet CSV file.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>CSV Export</span>
        </button>
      </div>
    </div>
  );
};
