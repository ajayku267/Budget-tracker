import { storage } from './storage';
import { AppData } from '../types';

export class ExportImportManager {
  // Export to JSON
  exportToJSON(): string {
    return storage.exportData();
  }

  // Export to CSV
  exportTransactionsToCSV(): string {
    const transactions = storage.getTransactions();
    const headers = ['Date', 'Name', 'Amount', 'Type', 'Category', 'Description', 'Tags'];
    const rows = transactions.map(t => [
      t.date,
      t.name,
      t.amount.toString(),
      t.type,
      t.category,
      t.description || '',
      (t.tags || []).join('; ')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Export goals to CSV
  exportGoalsToCSV(): string {
    const goals = storage.getGoals();
    const headers = ['Name', 'Target Amount', 'Current Amount', 'Deadline', 'Category', 'Progress %'];
    const rows = goals.map(g => [
      g.name,
      g.targetAmount.toString(),
      g.currentAmount.toString(),
      g.deadline,
      g.category,
      ((g.currentAmount / g.targetAmount) * 100).toFixed(2)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Download file helper
  downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Export all data as JSON
  exportAllData() {
    const content = this.exportToJSON();
    const date = new Date().toISOString().split('T')[0];
    this.downloadFile(content, `primepay-backup-${date}.json`, 'application/json');
  }

  // Export transactions as CSV
  exportTransactionsCSV() {
    const content = this.exportTransactionsToCSV();
    const date = new Date().toISOString().split('T')[0];
    this.downloadFile(content, `transactions-${date}.csv`, 'text/csv');
  }

  // Export goals as CSV
  exportGoalsCSV() {
    const content = this.exportGoalsToCSV();
    const date = new Date().toISOString().split('T')[0];
    this.downloadFile(content, `goals-${date}.csv`, 'text/csv');
  }

  // Import from JSON
  async importFromJSON(file: File): Promise<boolean> {
    try {
      const content = await file.text();
      return storage.importData(content);
    } catch (error) {
      console.error('Error importing JSON:', error);
      return false;
    }
  }

  // Import transactions from CSV
  async importTransactionsFromCSV(file: File): Promise<boolean> {
    try {
      const content = await file.text();
      const lines = content.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }

      // Skip header row
      const dataLines = lines.slice(1);

      for (const line of dataLines) {
        // Simple CSV parser (handles quoted fields)
        const fields = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanFields = fields.map(f => f.replace(/^"|"$/g, ''));

        if (cleanFields.length >= 5) {
          const [date, name, amount, type, category, description, tags] = cleanFields;

          storage.addTransaction({
            id: Date.now().toString() + Math.random(),
            date,
            name,
            amount: parseFloat(amount),
            type: type as 'income' | 'expense',
            category,
            description: description || undefined,
            tags: tags ? tags.split(';').map(t => t.trim()) : undefined,
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error importing CSV:', error);
      return false;
    }
  }

  // Generate PDF Report (simple text-based)
  generatePDFReport(): string {
    const data = storage.getData();
    const transactions = data.transactions;
    const goals = data.goals;
    const budgets = data.budgets;

    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const report = `
PRIMEPAY FINANCIAL REPORT
Generated: ${new Date().toLocaleString()}
=====================================

MONTHLY SUMMARY
---------------
Income:    $${income.toLocaleString()}
Expenses:  $${expenses.toLocaleString()}
Balance:   $${(income - expenses).toLocaleString()}
Savings:   ${income > 0 ? ((1 - expenses / income) * 100).toFixed(1) : 0}%

GOALS PROGRESS
--------------
${goals.map(g => {
  const progress = (g.currentAmount / g.targetAmount) * 100;
  return `${g.name}: ${progress.toFixed(1)}% ($${g.currentAmount.toLocaleString()} / $${g.targetAmount.toLocaleString()})`;
}).join('\n')}

BUDGET STATUS
-------------
${budgets.map(b => {
  const percentage = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
  return `${b.category}: ${percentage.toFixed(1)}% ($${b.spent.toLocaleString()} / $${b.amount.toLocaleString()})`;
}).join('\n')}

TOP EXPENSES
------------
${monthlyTransactions
  .filter(t => t.type === 'expense')
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 10)
  .map(t => `${t.date} - ${t.name}: $${t.amount.toLocaleString()}`)
  .join('\n')}

=====================================
End of Report
`;

    return report;
  }

  // Export PDF Report
  exportPDFReport() {
    const content = this.generatePDFReport();
    const date = new Date().toISOString().split('T')[0];
    this.downloadFile(content, `financial-report-${date}.txt`, 'text/plain');
  }
}

export const exportImport = new ExportImportManager();
