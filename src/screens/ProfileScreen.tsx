import React, { useState } from 'react';
import {
  User,
  LogOut,
  Moon,
  Sun,
  Smartphone,
  Tag,
  DollarSign,
  Download,
  ShieldCheck,
  Check,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CurrencyCode } from '../types';

interface ProfileScreenProps {
  onOpenCategoryManager: () => void;
  onOpenPWAInstall: () => void;
}

const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'AU$' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenCategoryManager,
  onOpenPWAInstall,
}) => {
  const {
    user,
    logout,
    updateProfile,
    theme,
    toggleTheme,
    platformSkin,
    togglePlatformSkin,
    currencySymbol,
    login,
  } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState<CurrencyCode>(user?.currency || 'INR');
  const [monthlyBudget, setMonthlyBudget] = useState(String(user?.monthly_budget || 45000));
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSwitchingUser, setIsSwitchingUser] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        currency,
        monthly_budget: parseFloat(monthlyBudget) || 45000,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchAccount = async (email: string, pass: string) => {
    setIsSwitchingUser(true);
    try {
      await login(email, pass);
    } finally {
      setIsSwitchingUser(false);
    }
  };

  return (
    <div className="flex-1 pb-24 px-4 pt-3 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100">Settings & Profile</h2>
        <span className="text-[11px] text-slate-400">
          Preferences, theme, device configuration & security
        </span>
      </div>

      {/* User Info Card */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-4 flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-bold text-xl shadow-md">
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100 truncate">{user?.name}</h3>
            {user?.role === 'admin' && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-200">Account Details</h4>

        {saveSuccess && (
          <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Profile saved successfully!</span>
          </div>
        )}

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Currency selection */}
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Default Currency</label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value as CurrencyCode)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.label} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Monthly Budget */}
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">
            Monthly Target Budget ({currencySymbol})
          </label>
          <input
            type="number"
            value={monthlyBudget}
            onChange={e => setMonthlyBudget(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
        >
          {isSaving ? 'Saving Changes...' : 'Update Preferences'}
        </button>
      </form>

      {/* Preferences & Tools Section */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-4 space-y-2">
        <h4 className="text-xs font-bold text-slate-200 mb-1">Preferences & Tools</h4>

        {/* Category Manager */}
        <button
          onClick={onOpenCategoryManager}
          className="w-full p-3 bg-slate-800/70 hover:bg-slate-700/80 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs text-slate-200 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Tag className="w-4 h-4" />
            </div>
            <span>Manage Categories</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Theme mode toggle */}
        <button
          onClick={toggleTheme}
          className="w-full p-3 bg-slate-800/70 hover:bg-slate-700/80 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs text-slate-200 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <span>Theme Mode</span>
          </div>
          <span className="text-[11px] text-slate-400 capitalize">{theme} Mode</span>
        </button>

        {/* Platform Skin Simulator Toggle */}
        <button
          onClick={togglePlatformSkin}
          className="w-full p-3 bg-slate-800/70 hover:bg-slate-700/80 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs text-slate-200 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <span>Platform Frame Simulation</span>
          </div>
          <span className="text-[11px] text-slate-400 uppercase font-mono">{platformSkin}</span>
        </button>

        {/* PWA Install */}
        <button
          onClick={onOpenPWAInstall}
          className="w-full p-3 bg-slate-800/70 hover:bg-slate-700/80 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs text-slate-200 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Download className="w-4 h-4" />
            </div>
            <span>Install to iOS / Android Home Screen</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Demo Quick Switcher */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-4 space-y-2">
        <h4 className="text-xs font-bold text-slate-300">Quick Demo Account Switch</h4>
        <p className="text-[10px] text-slate-400">
          Switch between the seeded Admin and regular User roles for testing:
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => handleSwitchAccount('admin@demo.com', 'Admin@123')}
            disabled={isSwitchingUser}
            className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition ${
              user?.email === 'admin@demo.com'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Switch to Admin
          </button>

          <button
            onClick={() => handleSwitchAccount('user@demo.com', 'User@123')}
            disabled={isSwitchingUser}
            className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition ${
              user?.email === 'user@demo.com'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Switch to User
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full py-3 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-600/20 text-rose-400 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
