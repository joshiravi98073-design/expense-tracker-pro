import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, CurrencyCode, ThemeMode, UserRole } from '../types';
import { api, getStoredToken, getStoredUser, clearStoredAuth, getCurrencySymbol } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currencySymbol: string;
  themeMode: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  theme: 'light' | 'dark';
  isMobileFrame: boolean;
  platformSkin: 'ios' | 'android';
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setIsMobileFrame: (val: boolean) => void;
  setPlatformSkin: (skin: 'ios' | 'android') => void;
  togglePlatformSkin: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; currency?: CurrencyCode; monthly_budget?: number }) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('etp_theme') as ThemeMode) || (user?.theme || 'system');
  });
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(() => {
    const saved = localStorage.getItem('etp_mobile_frame');
    // On desktop screens, default to realistic mobile chassis frame for true mobile app presentation
    return saved !== null ? saved === 'true' : true;
  });
  const [platformSkin, setPlatformSkin] = useState<'ios' | 'android'>(() => {
    return (localStorage.getItem('etp_platform_skin') as 'ios' | 'android') || 'ios';
  });

  // Listen to system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const effectiveTheme = useMemo<'light' | 'dark'>(() => {
    if (themeMode === 'light') return 'light';
    if (themeMode === 'dark') return 'dark';
    return systemIsDark ? 'dark' : 'light';
  }, [themeMode, systemIsDark]);

  // Sync dark class on documentElement for Tailwind dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [effectiveTheme]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('etp_theme', mode);
    if (user) {
      api.updateProfile({ theme: mode }).catch(() => {});
    }
  };

  const handleSetIsMobileFrame = (val: boolean) => {
    setIsMobileFrame(val);
    localStorage.setItem('etp_mobile_frame', String(val));
  };

  const handleSetPlatformSkin = (skin: 'ios' | 'android') => {
    setPlatformSkin(skin);
    localStorage.setItem('etp_platform_skin', skin);
  };

  const toggleTheme = () => {
    setThemeMode(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  const togglePlatformSkin = () => {
    handleSetPlatformSkin(platformSkin === 'ios' ? 'android' : 'ios');
  };

  // Check existing session on boot
  useEffect(() => {
    async function initSession() {
      const storedTok = getStoredToken();
      if (storedTok) {
        try {
          const res = await api.me();
          setUser(res.user);
          setToken(storedTok);
          if (res.user.theme) {
            setThemeModeState(res.user.theme);
          }
        } catch (err) {
          console.warn('Session verification failed, recovering with demo user:', err);
          // If server restarted or token expired, auto-recover demo user for seamless UX
          try {
            const loginRes = await api.login('user@demo.com', 'User@123');
            setUser(loginRes.user);
            setToken(loginRes.token);
          } catch {
            clearStoredAuth();
            setUser(null);
            setToken(null);
          }
        }
      } else {
        // Auto sign-in demo user on first ever landing so the app is instantly working and populated
        try {
          const loginRes = await api.login('user@demo.com', 'User@123');
          setUser(loginRes.user);
          setToken(loginRes.token);
        } catch {
          clearStoredAuth();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }

    initSession();

    const handleUnauthorized = async () => {
      console.warn('Unauthorized event received, recovering session with demo user...');
      try {
        const loginRes = await api.login('user@demo.com', 'User@123');
        setUser(loginRes.user);
        setToken(loginRes.token);
      } catch {
        clearStoredAuth();
        setUser(null);
        setToken(null);
      }
    };

    window.addEventListener('etp_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('etp_unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      setToken(res.token);
      if (res.user.theme) {
        setThemeModeState(res.user.theme);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; currency?: CurrencyCode; monthly_budget?: number }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    if (role === 'admin') {
      await login('admin@demo.com', 'Admin@123');
    } else {
      await login('user@demo.com', 'User@123');
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    const res = await api.updateProfile(updates);
    setUser(res.user);
    if (updates.theme) {
      setThemeModeState(updates.theme);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.me();
      setUser(res.user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const currencySymbol = useMemo(() => {
    return getCurrencySymbol(user?.currency || 'INR');
  }, [user?.currency]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !isLoading && !!user && !!token,
        isLoading,
        currencySymbol,
        themeMode,
        effectiveTheme,
        theme: effectiveTheme,
        isMobileFrame,
        platformSkin,
        setThemeMode,
        toggleTheme,
        setIsMobileFrame: handleSetIsMobileFrame,
        setPlatformSkin: handleSetPlatformSkin,
        togglePlatformSkin,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
