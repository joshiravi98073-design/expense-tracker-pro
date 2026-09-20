import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CurrencyCode } from '../types';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [monthlyBudget, setMonthlyBudget] = useState('45000');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Please enter your full name');
          setIsLoading(false);
          return;
        }
        await register({
          email,
          password,
          name: name.trim(),
          currency,
          monthly_budget: parseFloat(monthlyBudget) || 45000,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await login(demoEmail, demoPass);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-5 py-8 max-w-sm mx-auto w-full">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-3 border border-emerald-400/30">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">Expense Tracker Pro</h1>
        <p className="text-xs text-slate-400 mt-1">
          Disciplined budgeting, analytics & native mobile tracking
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div className="grid grid-cols-2 gap-1 bg-slate-800/90 p-1 rounded-2xl border border-slate-700/60 mb-5">
        <button
          type="button"
          onClick={() => {
            setIsLogin(true);
            setError(null);
          }}
          className={`py-2 rounded-xl text-xs font-semibold transition ${
            isLogin ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(false);
            setError(null);
          }}
          className={`py-2 rounded-xl text-xs font-semibold transition ${
            !isLogin ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {!isLogin && (
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={e => setName(e.target.value)}
                required={!isLogin}
                className="w-full bg-slate-800 border border-slate-700/80 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700/80 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-800 border border-slate-700/80 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {!isLogin && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-800 border border-slate-700/80 rounded-2xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
                <option value="JPY">¥ JPY</option>
                <option value="CAD">CA$ CAD</option>
                <option value="AUD">AU$ AUD</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Monthly Budget
              </label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={e => setMonthlyBudget(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700/80 rounded-2xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{isLogin ? 'Sign In to Account' : 'Create My Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Logins Container */}
      <div className="mt-8 pt-5 border-t border-slate-800 text-center">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-2.5">
          One-Tap Instant Demo Access
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('admin@demo.com', 'Admin@123')}
            disabled={isLoading}
            className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl text-left transition group"
          >
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono truncate">
              admin@demo.com
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('user@demo.com', 'User@123')}
            disabled={isLoading}
            className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-left transition group"
          >
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>User Demo</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono truncate">
              user@demo.com
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
