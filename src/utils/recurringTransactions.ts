import { storage } from './storage';
import { Bill, Transaction } from '../types';

export class RecurringTransactionManager {
  private static readonly LAST_CHECK_KEY = 'lastRecurringCheck';
  private static readonly PROCESSED_KEY = 'processedRecurring';

  /**
   * Check and process recurring transactions
   * Should be called on app startup and periodically
   */
  static checkAndProcessRecurring(): void {
    const lastCheck = localStorage.getItem(this.LAST_CHECK_KEY);
    const today = new Date().toISOString().split('T')[0];

    // Only process once per day
    if (lastCheck === today) {
      return;
    }

    const bills = storage.getBills();
    const processedToday = this.getProcessedToday();

    bills.forEach(bill => {
      // Skip if already paid
      if (bill.paid) return;

      // Skip if already processed today
      if (processedToday.includes(bill.id)) return;

      // Check if bill is due today
      if (this.isDueToday(bill)) {
        this.createRecurringTransaction(bill);
        this.markAsProcessed(bill.id);
      }

      // Auto-pay if enabled
      if (bill.autopay && this.isDueToday(bill)) {
        this.processAutoPay(bill);
      }
    });

    localStorage.setItem(this.LAST_CHECK_KEY, today);
  }

  /**
   * Check if a bill is due today
   */
  private static isDueToday(bill: Bill): boolean {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const billDueDay = parseInt(bill.dueDate);

    return dayOfMonth === billDueDay;
  }

  /**
   * Create a recurring transaction notification
   */
  private static createRecurringTransaction(bill: Bill): void {
    // Don't auto-create transaction, just notify
    // The user should decide whether to pay or not
    window.dispatchEvent(new CustomEvent('recurringBillDue', {
      detail: {
        bill,
        message: `Reminder: ${bill.name} is due today ($${bill.amount})`
      }
    }));
  }

  /**
   * Process auto-pay for a bill
   */
  private static processAutoPay(bill: Bill): void {
    // Mark bill as paid
    storage.updateBill(bill.id, { paid: true });

    // Create transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      name: `Auto-Pay: ${bill.name}`,
      amount: bill.amount,
      type: 'expense',
      category: bill.category || 'Bills',
      date: new Date().toISOString().split('T')[0],
      description: `Automatic payment for ${bill.name} - ${bill.provider || 'recurring bill'}`,
      tags: ['auto-pay', 'recurring']
    };

    storage.addTransaction(transaction);

    // Dispatch events
    window.dispatchEvent(new CustomEvent('transactionAdded'));
    window.dispatchEvent(new CustomEvent('autoPaidBill', {
      detail: {
        bill,
        transaction,
        message: `Auto-paid: ${bill.name} ($${bill.amount})`
      }
    }));
  }

  /**
   * Get bills processed today
   */
  private static getProcessedToday(): string[] {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(this.PROCESSED_KEY);

    if (!stored) return [];

    try {
      const data = JSON.parse(stored);
      if (data.date === today) {
        return data.bills || [];
      }
    } catch (e) {
      console.error('Error parsing processed recurring bills:', e);
    }

    return [];
  }

  /**
   * Mark a bill as processed today
   */
  private static markAsProcessed(billId: string): void {
    const today = new Date().toISOString().split('T')[0];
    const processed = this.getProcessedToday();

    if (!processed.includes(billId)) {
      processed.push(billId);
    }

    localStorage.setItem(this.PROCESSED_KEY, JSON.stringify({
      date: today,
      bills: processed
    }));
  }

  /**
   * Schedule next month's recurring bills
   * This resets paid status for bills when the new period starts
   */
  static resetMonthlyBills(): void {
    const lastReset = localStorage.getItem('lastBillReset');
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    if (lastReset === currentMonth) {
      return;
    }

    const bills = storage.getBills();

    bills.forEach(bill => {
      if (bill.frequency === 'monthly' && bill.paid) {
        // Check if we're in a new period
        const billDueDay = parseInt(bill.dueDate);
        const todayDay = today.getDate();

        // If we've passed the due date into a new month, reset
        if (todayDay < billDueDay) {
          storage.updateBill(bill.id, { paid: false });
        }
      }
    });

    localStorage.setItem('lastBillReset', currentMonth);
  }

  /**
   * Get upcoming recurring bills (next 7 days)
   */
  static getUpcomingRecurring(): Bill[] {
    const bills = storage.getBills();
    const today = new Date();
    const upcoming: Bill[] = [];

    bills.forEach(bill => {
      if (bill.paid) return;

      const daysUntil = this.getDaysUntilDue(bill.dueDate);

      if (daysUntil >= 0 && daysUntil <= 7) {
        upcoming.push(bill);
      }
    });

    return upcoming.sort((a, b) => {
      return this.getDaysUntilDue(a.dueDate) - this.getDaysUntilDue(b.dueDate);
    });
  }

  /**
   * Calculate days until a bill is due
   */
  private static getDaysUntilDue(dueDate: string): number {
    const today = new Date();
    const due = new Date(today.getFullYear(), today.getMonth(), parseInt(dueDate));

    if (due < today) {
      due.setMonth(due.getMonth() + 1);
    }

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }
}

// Auto-initialize recurring transaction checking
if (typeof window !== 'undefined') {
  // Check on page load
  window.addEventListener('load', () => {
    RecurringTransactionManager.checkAndProcessRecurring();
    RecurringTransactionManager.resetMonthlyBills();
  });

  // Check every hour
  setInterval(() => {
    RecurringTransactionManager.checkAndProcessRecurring();
    RecurringTransactionManager.resetMonthlyBills();
  }, 60 * 60 * 1000); // 1 hour
}
