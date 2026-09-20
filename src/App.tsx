import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MobileFrame } from './components/MobileFrame';
import { OfflineBanner } from './components/OfflineBanner';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TransactionsScreen } from './screens/TransactionsScreen';
import { BudgetScreen } from './screens/BudgetScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AdminScreen } from './screens/AdminScreen';

import { TransactionFormSheet } from './components/TransactionFormSheet';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { FilterSheet } from './components/FilterSheet';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { ShareSummaryModal } from './components/ShareSummaryModal';
import { NotificationsModal } from './components/NotificationsModal';
import { PWAInstallModal } from './components/PWAInstallModal';

import { api } from './lib/api';
import {
  Transaction,
  Category,
  DashboardSummary,
  TransactionFilter,
  AppNotification,
  AdminStats,
  User,
} from './types';

function MainAppContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Active Tab
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Core Data States
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactionCount, setTotalTransactionCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [budgetHistory, setBudgetHistory] = useState<any[]>([]);

  // Admin Data States
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminAllTransactions, setAdminAllTransactions] = useState<Transaction[]>([]);

  // Filter State for Transactions Screen
  const [filter, setFilter] = useState<TransactionFilter>({});
  const [isLoadingTx, setIsLoadingTx] = useState(false);

  // Modals & Bottom Sheets
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedDetailTransaction, setSelectedDetailTransaction] = useState<Transaction | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isPWAModalOpen, setIsPWAModalOpen] = useState(false);

  // Load Categories
  const fetchCategories = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    try {
      const res = await api.getCategories();
      setCategories(res.categories);
    } catch (err: any) {
      if (err?.message?.includes('Unauthorized') || err?.message?.includes('Session expired')) return;
      console.error('Failed to load categories:', err);
    }
  }, [isAuthenticated, authLoading]);

  // Load Dashboard Summary
  const fetchSummary = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    try {
      const res = await api.getSummary();
      setSummary(res.summary);
    } catch (err: any) {
      if (err?.message?.includes('Unauthorized') || err?.message?.includes('Session expired')) return;
      console.error('Failed to load summary:', err);
    }
  }, [isAuthenticated, authLoading]);

  // Load Transactions
  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    setIsLoadingTx(true);
    try {
      const res = await api.getTransactions(filter, 1, 100);
      setTransactions(res.transactions);
      setTotalTransactionCount(res.total);
    } catch (err: any) {
      if (err?.message?.includes('Unauthorized') || err?.message?.includes('Session expired')) return;
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoadingTx(false);
    }
  }, [isAuthenticated, authLoading, filter]);

  // Load Notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadNotificationCount(res.unread_count);
    } catch (err: any) {
      if (err?.message?.includes('Unauthorized') || err?.message?.includes('Session expired')) return;
      console.error('Failed to load notifications:', err);
    }
  }, [isAuthenticated, authLoading]);

  // Load Budget History
  const fetchBudgetHistory = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    try {
      const res = await api.getBudgetHistory();
      setBudgetHistory(res.history);
    } catch (err: any) {
      if (err?.message?.includes('Unauthorized') || err?.message?.includes('Session expired')) return;
      console.error('Failed to load budget history:', err);
    }
  }, [isAuthenticated, authLoading]);

  // Load Admin Data
  const fetchAdminData = useCallback(async () => {
    if (!isAuthenticated || authLoading || user?.role !== 'admin') return;
    try {
      const [statsRes, usersRes, txRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminAllTransactions(),
      ]);
      setAdminStats(statsRes.stats);
      setAdminUsers(usersRes.users);
      setAdminAllTransactions(txRes.transactions);
    } catch (err: any) {
      if (err?.message?.includes('Unauthorized') || err?.message?.includes('Session expired')) return;
      console.error('Failed to load admin data:', err);
    }
  }, [isAuthenticated, authLoading, user?.role]);

  // Master Refresh
  const handleRefreshAll = async () => {
    if (!isAuthenticated || authLoading) return;
    await Promise.all([
      fetchSummary(),
      fetchTransactions(),
      fetchCategories(),
      fetchNotifications(),
      fetchBudgetHistory(),
      user?.role === 'admin' ? fetchAdminData() : Promise.resolve(),
    ]);
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      handleRefreshAll();
    }
  }, [isAuthenticated, authLoading, user?.id]);

  // Refetch transactions whenever filters change
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchTransactions();
    }
  }, [filter, fetchTransactions, isAuthenticated, authLoading]);

  // CRUD: Add / Update Transaction
  const handleSaveTransaction = async (data: Partial<Transaction>) => {
    if (editingTransaction) {
      await api.updateTransaction(editingTransaction.id, data);
      setEditingTransaction(null);
    } else {
      await api.createTransaction(data);
    }
    await handleRefreshAll();
  };

  // CRUD: Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      await handleRefreshAll();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  // Category Actions
  const handleCreateCategory = async (catData: any) => {
    await api.createCategory(catData);
    await fetchCategories();
  };

  const handleDeleteCategory = async (id: string) => {
    await api.deleteCategory(id);
    await fetchCategories();
  };

  // Notification Actions
  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    await fetchNotifications();
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    await fetchNotifications();
  };

  const handleDeleteNotification = async (id: string) => {
    await api.deleteNotification(id);
    await fetchNotifications();
  };

  // Admin Actions
  const handleToggleUserStatus = async (userId: string, currentActive: boolean) => {
    await api.updateAdminUserStatus(userId, !currentActive);
    await fetchAdminData();
  };

  const handleChangeUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    await api.updateAdminUserRole(userId, newRole);
    await fetchAdminData();
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950 text-slate-400 text-xs">
        <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2" />
        Initializing Expense Tracker Pro...
      </div>
    );
  }

  // Not logged in -> Show Login/Register
  if (!isAuthenticated) {
    return (
      <MobileFrame>
        <AuthScreen />
      </MobileFrame>
    );
  }

  // Find category map
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  return (
    <MobileFrame
      unreadNotificationCount={unreadNotificationCount}
      onOpenNotifications={() => setIsNotificationsModalOpen(true)}
    >
      {/* Main Screen Views */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {currentTab === 'home' && (
          <HomeScreen
            summary={summary}
            categories={categories}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onSelectTransaction={tx => setSelectedDetailTransaction(tx)}
            onDeleteTransaction={handleDeleteTransaction}
            onViewAllTransactions={() => setCurrentTab('transactions')}
            onRefresh={handleRefreshAll}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsScreen
            transactions={transactions}
            categories={categories}
            totalCount={totalTransactionCount}
            filter={filter}
            onFilterChange={setFilter}
            onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
            onSelectTransaction={tx => setSelectedDetailTransaction(tx)}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onRefresh={handleRefreshAll}
            isLoading={isLoadingTx}
          />
        )}

        {currentTab === 'budget' && (
          <BudgetScreen
            currentBudget={summary?.monthly_budget || user?.monthly_budget || 45000}
            currentSpend={summary?.expense_this_month || 0}
            history={budgetHistory}
            onBudgetUpdated={handleRefreshAll}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsScreen
            summary={summary}
            transactions={transactions}
            categories={categories}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileScreen
            onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
            onOpenPWAInstall={() => setIsPWAModalOpen(true)}
          />
        )}

        {currentTab === 'admin' && user?.role === 'admin' && (
          <AdminScreen
            stats={adminStats}
            users={adminUsers}
            allTransactions={adminAllTransactions}
            categories={categories}
            onToggleUserStatus={handleToggleUserStatus}
            onChangeUserRole={handleChangeUserRole}
            onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
            onSelectTransaction={tx => setSelectedDetailTransaction(tx)}
            onDeleteTransaction={handleDeleteTransaction}
            onRefresh={handleRefreshAll}
          />
        )}
      </div>

      {/* Bottom Navigation Tab Bar */}
      <BottomTabBar
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Modals and Sheets */}
      {/* 1. Add / Edit Transaction Sheet */}
      <TransactionFormSheet
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        categories={categories}
        initialData={editingTransaction}
        onSubmit={handleSaveTransaction}
        onAddNewCategoryClick={() => {
          setIsAddModalOpen(false);
          setIsCategoryModalOpen(true);
        }}
      />

      {/* 2. Transaction Details Modal (Drill-in) */}
      <TransactionDetailModal
        isOpen={!!selectedDetailTransaction}
        transaction={selectedDetailTransaction}
        category={
          selectedDetailTransaction
            ? categoryMap.get(selectedDetailTransaction.category_id)
            : undefined
        }
        onClose={() => setSelectedDetailTransaction(null)}
        onEdit={tx => {
          setSelectedDetailTransaction(null);
          setEditingTransaction(tx);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteTransaction}
      />

      {/* 3. Transaction Filter Sheet */}
      <FilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        categories={categories}
        currentFilter={filter}
        onApplyFilter={setFilter}
      />

      {/* 4. Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCreateCategory={handleCreateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* 5. Share Financial Summary Modal */}
      <ShareSummaryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        summary={summary}
        transactions={transactions}
        categories={categories}
      />

      {/* 6. Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onDelete={handleDeleteNotification}
      />

      {/* 7. PWA Installation & Guide Modal */}
      <PWAInstallModal
        isOpen={isPWAModalOpen}
        onClose={() => setIsPWAModalOpen(false)}
      />
    </MobileFrame>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
