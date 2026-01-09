export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description?: string;
  tags?: string[];
  location?: string;
  receipt?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
  attachments?: string[];
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  createdAt: string;
  milestones?: {
    percentage: number;
    achieved: boolean;
    date?: string;
  }[];
  autoContribution?: {
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  color?: string;
  icon?: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  paid: boolean;
  createdAt: string;
  autopay?: boolean;
  reminderDays?: number;
  category?: string;
  provider?: string;
  accountNumber?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  alertThreshold: number;
}

export interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'bonds' | 'crypto' | 'real_estate' | 'mutual_funds' | 'etf';
  amount: number;
  currentValue: number;
  purchaseDate: string;
  quantity: number;
  pricePerUnit: number;
  dividends?: number;
  lastUpdated: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  currency: string;
  language: string;
  timezone: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    billReminders: boolean;
    goalUpdates: boolean;
    investmentAlerts: boolean;
    budgetAlerts: boolean;
    securityAlerts: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    activeSessions: string[];
    biometricEnabled: boolean;
  };
  subscription: {
    plan: 'free' | 'pro' | 'premium';
    startDate: string;
    endDate?: string;
    features: string[];
  };
}

export interface AppData {
  profile: UserProfile | null;
  transactions: Transaction[];
  goals: Goal[];
  bills: Bill[];
  budgets: Budget[];
  investments: Investment[];
  settings: {
    currency: string;
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
}