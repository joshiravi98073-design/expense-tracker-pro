import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      className="bg-amber-600/95 text-white px-3 py-1.5 text-xs font-medium flex items-center justify-between shadow-md backdrop-blur-sm z-50 sticky top-0"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-3.5 h-3.5 animate-pulse" />
        <span>Offline Mode — Using local cached data</span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[11px] font-semibold transition"
      >
        <RefreshCw className="w-3 h-3" />
        Retry
      </button>
    </div>
  );
};
