import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Globe, User, Tag } from 'lucide-react';
import { Category, CategoryType } from '../types';
import { useAuth } from '../context/AuthContext';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCreateCategory: (cat: { name: string; icon: string; color: string; type: CategoryType; is_global?: boolean }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

const EMOJI_OPTIONS = [
  '🍔', '🛒', '🛍️', '🚗', '🏠', '💡', '🎬', '💊',
  '💼', '💻', '📈', '🎁', '☕', '✈️', '🏋️', '📚',
  '👶', '🐾', '💈', '🍕', '🎮', '🔧', '🎓', '🏥',
];

const COLOR_OPTIONS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
  '#ef4444', '#06b6d4', '#eab308', '#14b8a6', '#6366f1',
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onCreateCategory,
  onDeleteCategory,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏷️');
  const [color, setColor] = useState('#10b981');
  const [type, setType] = useState<CategoryType>('expense');
  const [isGlobal, setIsGlobal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateCategory({
        name: name.trim(),
        icon,
        color,
        type,
        is_global: isAdmin && isGlobal,
      });
      setName('');
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
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
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-50 text-slate-100 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Manage Categories</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {!isAdding ? (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full py-2.5 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Add New Category
                </button>
              ) : (
                <form onSubmit={handleCreate} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">New Category</span>
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Subscriptions, Coffee, Pet care"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Type */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl">
                    {(['expense', 'income', 'both'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`py-1 rounded-lg text-[10px] font-semibold capitalize transition ${
                          type === t ? 'bg-emerald-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Emoji selection */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Pick Icon: {icon}</label>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto bg-slate-900 p-2 rounded-xl">
                      {EMOJI_OPTIONS.map(em => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setIcon(em)}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition ${
                            icon === em ? 'bg-emerald-500/30 ring-1 ring-emerald-400' : 'hover:bg-slate-800'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color selection */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Pick Color</label>
                    <div className="flex items-center gap-2">
                      {COLOR_OPTIONS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-full transition ${
                            color === c ? 'ring-2 ring-white scale-110' : 'opacity-70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Global Category toggle for Admin */}
                  {isAdmin && (
                    <label className="flex items-center gap-2 text-xs text-amber-300 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGlobal}
                        onChange={e => setIsGlobal(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-amber-500"
                      />
                      <span>Make this a Global Category (Visible to all users)</span>
                    </label>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                  >
                    {isSubmitting ? 'Saving...' : 'Create Category'}
                  </button>
                </form>
              )}

              {/* Categories List */}
              <div className="space-y-1.5">
                {categories.map(cat => {
                  const isGlobalCat = cat.user_id === null;
                  const canDelete = isGlobalCat ? isAdmin : true;

                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/50 border border-slate-800 hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm"
                          style={{
                            backgroundColor: `${cat.color}25`,
                            border: `1px solid ${cat.color}40`,
                          }}
                        >
                          {cat.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-200">{cat.name}</span>
                            {isGlobalCat ? (
                              <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <Globe className="w-2.5 h-2.5" /> Global
                              </span>
                            ) : (
                              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <User className="w-2.5 h-2.5" /> Custom
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 capitalize">{cat.type}</span>
                        </div>
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => onDeleteCategory(cat.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
