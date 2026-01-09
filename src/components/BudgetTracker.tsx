import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, AlertCircle, TrendingUp, DollarSign, X, Check } from 'lucide-react';
import { storage } from '../utils/storage';
import { Budget } from '../types';

export function BudgetTracker() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly' as const,
    alertThreshold: '80'
  });

  useEffect(() => {
    loadBudgets();

    const handleTransactionAdded = () => {
      setTimeout(loadBudgets, 100);
    };

    window.addEventListener('transactionAdded', handleTransactionAdded);
    return () => window.removeEventListener('transactionAdded', handleTransactionAdded);
  }, []);

  const loadBudgets = () => {
    const data = storage.getBudgets();
    const transactions = storage.getTransactions();

    // Calculate spent for each budget
    const updatedBudgets = data.map(budget => {
      const budgetStart = new Date(budget.startDate);
      const budgetEnd = new Date(budget.endDate);

      const categoryTransactions = transactions.filter(t =>
        t.category === budget.category &&
        t.type === 'expense' &&
        new Date(t.date) >= budgetStart &&
        new Date(t.date) <= budgetEnd
      );

      const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);

      return { ...budget, spent };
    });

    setBudgets(updatedBudgets);
  };

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const budget: Budget = {
      id: Date.now().toString(),
      category: newBudget.category,
      amount: parseFloat(newBudget.amount),
      spent: 0,
      period: newBudget.period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      alertThreshold: parseInt(newBudget.alertThreshold)
    };

    storage.addBudget(budget);
    setNewBudget({
      category: '',
      amount: '',
      period: 'monthly',
      alertThreshold: '80'
    });
    setShowAddForm(false);
    loadBudgets();
  };

  const handleDeleteBudget = (budgetId: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      storage.deleteBudget(budgetId);
      loadBudgets();
    }
  };

  const getProgressColor = (percentage: number, threshold: number) => {
    if (percentage >= 100) return 'bg-error';
    if (percentage >= threshold) return 'bg-warning';
    return 'bg-success';
  };

  const getStatusIcon = (percentage: number, threshold: number) => {
    if (percentage >= 100) return <AlertCircle className="h-5 w-5 text-error" />;
    if (percentage >= threshold) return <AlertCircle className="h-5 w-5 text-warning" />;
    return <Check className="h-5 w-5 text-success" />;
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">${totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-error" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">${totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-foreground">
                  ${(totalBudget - totalSpent).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Overall Budget Progress</span>
              <span className="text-sm font-bold text-foreground">
                {overallPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getProgressColor(overallPercentage, 80)}`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>${totalSpent.toLocaleString()} spent</span>
              <span>${totalBudget.toLocaleString()} budgeted</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Budget Button */}
      {!showAddForm && (
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Budget
        </Button>
      )}

      {/* Add Budget Form */}
      {showAddForm && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>Add New Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                  placeholder="e.g., Food, Transport"
                />
              </div>

              <div>
                <Label htmlFor="amount">Budget Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="period">Period</Label>
                <select
                  id="period"
                  value={newBudget.period}
                  onChange={(e) => setNewBudget({...newBudget, period: e.target.value as any})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <Label htmlFor="threshold">Alert Threshold (%)</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={newBudget.alertThreshold}
                  onChange={(e) => setNewBudget({...newBudget, alertThreshold: e.target.value})}
                  placeholder="80"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddBudget} className="gap-2">
                <Check className="h-4 w-4" />
                Add Budget
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budgets List */}
      <div className="grid gap-4 md:grid-cols-2">
        {budgets.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="p-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No budgets yet. Create your first budget to track spending by category.
              </p>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => {
            const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
            const remaining = budget.amount - budget.spent;

            return (
              <Card key={budget.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          {getStatusIcon(percentage, budget.alertThreshold)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{budget.category}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-bold text-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${getProgressColor(percentage, budget.alertThreshold)}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Spent</p>
                        <p className="font-bold text-foreground">${budget.spent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className={`font-bold ${remaining >= 0 ? 'text-success' : 'text-error'}`}>
                          ${remaining.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Budget: ${budget.amount.toLocaleString()} • Alert at {budget.alertThreshold}%
                      </p>
                    </div>

                    {percentage >= budget.alertThreshold && (
                      <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${
                        percentage >= 100
                          ? 'bg-error/10 text-error'
                          : 'bg-warning/10 text-warning'
                      }`}>
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {percentage >= 100
                            ? 'Budget exceeded!'
                            : `Warning: ${percentage.toFixed(0)}% of budget used`}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
