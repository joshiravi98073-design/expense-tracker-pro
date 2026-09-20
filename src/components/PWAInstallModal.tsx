import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, PlusSquare, Smartphone, Check } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        onClose();
      }
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
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-50 text-slate-100 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Install Mobile App</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* App Icon preview */}
              <div className="text-center">
                <img
                  src="/icon.svg"
                  alt="Expense Tracker Pro"
                  className="w-16 h-16 rounded-2xl mx-auto shadow-lg shadow-emerald-500/20 mb-2 border border-slate-700"
                />
                <h4 className="font-bold text-base text-slate-100">Expense Tracker Pro</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Install onto your iOS or Android home screen for native offline speed and full-screen experience.
                </p>
              </div>

              {isInstalled ? (
                <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>App is already installed on this device!</span>
                </div>
              ) : deferredPrompt ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Install to Device</span>
                </button>
              ) : isIOS ? (
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-xs space-y-2.5 text-slate-300">
                  <span className="font-semibold text-white block">Instructions for iPhone / iPad:</span>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Share2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>1. Tap Safari's <strong>Share</strong> button at bottom</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <PlusSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2. Scroll down and tap <strong>Add to Home Screen</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>3. Open directly from your home screen like a native app!</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
                  <span className="font-semibold text-white block">Installation on Android & Browsers:</span>
                  <p>
                    1. Tap the browser menu (three dots in Chrome).<br />
                    2. Select <strong>Add to Home screen</strong> or <strong>Install app</strong>.
                  </p>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
