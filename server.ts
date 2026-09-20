import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Body parsing with 10MB limit for receipt images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data storage setup
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBStore {
  users: Array<{
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: 'admin' | 'user';
    avatar?: string;
    currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';
    theme: 'system' | 'light' | 'dark';
    monthly_budget: number;
    is_active?: boolean;
    created_at: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense' | 'both';
    user_id: string | null;
    created_at: string;
  }>;
  transactions: Array<{
    id: string;
    user_id: string;
    type: 'income' | 'expense';
    amount: number;
    category_id: string;
    description: string;
    date: string;
    currency: 'INR' | 'USD' | 'EUR' | 'GBP';
    receipt?: string;
    created_at: string;
  }>;
  budgets: Array<{
    id: string;
    user_id: string;
    month: number;
    year: number;
    amount: number;
  }>;
  notifications: Array<{
    id: string;
    user_id: string;
    message: string;
    type: 'warning' | 'info' | 'success' | 'danger';
    is_read: boolean;
    created_at: string;
  }>;
  activity_log: Array<{
    id: string;
    user_id: string;
    user_name: string;
    action: string;
    time: string;
    amount?: number;
    type?: 'income' | 'expense';
  }>;
}

const DEFAULT_CATEGORIES: DBStore['categories'] = [
  { id: 'cat-1', name: 'Food & Dining', icon: '🍔', color: '#f97316', type: 'expense', user_id: null, created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'Groceries', icon: '🛒', color: '#10b981', type: 'expense', user_id: null, created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense', user_id: null, created_at: new Date().toISOString() },
  { id: 'cat-4', name: 'Transportation', icon: '🚗', color: '#3b82f6', type: 'expense', user_id: null, created_at: new Date().toISOString() },
  { id: 'cat-5', name: 'Housing & Rent', icon: '🏠', color: '#8b5cf6', type: 'expense', user_id: null, created_at: new Date().toISOString() },
  { id: 'cat-6', name: 'Bills & Utilities', icon: '💡', color: '#eab308', type: 'expense', user_id: null, created_at: new Date().toISOString() },
  { id: 'cat-7', name: 'Entertainment', icon: '🎬', color: '#06b6d4', type: 'expense', user_id: null, created_at: new Date().toISOString() },
  { id: 'cat-8', name: 'Health & Wellness', icon: '💊', color: '#ef4444', type: 'expense', user_id: null, created_at: new Date().toISOString() },
  { id: 'cat-9', name: 'Salary', icon: '💼', color: '#10b981', type: 'income', user_id: null, created_at: new Date().toISOString() },
  { id: 'cat-10', name: 'Freelance & Projects', icon: '💻', color: '#6366f1', type: 'income', user_id: null, created_at: new Date().toISOString() },
  { id: 'cat-11', name: 'Investments', icon: '📈', color: '#14b8a6', type: 'both', user_id: null, created_at: new Date().toISOString() },
  { id: 'cat-12', name: 'Gifts & Others', icon: '🎁', color: '#f43f5e', type: 'both', user_id: null, created_at: new Date().toISOString() },
];

function initializeSeedStore(): DBStore {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('Admin@123', salt);
  const userPasswordHash = bcrypt.hashSync('User@123', salt);

  const adminUser = {
    id: 'usr-admin-1',
    name: 'Admin Demo',
    email: 'admin@demo.com',
    password_hash: adminPasswordHash,
    role: 'admin' as const,
    currency: 'INR' as const,
    theme: 'system' as const,
    monthly_budget: 60000,
    is_active: true,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  const regularUser = {
    id: 'usr-user-1',
    name: 'Demo User',
    email: 'user@demo.com',
    password_hash: userPasswordHash,
    role: 'user' as const,
    currency: 'INR' as const,
    theme: 'system' as const,
    monthly_budget: 45000,
    is_active: true,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Generate realistic seed transactions for past 3 months
  const sampleTransactions: DBStore['transactions'] = [];
  const descriptions = [
    { cat: 'cat-9', type: 'income' as const, amount: 75000, desc: 'Monthly Salary Credit' },
    { cat: 'cat-10', type: 'income' as const, amount: 15000, desc: 'Mobile UI Consulting Project' },
    { cat: 'cat-5', type: 'expense' as const, amount: 18000, desc: 'Apartment Monthly Rent' },
    { cat: 'cat-2', type: 'expense' as const, amount: 4800, desc: 'Organic Supermarket Run' },
    { cat: 'cat-1', type: 'expense' as const, amount: 1250, desc: 'Weekend Bistro Lunch' },
    { cat: 'cat-4', type: 'expense' as const, amount: 2400, desc: 'Fuel & Metro Smartcard Reload' },
    { cat: 'cat-6', type: 'expense' as const, amount: 3100, desc: 'High-speed Fiber & Electricity Bill' },
    { cat: 'cat-7', type: 'expense' as const, amount: 999, desc: 'OTT Streaming Subscriptions' },
    { cat: 'cat-3', type: 'expense' as const, amount: 3500, desc: 'Running Shoes & Sports Wear' },
    { cat: 'cat-8', type: 'expense' as const, amount: 850, desc: 'Vitamins and Pharmacy' },
    { cat: 'cat-11', type: 'income' as const, amount: 3200, desc: 'Quarterly Mutual Fund Dividend' },
  ];

  // Distribute over past 3 months
  let txIndex = 1;
  for (let mOffset = 2; mOffset >= 0; mOffset--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - mOffset, 1);
    const yr = targetDate.getFullYear();
    const mo = targetDate.getMonth() + 1;

    descriptions.forEach((item, idx) => {
      const day = Math.min(2 + idx * 2, 28);
      const dateStr = `${yr}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasReceipt = idx === 0 || idx === 3 || idx === 8;
      sampleTransactions.push({
        id: `tx-seed-${txIndex++}`,
        user_id: regularUser.id,
        type: item.type,
        amount: item.amount,
        category_id: item.cat,
        description: item.desc,
        date: dateStr,
        currency: 'INR',
        receipt: hasReceipt ? 'https://images.unsplash.com/photo-1554415707-9e49667ff0d7?w=600&auto=format&fit=crop&q=80' : undefined,
        created_at: new Date(targetDate.getTime() + day * 86400000).toISOString(),
      });
    });
  }

  // Budget records
  const sampleBudgets: DBStore['budgets'] = [
    { id: 'bgt-1', user_id: regularUser.id, month: currentMonth, year: currentYear, amount: 45000 },
    { id: 'bgt-2', user_id: regularUser.id, month: ((currentMonth - 2 + 12) % 12) + 1, year: currentYear, amount: 45000 },
    { id: 'bgt-3', user_id: regularUser.id, month: ((currentMonth - 3 + 12) % 12) + 1, year: currentYear, amount: 45000 },
  ];

  // Notifications
  const sampleNotifications: DBStore['notifications'] = [
    {
      id: 'notif-1',
      user_id: regularUser.id,
      message: 'Welcome to Expense Tracker Pro! Your monthly budget is configured to ₹45,000.',
      type: 'info',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      user_id: regularUser.id,
      message: 'Heads up: You have utilized 78% of your monthly budget for Groceries and Rent.',
      type: 'warning',
      is_read: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'notif-3',
      user_id: regularUser.id,
      message: 'Great job! Income has exceeded your target savings goals this quarter.',
      type: 'success',
      is_read: true,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];

  const sampleActivity: DBStore['activity_log'] = [
    {
      id: 'act-1',
      user_id: regularUser.id,
      user_name: regularUser.name,
      action: 'Added transaction "Monthly Salary Credit"',
      time: new Date().toISOString(),
      amount: 75000,
      type: 'income',
    },
    {
      id: 'act-2',
      user_id: regularUser.id,
      user_name: regularUser.name,
      action: 'Set monthly budget to ₹45,000',
      time: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'act-3',
      user_id: adminUser.id,
      user_name: adminUser.name,
      action: 'System initialized and seeded 12 global categories',
      time: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  return {
    users: [adminUser, regularUser],
    categories: DEFAULT_CATEGORIES,
    transactions: sampleTransactions,
    budgets: sampleBudgets,
    notifications: sampleNotifications,
    activity_log: sampleActivity,
  };
}

let db: DBStore;

function loadDatabase(): DBStore {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Could not read existing store, creating seed database', err);
  }
  const seed = initializeSeedStore();
  saveDatabase(seed);
  return seed;
}

function saveDatabase(data: DBStore = db) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database store:', err);
  }
}

db = loadDatabase();

// Persistent & In-memory active tokens (simulating secure session management)
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const activeSessions = new Map<string, string>(); // token -> userId

function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      if (typeof data === 'object' && data !== null) {
        for (const [tok, uid] of Object.entries(data)) {
          if (typeof tok === 'string' && typeof uid === 'string') {
            activeSessions.set(tok, uid);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not read existing sessions:', err);
  }
}

function saveSessions() {
  try {
    const obj: Record<string, string> = {};
    for (const [tok, uid] of activeSessions.entries()) {
      obj[tok] = uid;
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving sessions file:', err);
  }
}

loadSessions();

function generateToken(userId: string): string {
  const token = `etp_tok_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  activeSessions.set(token, userId);
  saveSessions();
  return token;
}

// Authentication middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  let userId = activeSessions.get(token);

  // Resilient fallback: parse token if server restarted or container cold-started
  if (!userId && token.startsWith('etp_tok_')) {
    const rest = token.substring('etp_tok_'.length);
    const lastUnderscore = rest.lastIndexOf('_');
    if (lastUnderscore !== -1) {
      const secondLastUnderscore = rest.lastIndexOf('_', lastUnderscore - 1);
      if (secondLastUnderscore !== -1) {
        const extractedUserId = rest.substring(0, secondLastUnderscore);
        const timestamp = parseInt(rest.substring(secondLastUnderscore + 1, lastUnderscore), 10);
        // Valid for 30 days
        if (extractedUserId && !isNaN(timestamp) && (Date.now() - timestamp < 30 * 86400000)) {
          const matchedUser = db.users.find(u => u.id === extractedUserId);
          if (matchedUser && matchedUser.is_active) {
            userId = matchedUser.id;
            activeSessions.set(token, userId);
            saveSessions();
          }
        }
      }
    }
  }

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  (req as any).user = user;
  next();
}

function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin privilege required' });
  }
  next();
}

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, currency, monthly_budget } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name is required (at least 2 characters)' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password_hash,
    role: 'user' as const,
    currency: (['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].includes(currency) ? currency : 'INR') as any,
    theme: 'system' as const,
    monthly_budget: typeof monthly_budget === 'number' && monthly_budget > 0 ? monthly_budget : 30000,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Initial welcome notification
  db.notifications.push({
    id: `notif-${Date.now()}`,
    user_id: newUser.id,
    message: `Welcome ${newUser.name}! Start by logging your first expense or customizing your categories.`,
    type: 'info',
    is_read: false,
    created_at: new Date().toISOString(),
  });

  saveDatabase();

  const token = generateToken(newUser.id);
  const { password_hash: _, ...userSafe } = newUser;
  res.status(201).json({ token, user: userSafe });
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken(user.id);
  const { password_hash: _, ...userSafe } = user;
  res.json({ token, user: userSafe });
});

// Current User profile
app.get('/api/auth/me', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { password_hash: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

// Update Profile
app.put('/api/auth/profile', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { name, avatar, currency, theme, monthly_budget } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    user.name = name.trim();
  }

  if (avatar !== undefined) {
    if (avatar && typeof avatar === 'string' && avatar.startsWith('data:image/')) {
      // Validate file size (~5MB in base64 is ~7M chars)
      if (avatar.length > 7 * 1024 * 1024) {
        return res.status(400).json({ error: 'Avatar image exceeds 5MB size limit' });
      }
    }
    user.avatar = avatar;
  }

  if (currency !== undefined) {
    if (!['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].includes(currency)) {
      return res.status(400).json({ error: 'Invalid currency code' });
    }
    user.currency = currency;
  }

  if (theme !== undefined) {
    if (!['system', 'light', 'dark'].includes(theme)) {
      return res.status(400).json({ error: 'Invalid theme mode' });
    }
    user.theme = theme;
  }

  if (monthly_budget !== undefined) {
    const num = Number(monthly_budget);
    if (isNaN(num) || num < 0) {
      return res.status(400).json({ error: 'Monthly budget must be a positive number' });
    }
    user.monthly_budget = num;
  }

  saveDatabase();
  const { password_hash: _, ...userSafe } = user;
  res.json({ user: userSafe, message: 'Profile updated successfully' });
});

// Change Password
app.put('/api/auth/change-password', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const isMatch = bcrypt.compareSync(current_password, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ error: 'Current password does not match' });
  }

  const salt = bcrypt.genSaltSync(10);
  user.password_hash = bcrypt.hashSync(new_password, salt);
  saveDatabase();

  res.json({ message: 'Password changed successfully' });
});

// ----------------------------------------------------
// CATEGORIES ENDPOINTS
// ----------------------------------------------------

// List categories (global categories + user's custom categories)
app.get('/api/categories', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const categories = db.categories.filter(c => c.user_id === null || c.user_id === user.id);
  res.json({ categories });
});

// Create Category
app.post('/api/categories', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { name, icon, color, type, is_global } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  if (!['income', 'expense', 'both'].includes(type)) {
    return res.status(400).json({ error: 'Type must be income, expense, or both' });
  }

  // Only admins can create global categories
  const targetUserId = is_global && user.role === 'admin' ? null : user.id;

  const newCategory = {
    id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: name.trim(),
    icon: (icon && typeof icon === 'string') ? icon : '🏷️',
    color: (color && typeof color === 'string') ? color : '#10b981',
    type: type as any,
    user_id: targetUserId,
    created_at: new Date().toISOString(),
  };

  db.categories.push(newCategory);
  saveDatabase();

  res.status(201).json({ category: newCategory });
});

// Delete Category
app.delete('/api/categories/:id', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const catId = req.params.id;

  const catIdx = db.categories.findIndex(c => c.id === catId);
  if (catIdx === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const cat = db.categories[catIdx];
  if (cat.user_id === null && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete global categories' });
  }

  if (cat.user_id !== null && cat.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'You cannot delete another user category' });
  }

  db.categories.splice(catIdx, 1);
  saveDatabase();

  res.json({ message: 'Category deleted' });
});

// ----------------------------------------------------
// TRANSACTIONS ENDPOINTS
// ----------------------------------------------------

// List transactions with pagination & filtering
app.get('/api/transactions', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const {
    type,
    category_id,
    startDate,
    endDate,
    searchQuery,
    userId,
    page = '1',
    limit = '50'
  } = req.query as Record<string, string>;

  let list = db.transactions;

  // Role filtering
  if (user.role === 'admin') {
    if (userId) {
      list = list.filter(t => t.user_id === userId);
    }
  } else {
    // Normal user only sees their own transactions
    list = list.filter(t => t.user_id === user.id);
  }

  // Type filter
  if (type && (type === 'income' || type === 'expense')) {
    list = list.filter(t => t.type === type);
  }

  // Category filter
  if (category_id && category_id !== 'all') {
    list = list.filter(t => t.category_id === category_id);
  }

  // Date range filter
  if (startDate) {
    list = list.filter(t => t.date >= startDate);
  }
  if (endDate) {
    list = list.filter(t => t.date <= endDate);
  }

  // Search filter
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(t => t.description.toLowerCase().includes(q));
  }

  // Sort descending by date, then created_at
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Attach user names for admin view
  const enriched = list.map(t => {
    const u = db.users.find(usr => usr.id === t.user_id);
    return {
      ...t,
      user_name: u ? u.name : 'Unknown',
      user_email: u ? u.email : '',
    };
  });

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = enriched.slice(startIndex, startIndex + limitNum);

  res.json({
    transactions: paginated,
    total: enriched.length,
    page: pageNum,
    totalPages: Math.ceil(enriched.length / limitNum),
  });
});

// Helper: check budget thresholds and push notification if needed
function checkBudgetAlerts(userId: string, targetDateStr: string) {
  const user = db.users.find(u => u.id === userId);
  if (!user || !user.monthly_budget || user.monthly_budget <= 0) return;

  const targetDate = new Date(targetDateStr);
  const yr = targetDate.getFullYear();
  const mo = targetDate.getMonth() + 1;

  // Calculate total expense this month
  const totalExpense = db.transactions
    .filter(t => {
      if (t.user_id !== userId || t.type !== 'expense') return false;
      const d = new Date(t.date);
      return d.getFullYear() === yr && (d.getMonth() + 1) === mo;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const budget = user.monthly_budget;
  const ratio = totalExpense / budget;

  if (ratio >= 1.0) {
    // Check if already notified 100% this month
    const already = db.notifications.find(n =>
      n.user_id === userId &&
      n.type === 'danger' &&
      n.message.includes(`exceeded 100%`) &&
      new Date(n.created_at).getMonth() === targetDate.getMonth()
    );
    if (!already) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        user_id: userId,
        message: `🚨 Budget Alert: You have exceeded 100% of your monthly budget! Total spent: ${user.currency === 'INR' ? '₹' : '$'}${totalExpense.toLocaleString()} of ${user.currency === 'INR' ? '₹' : '$'}${budget.toLocaleString()}.`,
        type: 'danger',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }
  } else if (ratio >= 0.75) {
    const already = db.notifications.find(n =>
      n.user_id === userId &&
      n.message.includes(`75% of your monthly budget`) &&
      new Date(n.created_at).getMonth() === targetDate.getMonth()
    );
    if (!already) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        user_id: userId,
        message: `⚠️ Budget Warning: You have reached ${Math.round(ratio * 100)}% of your monthly budget (${user.currency === 'INR' ? '₹' : '$'}${totalExpense.toLocaleString()} / ${user.currency === 'INR' ? '₹' : '$'}${budget.toLocaleString()}).`,
        type: 'warning',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }
  }
}

// Create Transaction
app.post('/api/transactions', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { type, amount, category_id, description, date, currency, receipt, user_id } = req.body;

  // Validation
  if (!type || (type !== 'income' && type !== 'expense')) {
    return res.status(400).json({ error: 'Type must be "income" or "expense"' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number greater than 0' });
  }

  if (!category_id || typeof category_id !== 'string') {
    return res.status(400).json({ error: 'Category ID is required' });
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const txDate = date || new Date().toISOString().split('T')[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(txDate)) {
    return res.status(400).json({ error: 'Date must be formatted as YYYY-MM-DD' });
  }

  // Receipt image validation
  if (receipt && typeof receipt === 'string') {
    if (receipt.startsWith('data:image/') && receipt.length > 7 * 1024 * 1024) {
      return res.status(400).json({ error: 'Receipt photo exceeds maximum size limit of 5MB' });
    }
  }

  // Determine target user (Admins can create on behalf of a user if specified)
  const targetUserId = (user.role === 'admin' && user_id) ? user_id : user.id;

  const newTx = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    user_id: targetUserId,
    type: type as 'income' | 'expense',
    amount: numAmount,
    category_id,
    description: description.trim(),
    date: txDate,
    currency: (currency || user.currency || 'INR') as any,
    receipt,
    created_at: new Date().toISOString(),
  };

  db.transactions.unshift(newTx);

  // Check budget alert
  if (newTx.type === 'expense') {
    checkBudgetAlerts(targetUserId, txDate);
  }

  // Activity log
  db.activity_log.unshift({
    id: `act-${Date.now()}`,
    user_id: user.id,
    user_name: user.name,
    action: `Added ${newTx.type} "${newTx.description}"`,
    time: new Date().toISOString(),
    amount: newTx.amount,
    type: newTx.type,
  });

  saveDatabase();

  res.status(201).json({ transaction: newTx });
});

// Update Transaction
app.put('/api/transactions/:id', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const txId = req.params.id;

  const txIndex = db.transactions.findIndex(t => t.id === txId);
  if (txIndex === -1) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  const existingTx = db.transactions[txIndex];
  if (existingTx.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: You can only edit your own transactions' });
  }

  const { type, amount, category_id, description, date, currency, receipt } = req.body;

  if (type !== undefined) {
    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Type must be "income" or "expense"' });
    }
    existingTx.type = type;
  }

  if (amount !== undefined) {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }
    existingTx.amount = num;
  }

  if (category_id !== undefined) existingTx.category_id = category_id;
  if (description !== undefined) existingTx.description = description.trim();
  if (date !== undefined) existingTx.date = date;
  if (currency !== undefined) existingTx.currency = currency;
  if (receipt !== undefined) existingTx.receipt = receipt;

  if (existingTx.type === 'expense') {
    checkBudgetAlerts(existingTx.user_id, existingTx.date);
  }

  saveDatabase();
  res.json({ transaction: existingTx });
});

// Delete Transaction (Swipe to delete / button)
app.delete('/api/transactions/:id', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const txId = req.params.id;

  const txIndex = db.transactions.findIndex(t => t.id === txId);
  if (txIndex === -1) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  const existingTx = db.transactions[txIndex];
  if (existingTx.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: You can only delete your own transactions' });
  }

  db.transactions.splice(txIndex, 1);

  db.activity_log.unshift({
    id: `act-${Date.now()}`,
    user_id: user.id,
    user_name: user.name,
    action: `Deleted transaction "${existingTx.description}"`,
    time: new Date().toISOString(),
    amount: existingTx.amount,
  });

  saveDatabase();
  res.json({ message: 'Transaction deleted successfully', id: txId });
});

// ----------------------------------------------------
// DASHBOARD & ANALYTICS
// ----------------------------------------------------

app.get('/api/dashboard', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Filter for this user's transactions
  const userTx = db.transactions.filter(t => t.user_id === user.id);

  // Current month totals
  const thisMonthTx = userTx.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth;
  });

  const income_this_month = thisMonthTx
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expense_this_month = thisMonthTx
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // Overall balance across all time
  const totalIncome = userTx.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = userTx.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Budget spent %
  const monthly_budget = user.monthly_budget || 45000;
  const budget_spent_percent = monthly_budget > 0 ? Math.round((expense_this_month / monthly_budget) * 100) : 0;

  // Spending by category this month
  const categoryMap = new Map<string, number>();
  thisMonthTx
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryMap.set(t.category_id, (categoryMap.get(t.category_id) || 0) + t.amount);
    });

  const category_breakdown = Array.from(categoryMap.entries()).map(([catId, amount]) => {
    const cat = db.categories.find(c => c.id === catId);
    return {
      category_id: catId,
      category_name: cat ? cat.name : 'Other',
      icon: cat ? cat.icon : '🏷️',
      color: cat ? cat.color : '#64748b',
      amount,
      percentage: expense_this_month > 0 ? Math.round((amount / expense_this_month) * 100) : 0,
    };
  }).sort((a, b) => b.amount - a.amount);

  // Monthly trends (past 6 months)
  const monthly_trends = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth() + 1;

    const mTx = userTx.filter(t => {
      const td = new Date(t.date);
      return td.getFullYear() === yr && (td.getMonth() + 1) === mo;
    });

    const inc = mTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = mTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    monthly_trends.push({
      month: `${monthNames[mo - 1]} ${String(yr).slice(-2)}`,
      income: inc,
      expense: exp,
    });
  }

  // Recent 5 transactions
  const recent_transactions = [...userTx]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  res.json({
    balance,
    income_this_month,
    expense_this_month,
    monthly_budget,
    budget_spent_percent,
    category_breakdown,
    monthly_trends,
    recent_transactions,
  });
});

// ----------------------------------------------------
// BUDGET MANAGEMENT
// ----------------------------------------------------

// Get budget history
app.get('/api/budgets', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const now = new Date();

  // Return past 6 months budget vs actual spend
  const history = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth() + 1;

    const existingBudget = db.budgets.find(b => b.user_id === user.id && b.month === mo && b.year === yr);
    const budgetAmount = existingBudget ? existingBudget.amount : user.monthly_budget;

    const actualExpense = db.transactions
      .filter(t => {
        if (t.user_id !== user.id || t.type !== 'expense') return false;
        const td = new Date(t.date);
        return td.getFullYear() === yr && (td.getMonth() + 1) === mo;
      })
      .reduce((s, t) => s + t.amount, 0);

    history.push({
      month: mo,
      year: yr,
      monthName: `${monthNames[mo - 1]} ${yr}`,
      budget: budgetAmount,
      spent: actualExpense,
      percentage: budgetAmount > 0 ? Math.min(Math.round((actualExpense / budgetAmount) * 100), 200) : 0,
    });
  }

  res.json({
    current_budget: user.monthly_budget,
    history,
  });
});

// Update or set monthly budget
app.post('/api/budgets', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { month, year, amount } = req.body;

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 0) {
    return res.status(400).json({ error: 'Budget amount must be a positive number' });
  }

  const now = new Date();
  const m = month || (now.getMonth() + 1);
  const y = year || now.getFullYear();

  let bgt = db.budgets.find(b => b.user_id === user.id && b.month === m && b.year === y);
  if (bgt) {
    bgt.amount = numAmount;
  } else {
    bgt = {
      id: `bgt-${Date.now()}`,
      user_id: user.id,
      month: m,
      year: y,
      amount: numAmount,
    };
    db.budgets.push(bgt);
  }

  // Also update user default monthly_budget
  user.monthly_budget = numAmount;
  saveDatabase();

  res.json({ budget: bgt, message: 'Monthly budget updated successfully' });
});

// ----------------------------------------------------
// NOTIFICATIONS ENDPOINTS
// ----------------------------------------------------

app.get('/api/notifications', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const notifs = db.notifications
    .filter(n => n.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({ notifications: notifs });
});

app.put('/api/notifications/:id/read', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const n = db.notifications.find(item => item.id === req.params.id && item.user_id === user.id);
  if (n) {
    n.is_read = true;
    saveDatabase();
  }
  res.json({ success: true });
});

app.put('/api/notifications/read-all', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  db.notifications.forEach(n => {
    if (n.user_id === user.id) n.is_read = true;
  });
  saveDatabase();
  res.json({ success: true });
});

app.delete('/api/notifications/:id', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const idx = db.notifications.findIndex(n => n.id === req.params.id && n.user_id === user.id);
  if (idx !== -1) {
    db.notifications.splice(idx, 1);
    saveDatabase();
  }
  res.json({ success: true });
});

// ----------------------------------------------------
// ADMIN ONLY ENDPOINTS
// ----------------------------------------------------

// Admin Dashboard stats
app.get('/api/admin/stats', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const total_users = db.users.length;
  const active_users = db.users.filter(u => u.is_active !== false).length;
  const total_transactions = db.transactions.length;

  const total_income = db.transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const total_expense = db.transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  res.json({
    total_users,
    active_users,
    total_transactions,
    total_volume: total_income + total_expense,
    total_categories: db.categories.length,
    total_income,
    total_expense,
    net_balance: total_income - total_expense,
    recent_activity: db.activity_log.slice(0, 15),
  });
});

// Admin All Transactions
app.get('/api/admin/transactions', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const userMap = new Map(db.users.map(u => [u.id, u.name]));
  const txList = db.transactions
    .map(t => ({
      ...t,
      user_name: userMap.get(t.user_id) || 'Unknown User',
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({ transactions: txList });
});

// Admin toggle user status (Active / Inactive)
app.put('/api/admin/users/:id/status', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const targetUser = db.users.find(u => u.id === req.params.id);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  const currentUser = (req as any).user;
  if (targetUser.id === currentUser.id) {
    return res.status(400).json({ error: 'You cannot change your own active status' });
  }

  const { is_active } = req.body;
  targetUser.is_active = typeof is_active === 'boolean' ? is_active : !targetUser.is_active;
  saveDatabase();

  res.json({ message: `User status updated to ${targetUser.is_active ? 'active' : 'suspended'}`, user: targetUser });
});

// Admin Users list
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const usersSafe = db.users.map(u => {
    const userTx = db.transactions.filter(t => t.user_id === u.id);
    const txCount = userTx.length;
    const totalSpent = userTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const { password_hash: _, ...safe } = u;
    return {
      ...safe,
      transactions_count: txCount,
      total_spent: totalSpent,
    };
  });

  res.json({ users: usersSafe });
});

// Admin toggle role
app.put('/api/admin/users/:id/role', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const targetUser = db.users.find(u => u.id === req.params.id);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  const currentUser = (req as any).user;
  if (targetUser.id === currentUser.id) {
    return res.status(400).json({ error: 'You cannot change your own role' });
  }

  targetUser.role = targetUser.role === 'admin' ? 'user' : 'admin';
  saveDatabase();

  res.json({ message: `Role changed to ${targetUser.role}`, user: targetUser });
});

// Admin delete user
app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const targetId = req.params.id;
  const currentUser = (req as any).user;

  if (targetId === currentUser.id) {
    return res.status(400).json({ error: 'You cannot delete your own admin account' });
  }

  const idx = db.users.findIndex(u => u.id === targetId);
  if (idx === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Remove their transactions, budgets, notifications
  db.transactions = db.transactions.filter(t => t.user_id !== targetId);
  db.budgets = db.budgets.filter(b => b.user_id !== targetId);
  db.notifications = db.notifications.filter(n => n.user_id !== targetId);
  db.users.splice(idx, 1);

  saveDatabase();
  res.json({ message: 'User and all associated records deleted successfully' });
});

// Admin Reports (per-user financial breakdown)
app.get('/api/admin/reports', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const userSummaries = db.users.map(u => {
    const userTx = db.transactions.filter(t => t.user_id === u.id);
    const inc = userTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = userTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      currency: u.currency,
      total_income: inc,
      total_expense: exp,
      net_savings: inc - exp,
      transactions_count: userTx.length,
      monthly_budget: u.monthly_budget,
    };
  });

  res.json({ reports: userSummaries });
});

// ----------------------------------------------------
// VITE MIDDLEWARE & SERVER START
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Expense Tracker Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
