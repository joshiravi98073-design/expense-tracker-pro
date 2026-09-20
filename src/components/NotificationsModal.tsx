import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, AlertTriangle, AlertOctagon, Info, CheckCircle2, Trash2, CheckCheck } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
}) => {
  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'danger':
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
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
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-50 text-slate-100 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Notifications</h3>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some(n => !n.is_read) && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium mr-1"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Read All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="p-3 overflow-y-auto flex-1 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No notifications yet. You're all caught up!
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-2xl border transition flex items-start justify-between gap-2.5 ${
                      n.is_read
                        ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className="p-1.5 rounded-xl bg-slate-900 shrink-0 mt-0.5">
                        {getIcon(n.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {new Date(n.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!n.is_read && (
                        <button
                          onClick={() => onMarkRead(n.id)}
                          className="p-1 text-slate-400 hover:text-emerald-400 transition"
                          title="Mark read"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(n.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
