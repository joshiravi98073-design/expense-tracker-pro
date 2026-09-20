import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Target, AlertTriangle, CheckCircle2, Edit3, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface BudgetHistoryItem {
  month: number;
  year: number;
  monthName: string;
  budget: number;
  spent: number;
  percentage: number;
}

interface BudgetScreenProps {
  currentBudget: number;
  currentSpend: number;
  history: BudgetHistoryItem[];
  onBudgetUpdated: () => void;
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({
  currentBudget,
  currentSpend,
  history,
  onBudgetUpdated,
}) => {
  const { currencySymbol, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(currentBudget || 45000));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const spentPercent = currentBudget > 0 ? Math.round((currentSpend / currentBudget) * 100) : 0;
  const remaining = currentBudget - currentSpend;
  const isWarning = spentPercent >= 75 && spentPercent < 100;
  const isExceeded = spentPercent >= 100;

  // Days left in current month
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate());
  const dailyAllowance = remaining > 0 ? Math.round(remaining / daysRemaining) : 0;

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(budgetInput);
    if (isNaN(num) || num <= 0) return;

    setIsSaving(true);
    try {
      await api.setBudget(num);
      await updateProfile({ monthly_budget: num });
      onBudgetUpdated();
      setIsEditing(false);
      setMessage('Budget updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update budget:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Monthly Budget</h2>
          <span className="text-[11px] text-slate-400">
            Keep your spending disciplined and on target
          </span>
        </div>
        <button
          onClick={() => {
            setBudgetInput(String(currentBudget));
            setIsEditing(!isEditing);
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel' : 'Edit Target'}</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Edit Budget Form */}
      {isEditing && (
        <form onSubmit={handleSaveBudget} className="bg-slate-800 p-4 rounded-3xl border border-slate-700 space-y-3">
          <span className="text-xs font-bold text-slate-100 block">Set Monthly Target</span>
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-2xl px-3 py-2">
            <span className="text-lg font-bold text-slate-400 mr-2">{currencySymbol}</span>
            <input
              type="number"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              required
              autoFocus
              className="w-full bg-transparent text-xl font-bold text-slate-100 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
            >
              {isSaving ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      )}

      {/* Main Budget Health Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/70 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-200">Current Month Target</span>
              <span className="text-[10px] text-slate-400 block">{daysRemaining} days remaining in cycle</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-white">
              {currencySymbol}{currentBudget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(spentPercent, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isExceeded
                  ? 'bg-rose-500 shadow-rose-500/50 shadow-sm'
                  : isWarning
                  ? 'bg-amber-500 shadow-amber-500/50 shadow-sm'
                  : 'bg-emerald-500 shadow-emerald-500/50 shadow-sm'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Spent: {currencySymbol}{currentSpend.toLocaleString()}</span>
            <span
              className={
                isExceeded ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
              }
            >
              {spentPercent}% Utilized
            </span>
          </div>
        </div>

        {/* Warning / Health state banner */}
        {isExceeded ? (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>You have exceeded your allocated budget by {currencySymbol}{Math.abs(remaining).toLocaleString()}.</span>
          </div>
        ) : isWarning ? (
          <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Careful! You've used {spentPercent}% of your monthly budget.</span>
          </div>
        ) : (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Great pace! You are within your budget allowance for this month.</span>
          </div>
        )}

        {/* Daily Spend Guideline */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-center">
          <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Remaining Budget</span>
            <span className={`text-sm font-bold ${remaining < 0 ? 'text-rose-400' : 'text-slate-100'}`}>
              {currencySymbol}{remaining.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Daily Allowance</span>
            <span className="text-sm font-bold text-emerald-400">
              {currencySymbol}{dailyAllowance.toLocaleString()}/day
            </span>
          </div>
        </div>
      </div>

      {/* Past Months Budget History */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Past Months Performance</span>
        </h3>

        {history.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No past budget records found.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(item => {
              const itemOver = item.spent > item.budget;
              return (
                <div
                  key={`${item.year}-${item.month}`}
                  className="bg-slate-800/70 p-3 rounded-2xl border border-slate-700/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.monthName}</span>
                    <span className="font-mono text-slate-300">
                      {currencySymbol}{item.spent.toLocaleString()} / {currencySymbol}{item.budget.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        itemOver ? 'bg-rose-500' : item.percentage >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Status: {itemOver ? 'Over Budget' : 'Within Budget'}</span>
                    <span className={itemOver ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
