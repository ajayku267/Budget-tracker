import { AppData, Transaction, Goal, Bill, Budget, Investment, UserProfile } from '../types';

class StorageManager {
  private readonly STORAGE_KEY = 'primepay-data';

  private getDefaultData(): AppData {
    return {
      profile: null,
      transactions: [],
      goals: [],
      bills: [],
      budgets: [],
      investments: [],
      settings: {
        currency: 'USD',
        language: 'en',
        theme: 'light'
      }
    };
  }

  getData(): AppData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return { ...this.getDefaultData(), ...data };
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    return this.getDefaultData();
  }

  saveData(data: Partial<AppData>): void {
    try {
      const currentData = this.getData();
      const updatedData = { ...currentData, ...data };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Profile Management
  saveProfile(profile: UserProfile): void {
    const data = this.getData();
    data.profile = profile;
    this.saveData(data);
  }

  getProfile(): UserProfile | null {
    return this.getData().profile;
  }

  // Transaction Management
  addTransaction(transaction: Transaction): void {
    const data = this.getData();
    data.transactions.push(transaction);
    this.saveData(data);
  }

  updateTransaction(id: string, updates: Partial<Transaction>): void {
    const data = this.getData();
    const index = data.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      data.transactions[index] = { ...data.transactions[index], ...updates };
      this.saveData(data);
    }
  }

  deleteTransaction(id: string): void {
    const data = this.getData();
    data.transactions = data.transactions.filter(t => t.id !== id);
    this.saveData(data);
  }

  getTransactions(): Transaction[] {
    return this.getData().transactions;
  }

  // Goal Management
  addGoal(goal: Goal): void {
    const data = this.getData();
    data.goals.push(goal);
    this.saveData(data);
  }

  updateGoal(id: string, updates: Partial<Goal>): void {
    const data = this.getData();
    const index = data.goals.findIndex(g => g.id === id);
    if (index !== -1) {
      data.goals[index] = { ...data.goals[index], ...updates };
      this.saveData(data);
    }
  }

  deleteGoal(id: string): void {
    const data = this.getData();
    data.goals = data.goals.filter(g => g.id !== id);
    this.saveData(data);
  }

  getGoals(): Goal[] {
    return this.getData().goals;
  }

  // Bill Management
  addBill(bill: Bill): void {
    const data = this.getData();
    data.bills.push(bill);
    this.saveData(data);
  }

  updateBill(id: string, updates: Partial<Bill>): void {
    const data = this.getData();
    const index = data.bills.findIndex(b => b.id === id);
    if (index !== -1) {
      data.bills[index] = { ...data.bills[index], ...updates };
      this.saveData(data);
    }
  }

  deleteBill(id: string): void {
    const data = this.getData();
    data.bills = data.bills.filter(b => b.id !== id);
    this.saveData(data);
  }

  getBills(): Bill[] {
    return this.getData().bills;
  }

  // Budget Management
  addBudget(budget: Budget): void {
    const data = this.getData();
    data.budgets.push(budget);
    this.saveData(data);
  }

  updateBudget(id: string, updates: Partial<Budget>): void {
    const data = this.getData();
    const index = data.budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      data.budgets[index] = { ...data.budgets[index], ...updates };
      this.saveData(data);
    }
  }

  deleteBudget(id: string): void {
    const data = this.getData();
    data.budgets = data.budgets.filter(b => b.id !== id);
    this.saveData(data);
  }

  getBudgets(): Budget[] {
    return this.getData().budgets;
  }

  // Investment Management
  addInvestment(investment: Investment): void {
    const data = this.getData();
    data.investments.push(investment);
    this.saveData(data);
  }

  updateInvestment(id: string, updates: Partial<Investment>): void {
    const data = this.getData();
    const index = data.investments.findIndex(i => i.id === id);
    if (index !== -1) {
      data.investments[index] = { ...data.investments[index], ...updates };
      this.saveData(data);
    }
  }

  deleteInvestment(id: string): void {
    const data = this.getData();
    data.investments = data.investments.filter(i => i.id !== id);
    this.saveData(data);
  }

  getInvestments(): Investment[] {
    return this.getData().investments;
  }

  // Settings Management
  updateSettings(settings: Partial<AppData['settings']>): void {
    const data = this.getData();
    data.settings = { ...data.settings, ...settings };
    this.saveData(data);
  }

  getSettings(): AppData['settings'] {
    return this.getData().settings;
  }

  // Analytics
  getTransactionsByCategory(period: 'week' | 'month' | 'year'): Record<string, number> {
    const transactions = this.getTransactions();
    const now = new Date();
    const categoryTotals: Record<string, number> = {};

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      let isInPeriod = false;

      switch (period) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          isInPeriod = transactionDate >= weekAgo;
          break;
        case 'month':
          isInPeriod = transactionDate.getMonth() === now.getMonth() && 
                       transactionDate.getFullYear() === now.getFullYear();
          break;
        case 'year':
          isInPeriod = transactionDate.getFullYear() === now.getFullYear();
          break;
      }

      if (isInPeriod && transaction.type === 'expense') {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
      }
    });

    return categoryTotals;
  }

  getMonthlyTrends(months: number = 12): Array<{ month: string; income: number; expenses: number; savings: number }> {
    const transactions = this.getTransactions();
    const trends: Array<{ month: string; income: number; expenses: number; savings: number }> = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      trends.push({
        month: monthName,
        income,
        expenses,
        savings: income - expenses
      });
    }

    return trends;
  }

  // Backup and Restore
  exportData(): string {
    return JSON.stringify(this.getData(), null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.saveData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const storage = new StorageManager();