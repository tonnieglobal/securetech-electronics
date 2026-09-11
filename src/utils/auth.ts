import { AdminUser } from '../types';

export interface PreconfiguredAccount {
  email: string;
  password: string;
  name: string;
  role: AdminUser['role'];
  description: string;
}

export const ACTIVE_LOGIN_ACCOUNTS: PreconfiguredAccount[] = [
  {
    email: 'admin@securetech.ng',
    password: 'SecureAdmin#2026',
    name: 'Anthony O.',
    role: 'Super Admin',
    description: 'Full administrative access: product CRUD, bulk pricing, orders, and executive reporting.'
  },
  {
    email: 'inventory@securetech.ng',
    password: 'StockMaster#2026',
    name: 'Chioma K.',
    role: 'Inventory Specialist',
    description: 'Specialist access: inventory restocking, batch quantity updates, and warehouse movement.'
  },
  {
    email: 'auditor@securetech.ng',
    password: 'Compliance#2026',
    name: 'Emeka D.',
    role: 'Compliance Auditor',
    description: 'Auditing access: view financial reporting, stock valuation, and order ledgers.'
  }
];

const AUTH_STORAGE_KEY = 'securetech_backend_admin_session_v1';

export function getStoredAdminUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAdminSession(user: AdminUser): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to persist admin session', err);
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear admin session', err);
  }
}

export function authenticateAdmin(email: string, pass: string): { success: boolean; user?: AdminUser; error?: string } {
  const match = ACTIVE_LOGIN_ACCOUNTS.find(
    acc => acc.email.toLowerCase().trim() === email.toLowerCase().trim()
  );

  if (!match) {
    return { success: false, error: 'Invalid administrator email address. Use the active credentials below.' };
  }

  if (match.password !== pass.trim()) {
    return { success: false, error: 'Incorrect security password. Please re-enter the authorized passkey.' };
  }

  const user: AdminUser = {
    id: `admin-${Date.now()}`,
    email: match.email,
    name: match.name,
    role: match.role,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    lastLogin: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };

  return { success: true, user };
}
