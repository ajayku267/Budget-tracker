/**
 * Bank Account Linking System (Simulation)
 * Simulates connection to bank accounts and automatic transaction import
 */

export interface BankAccount {
  id: string;
  institutionId: string;
  institutionName: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  accountNumber: string; // Last 4 digits
  balance: number;
  currency: string;
  linkedDate: Date;
  lastSync: Date;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  logo?: string;
}

export interface BankInstitution {
  id: string;
  name: string;
  logo: string;
  country: string;
  color: string;
  supported: boolean;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category?: string;
  pending: boolean;
  merchant?: string;
}

// Simulated bank institutions
export const BANK_INSTITUTIONS: BankInstitution[] = [
  {
    id: 'chase',
    name: 'Chase Bank',
    logo: '🏦',
    country: 'USA',
    color: '#117ACA',
    supported: true
  },
  {
    id: 'bofa',
    name: 'Bank of America',
    logo: '🏛️',
    country: 'USA',
    color: '#E31837',
    supported: true
  },
  {
    id: 'wells-fargo',
    name: 'Wells Fargo',
    logo: '🏢',
    country: 'USA',
    color: '#D71E28',
    supported: true
  },
  {
    id: 'citi',
    name: 'Citibank',
    logo: '🏪',
    country: 'USA',
    color: '#056DAE',
    supported: true
  },
  {
    id: 'capital-one',
    name: 'Capital One',
    logo: '💳',
    country: 'USA',
    color: '#004879',
    supported: true
  },
  {
    id: 'hsbc',
    name: 'HSBC',
    logo: '🏦',
    country: 'UK',
    color: '#DB0011',
    supported: true
  },
  {
    id: 'barclays',
    name: 'Barclays',
    logo: '🏛️',
    country: 'UK',
    color: '#00AEEF',
    supported: true
  },
  {
    id: 'santander',
    name: 'Santander',
    logo: '🏢',
    country: 'Spain',
    color: '#EC0000',
    supported: true
  },
  {
    id: 'deutsche',
    name: 'Deutsche Bank',
    logo: '🏪',
    country: 'Germany',
    color: '#0018A8',
    supported: true
  },
  {
    id: 'bnp',
    name: 'BNP Paribas',
    logo: '🏦',
    country: 'France',
    color: '#00915A',
    supported: true
  },
];

export class BankLinkingManager {
  private static instance: BankLinkingManager;
  private linkedAccounts: BankAccount[] = [];
  private pendingTransactions: BankTransaction[] = [];

  private constructor() {
    this.loadLinkedAccounts();
  }

  static getInstance(): BankLinkingManager {
    if (!BankLinkingManager.instance) {
      BankLinkingManager.instance = new BankLinkingManager();
    }
    return BankLinkingManager.instance;
  }

  /**
   * Load linked accounts from localStorage
   */
  private loadLinkedAccounts(): void {
    const stored = localStorage.getItem('linked-bank-accounts');
    if (stored) {
      try {
        const accounts = JSON.parse(stored);
        this.linkedAccounts = accounts.map((acc: any) => ({
          ...acc,
          linkedDate: new Date(acc.linkedDate),
          lastSync: new Date(acc.lastSync)
        }));
      } catch (e) {
        console.error('Error loading linked accounts:', e);
      }
    }
  }

  /**
   * Save linked accounts to localStorage
   */
  private saveLinkedAccounts(): void {
    localStorage.setItem('linked-bank-accounts', JSON.stringify(this.linkedAccounts));
  }

  /**
   * Simulate bank account linking process
   */
  async linkBankAccount(
    institutionId: string,
    credentials: { username: string; password: string }
  ): Promise<{ success: boolean; accounts?: BankAccount[]; error?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Validate institution
    const institution = BANK_INSTITUTIONS.find(b => b.id === institutionId);
    if (!institution) {
      return { success: false, error: 'Invalid bank institution' };
    }

    // Simulate authentication (always succeeds in demo)
    if (credentials.username && credentials.password) {
      // Generate mock accounts
      const accounts: BankAccount[] = [
        {
          id: `${institutionId}-checking-${Date.now()}`,
          institutionId,
          institutionName: institution.name,
          accountName: 'Checking Account',
          accountType: 'checking',
          accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
          balance: Math.floor(Math.random() * 10000) + 1000,
          currency: 'USD',
          linkedDate: new Date(),
          lastSync: new Date(),
          status: 'connected',
          logo: institution.logo
        },
        {
          id: `${institutionId}-savings-${Date.now()}`,
          institutionId,
          institutionName: institution.name,
          accountName: 'Savings Account',
          accountType: 'savings',
          accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
          balance: Math.floor(Math.random() * 50000) + 5000,
          currency: 'USD',
          linkedDate: new Date(),
          lastSync: new Date(),
          status: 'connected',
          logo: institution.logo
        }
      ];

      // Add credit card if random
      if (Math.random() > 0.5) {
        accounts.push({
          id: `${institutionId}-credit-${Date.now()}`,
          institutionId,
          institutionName: institution.name,
          accountName: 'Credit Card',
          accountType: 'credit',
          accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
          balance: -(Math.floor(Math.random() * 5000)),
          currency: 'USD',
          linkedDate: new Date(),
          lastSync: new Date(),
          status: 'connected',
          logo: institution.logo
        });
      }

      // Add to linked accounts
      this.linkedAccounts.push(...accounts);
      this.saveLinkedAccounts();

      // Generate initial transactions for each account
      accounts.forEach(account => {
        this.generateMockTransactions(account.id, 20);
      });

      // Dispatch event
      window.dispatchEvent(new CustomEvent('bankAccountLinked', {
        detail: { accounts }
      }));

      return { success: true, accounts };
    }

    return { success: false, error: 'Invalid credentials' };
  }

  /**
   * Get all linked accounts
   */
  getLinkedAccounts(): BankAccount[] {
    return this.linkedAccounts;
  }

  /**
   * Get account by ID
   */
  getAccount(accountId: string): BankAccount | undefined {
    return this.linkedAccounts.find(acc => acc.id === accountId);
  }

  /**
   * Unlink bank account
   */
  unlinkAccount(accountId: string): void {
    this.linkedAccounts = this.linkedAccounts.filter(acc => acc.id !== accountId);
    this.saveLinkedAccounts();

    window.dispatchEvent(new CustomEvent('bankAccountUnlinked', {
      detail: { accountId }
    }));
  }

  /**
   * Sync account (fetch new transactions)
   */
  async syncAccount(accountId: string): Promise<BankTransaction[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const account = this.getAccount(accountId);
    if (!account) return [];

    // Generate new mock transactions
    const newTransactions = this.generateMockTransactions(accountId, 5);

    // Update last sync time
    account.lastSync = new Date();
    this.saveLinkedAccounts();

    window.dispatchEvent(new CustomEvent('accountSynced', {
      detail: { accountId, transactions: newTransactions }
    }));

    return newTransactions;
  }

  /**
   * Sync all accounts
   */
  async syncAllAccounts(): Promise<void> {
    for (const account of this.linkedAccounts) {
      if (account.status === 'connected') {
        await this.syncAccount(account.id);
      }
    }
  }

  /**
   * Generate mock transactions for demo
   */
  private generateMockTransactions(accountId: string, count: number): BankTransaction[] {
    const merchants = [
      'Amazon.com', 'Walmart', 'Starbucks', 'Shell Gas Station', 'Netflix',
      'Spotify', 'Uber', 'DoorDash', 'Target', 'Costco', 'Whole Foods',
      'Apple Store', 'McDonald\'s', 'CVS Pharmacy', 'Home Depot',
      'Best Buy', 'Chipotle', 'Subway', 'AT&T', 'Verizon'
    ];

    const categories = [
      'Groceries', 'Dining', 'Transportation', 'Entertainment', 'Shopping',
      'Utilities', 'Healthcare', 'Gas', 'Subscriptions', 'Home'
    ];

    const transactions: BankTransaction[] = [];

    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const isCredit = Math.random() > 0.7; // 30% chance of credit (income)

      transactions.push({
        id: `txn-${Date.now()}-${i}`,
        accountId,
        date: date.toISOString().split('T')[0],
        description: isCredit ? 'Direct Deposit - Salary' : merchants[Math.floor(Math.random() * merchants.length)],
        amount: isCredit
          ? Math.floor(Math.random() * 3000) + 1000
          : Math.floor(Math.random() * 200) + 10,
        type: isCredit ? 'credit' : 'debit',
        category: isCredit ? 'Income' : categories[Math.floor(Math.random() * categories.length)],
        pending: Math.random() > 0.9, // 10% chance of pending
        merchant: isCredit ? undefined : merchants[Math.floor(Math.random() * merchants.length)]
      });
    }

    // Store in pending transactions
    this.pendingTransactions.push(...transactions);

    return transactions;
  }

  /**
   * Get pending transactions (not yet imported)
   */
  getPendingTransactions(accountId?: string): BankTransaction[] {
    if (accountId) {
      return this.pendingTransactions.filter(t => t.accountId === accountId);
    }
    return this.pendingTransactions;
  }

  /**
   * Import transactions to main transaction list
   */
  importTransactions(transactionIds: string[]): void {
    // Remove from pending
    this.pendingTransactions = this.pendingTransactions.filter(
      t => !transactionIds.includes(t.id)
    );

    window.dispatchEvent(new CustomEvent('transactionsImported', {
      detail: { count: transactionIds.length }
    }));
  }

  /**
   * Get total balance across all accounts
   */
  getTotalBalance(): number {
    return this.linkedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  }

  /**
   * Get balance by account type
   */
  getBalanceByType(type: BankAccount['accountType']): number {
    return this.linkedAccounts
      .filter(acc => acc.accountType === type)
      .reduce((sum, acc) => sum + acc.balance, 0);
  }

  /**
   * Check if institution is already linked
   */
  isInstitutionLinked(institutionId: string): boolean {
    return this.linkedAccounts.some(acc => acc.institutionId === institutionId);
  }

  /**
   * Get accounts by institution
   */
  getAccountsByInstitution(institutionId: string): BankAccount[] {
    return this.linkedAccounts.filter(acc => acc.institutionId === institutionId);
  }
}

// Singleton instance
export const bankLinking = BankLinkingManager.getInstance();
