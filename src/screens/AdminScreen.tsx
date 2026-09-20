import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Tag,
  Activity,
  UserCheck,
  UserX,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { AdminStats, User as UserType, Transaction, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { TransactionItem } from '../components/TransactionItem';

interface AdminScreenProps {
  stats: AdminStats | null;
  users: UserType[];
  allTransactions: Transaction[];
  categories: Category[];
  onToggleUserStatus: (userId: string, currentActive: boolean) => Promise<void>;
  onChangeUserRole: (userId: string, newRole: 'admin' | 'user') => Promise<void>;
  onOpenCategoryManager: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onRefresh: () => Promise<void>;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  stats,
  users,
  allTransactions,
  categories,
  onToggleUserStatus,
  onChangeUserRole,
  onOpenCategoryManager,
  onSelectTransaction,
  onDeleteTransaction,
  onRefresh,
}) => {
  const { user: currentAdmin, currencySymbol } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Admin Control Center</h2>
          </div>
          <span className="text-[11px] text-slate-400">
            System management, RBAC, users & global audit
          </span>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          title="Refresh Admin Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60">
        {(['overview', 'users', 'transactions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 rounded-xl text-xs font-semibold capitalize transition ${
              activeTab === tab
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & SYSTEM STATS */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-3xl p-4 space-y-1">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-slate-400 block pt-1">Registered Users</span>
              <span className="text-xl font-bold text-slate-100">
                {stats?.total_users ?? users.length}
              </span>
              <span className="text-[10px] text-emerald-400 block">
                {stats?.active_users ?? users.filter(u => u.is_active).length} Active
              </span>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 rounded-3xl p-4 space-y-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-slate-400 block pt-1">Total Transactions</span>
              <span className="text-xl font-bold text-slate-100">
                {stats?.total_transactions ?? allTransactions.length}
              </span>
              <span className="text-[10px] text-slate-400 block">Logged System-wide</span>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 rounded-3xl p-4 space-y-1">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-slate-400 block pt-1">Total Volume</span>
              <span className="text-sm font-bold text-teal-400 truncate block">
                {currencySymbol}{stats?.total_volume.toLocaleString() ?? '0'}
              </span>
              <span className="text-[10px] text-slate-400 block">Income + Expenses</span>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 rounded-3xl p-4 space-y-1">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-slate-400 block pt-1">Total Categories</span>
              <span className="text-xl font-bold text-slate-100">
                {stats?.total_categories ?? categories.length}
              </span>
              <span className="text-[10px] text-amber-300 block">Global + Custom</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-200">Global Category Management</h4>
            <p className="text-[11px] text-slate-400">
              Create, edit, or delete global categories available to all registered users.
            </p>
            <button
              onClick={onOpenCategoryManager}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Manage Global Categories</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>User Accounts ({users.length})</span>
            <span className="text-[10px]">Tap toggles to manage status & roles</span>
          </div>

          <div className="space-y-2">
            {users.map(u => {
              const isSelf = u.id === currentAdmin?.id;
              return (
                <div
                  key={u.id}
                  className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-sm shrink-0">
                        {u.name[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-200 truncate">{u.name}</h4>
                          {u.role === 'admin' && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full">
                              Admin
                            </span>
                          )}
                          {isSelf && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block">{u.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          u.is_active
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>

                  {/* Actions row */}
                  {!isSelf && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
                      {/* Toggle status */}
                      <button
                        onClick={() => onToggleUserStatus(u.id, u.is_active)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition ${
                          u.is_active
                            ? 'bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 border border-rose-600/30'
                            : 'bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-600/30'
                        }`}
                      >
                        {u.is_active ? (
                          <>
                            <UserX className="w-3.5 h-3.5" /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" /> Activate
                          </>
                        )}
                      </button>

                      {/* Toggle role */}
                      <button
                        onClick={() =>
                          onChangeUserRole(u.id, u.role === 'admin' ? 'user' : 'admin')
                        }
                        className="py-1.5 px-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>{u.role === 'admin' ? 'Demote to User' : 'Make Admin'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM-WIDE TRANSACTIONS AUDIT */}
      {activeTab === 'transactions' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Global Transactions ({allTransactions.length})</span>
            <span className="text-[10px]">All users combined</span>
          </div>

          {allTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No transactions recorded in the system yet.
            </div>
          ) : (
            <div className="space-y-1">
              {allTransactions.map(tx => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  category={categoryMap.get(tx.category_id)}
                  onSelect={onSelectTransaction}
                  onDelete={onDeleteTransaction}
                  showUserBadge
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
