import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  User,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type TabType = 'home' | 'transactions' | 'budget' | 'reports' | 'profile' | 'admin';

interface BottomTabBarProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenAddModal: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onChangeTab,
  onOpenAddModal,
}) => {
  const { user, platformSkin } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <nav
      id="bottom-tab-bar"
      aria-label="Mobile Navigation"
      className={`w-full bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around z-30 transition-all ${
        platformSkin === 'ios' ? 'pb-2' : 'pb-1'
      }`}
    >
      {/* 1. Home */}
      <button
        onClick={() => onChangeTab('home')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          currentTab === 'home'
            ? 'text-emerald-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className={`w-5 h-5 ${currentTab === 'home' ? 'scale-110' : ''} transition-transform`} />
        <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
      </button>

      {/* 2. Transactions */}
      <button
        onClick={() => onChangeTab('transactions')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          currentTab === 'transactions'
            ? 'text-emerald-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <ArrowLeftRight className={`w-5 h-5 ${currentTab === 'transactions' ? 'scale-110' : ''} transition-transform`} />
        <span className="text-[10px] mt-0.5 tracking-tight">Activity</span>
      </button>

      {/* 3. Floating Quick Plus Button */}
      <div className="flex-1 flex justify-center -mt-5">
        <button
          onClick={onOpenAddModal}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all ring-4 ring-slate-900 focus:outline-none"
          aria-label="Add transaction"
          title="Add Transaction"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Budget */}
      <button
        onClick={() => onChangeTab('budget')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          currentTab === 'budget'
            ? 'text-emerald-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <PieChart className={`w-5 h-5 ${currentTab === 'budget' ? 'scale-110' : ''} transition-transform`} />
        <span className="text-[10px] mt-0.5 tracking-tight">Budget</span>
      </button>

      {/* 5. Reports */}
      <button
        onClick={() => onChangeTab('reports')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          currentTab === 'reports'
            ? 'text-emerald-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BarChart3 className={`w-5 h-5 ${currentTab === 'reports' ? 'scale-110' : ''} transition-transform`} />
        <span className="text-[10px] mt-0.5 tracking-tight">Reports</span>
      </button>

      {/* 6. Admin or Profile */}
      {isAdmin ? (
        <button
          onClick={() => onChangeTab('admin')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'admin'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className={`w-5 h-5 ${currentTab === 'admin' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Admin</span>
        </button>
      ) : (
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'profile'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Profile</span>
        </button>
      )}
    </nav>
  );
};
