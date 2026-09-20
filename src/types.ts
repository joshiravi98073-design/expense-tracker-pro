export type UserRole = 'admin' | 'user';
export type TransactionType = 'income' | 'expense';
export type CategoryType = 'income' | 'expense' | 'both';
export type NotificationType = 'warning' | 'info' | 'success' | 'danger';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  currency: CurrencyCode;
  theme: ThemeMode;
  monthly_budget: number;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  user_id: string | null; // null = global
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category_id: string;
  description: string;
  date: string; // YYYY-MM-DD
  currency: CurrencyCode;
  receipt?: string; // base64 or photo URL
  created_at: string;
  user_name?: string; // For admin view
  user_email?: string; // For admin view
}

export interface Budget {
  id: string;
  user_id: string;
  month: number; // 1-12
  year: number;
  amount: number;
}

export interface AppNotification {
  id: string;
  user_id: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_transactions: number;
  total_volume: number;
  total_categories: number;
  total_income: number;
  total_expense: number;
  net_balance: number;
  recent_activity: {
    id: string;
    action: string;
    user_name: string;
    time: string;
    amount?: number;
    type?: TransactionType;
  }[];
}

export interface DashboardSummary {
  balance: number;
  income_this_month: number;
  expense_this_month: number;
  monthly_budget: number;
  budget_spent_percent: number;
  recent_transactions: Transaction[];
  category_breakdown: {
    category_id: string;
    category_name: string;
    icon: string;
    color: string;
    amount: number;
    percentage: number;
  }[];
  monthly_trends: {
    month: string;
    income: number;
    expense: number;
  }[];
}

export interface TransactionFilter {
  type?: 'all' | 'income' | 'expense';
  category_id?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  userId?: string; // Admin only
}
