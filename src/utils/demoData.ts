import { storage } from './storage';
import { Transaction, Goal, Bill, Budget, Investment } from '../types';

export class DemoDataGenerator {
  private categories = {
    expense: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Utilities', 'Health', 'Education'],
    income: ['Salary', 'Freelance', 'Investment', 'Bonus', 'Side Hustle']
  };

  private expenseNames: Record<string, string[]> = {
    Food: ['Grocery Store', 'Restaurant', 'Coffee Shop', 'Fast Food', 'Food Delivery', 'Bakery'],
    Transport: ['Gas Station', 'Uber', 'Public Transit', 'Parking', 'Car Maintenance', 'Taxi'],
    Entertainment: ['Movie Theater', 'Streaming Service', 'Concert Tickets', 'Gaming', 'Books', 'Spotify'],
    Shopping: ['Amazon', 'Clothing Store', 'Electronics', 'Home Goods', 'Online Shopping', 'Department Store'],
    Bills: ['Electricity', 'Water', 'Internet', 'Phone', 'Insurance', 'Rent'],
    Utilities: ['Gas Bill', 'Electric Bill', 'Water Bill', 'Trash Service', 'HOA Fee'],
    Health: ['Pharmacy', 'Doctor Visit', 'Gym Membership', 'Dental', 'Health Insurance'],
    Education: ['Online Course', 'Books', 'Tuition', 'Training', 'Certification']
  };

  generateTransactions(count: number = 100): Transaction[] {
    const transactions: Transaction[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
      // Random date within last 6 months
      const daysAgo = Math.floor(Math.random() * 180);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);

      // 80% expenses, 20% income
      const type = Math.random() < 0.8 ? 'expense' : 'income';

      let category: string;
      let name: string;
      let amount: number;

      if (type === 'expense') {
        category = this.categories.expense[Math.floor(Math.random() * this.categories.expense.length)];
        const names = this.expenseNames[category] || ['Misc Expense'];
        name = names[Math.floor(Math.random() * names.length)];
        // Expenses range from $5 to $500
        amount = Math.round((Math.random() * 495 + 5) * 100) / 100;
      } else {
        category = this.categories.income[Math.floor(Math.random() * this.categories.income.length)];
        name = category;
        // Income range from $500 to $5000
        amount = Math.round((Math.random() * 4500 + 500) * 100) / 100;
      }

      transactions.push({
        id: `demo-${Date.now()}-${i}`,
        name,
        amount,
        type,
        category,
        date: date.toISOString().split('T')[0],
        description: `Demo ${type} transaction`,
        tags: Math.random() > 0.7 ? ['demo', category.toLowerCase()] : ['demo']
      });
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  generateGoals(): Goal[] {
    const goalTemplates = [
      { name: 'Emergency Fund', targetAmount: 10000, category: 'Savings', icon: '🛡️' },
      { name: 'Vacation Fund', targetAmount: 5000, category: 'Travel', icon: '✈️' },
      { name: 'New Car', targetAmount: 25000, category: 'Purchase', icon: '🚗' },
      { name: 'Home Down Payment', targetAmount: 50000, category: 'Housing', icon: '🏠' },
      { name: 'Retirement', targetAmount: 100000, category: 'Investment', icon: '💰' },
      { name: 'Education Fund', targetAmount: 15000, category: 'Education', icon: '🎓' }
    ];

    return goalTemplates.map((template, index) => {
      const createdDate = new Date();
      createdDate.setMonth(createdDate.getMonth() - Math.floor(Math.random() * 6));

      const deadline = new Date();
      deadline.setFullYear(deadline.getFullYear() + Math.floor(Math.random() * 3 + 1));

      const currentAmount = Math.floor(template.targetAmount * (Math.random() * 0.6 + 0.1));

      return {
        id: `goal-${Date.now()}-${index}`,
        name: template.name,
        targetAmount: template.targetAmount,
        currentAmount,
        deadline: deadline.toISOString().split('T')[0],
        category: template.category,
        createdAt: createdDate.toISOString(),
        icon: template.icon,
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6],
        milestones: [
          { percentage: 25, achieved: currentAmount >= template.targetAmount * 0.25 },
          { percentage: 50, achieved: currentAmount >= template.targetAmount * 0.5 },
          { percentage: 75, achieved: currentAmount >= template.targetAmount * 0.75 },
          { percentage: 100, achieved: currentAmount >= template.targetAmount }
        ]
      };
    });
  }

  generateBills(): Bill[] {
    const billTemplates = [
      { name: 'Rent/Mortgage', amount: 1500, frequency: 'monthly' as const, category: 'Housing', provider: 'Property Management' },
      { name: 'Electric Bill', amount: 120, frequency: 'monthly' as const, category: 'Utilities', provider: 'Power Company' },
      { name: 'Internet', amount: 80, frequency: 'monthly' as const, category: 'Utilities', provider: 'ISP' },
      { name: 'Phone', amount: 60, frequency: 'monthly' as const, category: 'Utilities', provider: 'Mobile Carrier' },
      { name: 'Car Insurance', amount: 150, frequency: 'monthly' as const, category: 'Insurance', provider: 'Insurance Co.' },
      { name: 'Gym Membership', amount: 45, frequency: 'monthly' as const, category: 'Health', provider: 'Fitness Center' }
    ];

    return billTemplates.map((template, index) => {
      const dueDate = (Math.floor(Math.random() * 28) + 1).toString();
      const createdDate = new Date();
      createdDate.setMonth(createdDate.getMonth() - 2);

      return {
        id: `bill-${Date.now()}-${index}`,
        name: template.name,
        amount: template.amount,
        dueDate,
        frequency: template.frequency,
        paid: Math.random() > 0.3,
        createdAt: createdDate.toISOString(),
        autopay: Math.random() > 0.5,
        reminderDays: 3,
        category: template.category,
        provider: template.provider
      };
    });
  }

  generateBudgets(): Budget[] {
    const budgetTemplates = [
      { category: 'Food', amount: 800 },
      { category: 'Transport', amount: 400 },
      { category: 'Entertainment', amount: 300 },
      { category: 'Shopping', amount: 500 },
      { category: 'Bills', amount: 2000 },
      { category: 'Health', amount: 200 }
    ];

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return budgetTemplates.map((template, index) => {
      const spent = Math.floor(template.amount * (Math.random() * 0.8 + 0.1));

      return {
        id: `budget-${Date.now()}-${index}`,
        category: template.category,
        amount: template.amount,
        spent,
        period: 'monthly' as const,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        alertThreshold: 80
      };
    });
  }

  generateInvestments(): Investment[] {
    const investmentTemplates = [
      { name: 'Apple Inc.', type: 'stocks' as const, quantity: 10 },
      { name: 'S&P 500 ETF', type: 'etf' as const, quantity: 50 },
      { name: 'Bitcoin', type: 'crypto' as const, quantity: 0.5 },
      { name: 'US Treasury Bonds', type: 'bonds' as const, quantity: 20 },
      { name: 'Tech Mutual Fund', type: 'mutual_funds' as const, quantity: 100 }
    ];

    return investmentTemplates.map((template, index) => {
      const pricePerUnit = Math.random() * 500 + 50;
      const amount = template.quantity * pricePerUnit;
      const currentValue = amount * (1 + (Math.random() * 0.4 - 0.1)); // -10% to +30% gain

      const purchaseDate = new Date();
      purchaseDate.setMonth(purchaseDate.getMonth() - Math.floor(Math.random() * 12));

      return {
        id: `investment-${Date.now()}-${index}`,
        name: template.name,
        type: template.type,
        amount,
        currentValue,
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        quantity: template.quantity,
        pricePerUnit,
        dividends: template.type === 'stocks' ? Math.random() * 50 : undefined,
        lastUpdated: new Date().toISOString()
      };
    });
  }

  generateAllDemoData() {
    const transactions = this.generateTransactions(100);
    const goals = this.generateGoals();
    const bills = this.generateBills();
    const budgets = this.generateBudgets();
    const investments = this.generateInvestments();

    // Save to storage
    transactions.forEach(t => storage.addTransaction(t));
    goals.forEach(g => storage.addGoal(g));
    bills.forEach(b => storage.addBill(b));
    budgets.forEach(b => storage.addBudget(b));
    investments.forEach(i => storage.addInvestment(i));

    return {
      transactions: transactions.length,
      goals: goals.length,
      bills: bills.length,
      budgets: budgets.length,
      investments: investments.length
    };
  }

  clearAllData() {
    storage.clearAllData();
  }
}

export const demoDataGenerator = new DemoDataGenerator();
