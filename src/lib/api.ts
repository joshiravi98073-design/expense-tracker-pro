import {
  User,
  Transaction,
  Category,
  DashboardSummary,
  TransactionFilter,
  AppNotification,
  Budget,
  AdminStats,
  CurrencyCode,
} from '../types';

const TOKEN_KEY = 'etp_auth_token';
const USER_KEY = 'etp_auth_user';
const CACHE_PREFIX = 'etp_cache_';

// Retrieve stored token
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Retrieve stored user profile
export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Save authentication session
export function setStoredAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Clear authentication session
export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Generic API Request helper with offline caching fallback
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const cacheKey = `${CACHE_PREFIX}${endpoint}`;

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
      if (res.status === 401) {
        clearStoredAuth();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('etp_unauthorized', { detail: { endpoint } }));
        }
      }
      throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    // Cache successful GET responses for offline mode
    if (!options.method || options.method === 'GET') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (e) {
        // quota exceeded or storage unavailable
      }
    }

    return data;
  } catch (err: any) {
    // If offline or network error, attempt to return cached GET data
    if ((!options.method || options.method === 'GET') && (!navigator.onLine || err.message === 'Failed to fetch')) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // ignore
        }
      }
    }
    throw err;
  }
}

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredAuth(data.token, data.user);
    return data;
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    currency?: string;
    monthly_budget?: number;
  }): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredAuth(res.token, res.user);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    const data = await request<{ user: User }>('/api/auth/me');
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  async me(): Promise<{ user: User }> {
    return this.getMe();
  },

  async updateProfile(data: Partial<User>): Promise<{ user: User; message: string }> {
    const res = await request<{ user: User; message: string }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    return res;
  },

  async changePassword(current_password: string, new_password: string): Promise<{ message: string }> {
    return request<{ message: string }>('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ current_password, new_password }),
    });
  },

  logout() {
    clearStoredAuth();
  },

  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    return request<{ categories: Category[] }>('/api/categories');
  },

  async createCategory(data: {
    name: string;
    icon: string;
    color: string;
    type: string;
    is_global?: boolean;
  }): Promise<{ category: Category }> {
    return request<{ category: Category }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Transactions
  async getTransactions(
    filter?: TransactionFilter,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (filter) {
      if (filter.type && filter.type !== 'all') params.set('type', filter.type);
      if (filter.category_id && filter.category_id !== 'all') params.set('category_id', filter.category_id);
      if (filter.startDate) params.set('startDate', filter.startDate);
      if (filter.endDate) params.set('endDate', filter.endDate);
      if (filter.searchQuery) params.set('searchQuery', filter.searchQuery);
      if (filter.userId) params.set('userId', filter.userId);
    }
    params.set('page', String(page));
    params.set('limit', String(limit));

    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/transactions${qs}`);
  },

  async createTransaction(data: Partial<Transaction>): Promise<{ transaction: Transaction }> {
    return request<{ transaction: Transaction }>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<{ transaction: Transaction }> {
    return request<{ transaction: Transaction }>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTransaction(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Dashboard & Summary
  async getDashboard(): Promise<DashboardSummary> {
    return request<DashboardSummary>('/api/dashboard');
  },

  async getSummary(): Promise<{ summary: DashboardSummary }> {
    const summary = await request<DashboardSummary>('/api/dashboard');
    return { summary };
  },

  // Budgets
  async getBudgets(): Promise<{ current_budget: number; history: any[] }> {
    return request<{ current_budget: number; history: any[] }>('/api/budgets');
  },

  async getBudgetHistory(): Promise<{ current_budget: number; history: any[] }> {
    return request<{ current_budget: number; history: any[] }>('/api/budgets');
  },

  async setBudget(amount: number, month?: number, year?: number): Promise<{ budget: Budget; message: string }> {
    return request<{ budget: Budget; message: string }>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify({ amount, month, year }),
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: AppNotification[]; unread_count: number }> {
    const res = await request<{ notifications: AppNotification[] }>('/api/notifications');
    const unread = res.notifications.filter(n => !n.is_read).length;
    return { notifications: res.notifications, unread_count: unread };
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PUT',
    });
  },

  async deleteNotification(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin APIs
  async getAdminStats(): Promise<{ stats: AdminStats }> {
    const stats = await request<AdminStats>('/api/admin/stats');
    return { stats };
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/api/admin/users');
  },

  async getAdminAllTransactions(): Promise<{ transactions: Transaction[] }> {
    return request<{ transactions: Transaction[] }>('/api/admin/transactions');
  },

  async updateAdminUserStatus(userId: string, is_active: boolean): Promise<{ message: string; user: any }> {
    return request<{ message: string; user: any }>(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active }),
    });
  },

  async updateAdminUserRole(userId: string, role: 'admin' | 'user'): Promise<{ message: string; user: any }> {
    return request<{ message: string; user: any }>(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async getAdminReports(): Promise<{ reports: any[] }> {
    return request<{ reports: any[] }>('/api/admin/reports');
  },
};

// Currency symbol helper
export function getCurrencySymbol(code: string = 'INR'): string {
  switch (code) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'JPY':
      return '¥';
    case 'CAD':
      return 'CA$';
    case 'AUD':
      return 'AU$';
    case 'INR':
    default:
      return '₹';
  }
}

// CSV Export Utility
export function exportTransactionsToCSV(transactions: Transaction[], categories: Category[], currencySymbol: string) {
  const catMap = new Map(categories.map(c => [c.id, c.name]));
  const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Currency'];

  const rows = transactions.map(t => [
    t.id,
    t.date,
    t.type.toUpperCase(),
    `"${(catMap.get(t.category_id) || 'General').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.amount,
    t.currency || 'INR',
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ExpenseTrackerPro_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
