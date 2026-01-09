import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PieChart,
  BarChart3,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Download
} from 'lucide-react';
import { storage } from '../utils/storage';
import { Transaction, Goal, Bill, Budget } from '../types';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function ModernDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();

    const handleDataUpdate = () => loadData();
    window.addEventListener('transactionAdded', handleDataUpdate);
    window.addEventListener('goalUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('transactionAdded', handleDataUpdate);
      window.removeEventListener('goalUpdated', handleDataUpdate);
    };
  }, []);

  const loadData = () => {
    setTransactions(storage.getTransactions());
    setGoals(storage.getGoals());
    setBills(storage.getBills());
    setBudgets(storage.getBudgets());
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Calculate financial metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

  // Recent transactions (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentTransactions = transactions
    .filter(t => new Date(t.date) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Monthly trend data
  const getLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        income: 0,
        expenses: 0,
        savings: 0
      });
    }

    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthsAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));

      if (monthsAgo >= 0 && monthsAgo < 6) {
        const index = 5 - monthsAgo;
        if (t.type === 'income') {
          months[index].income += t.amount;
        } else {
          months[index].expenses += t.amount;
        }
        months[index].savings = months[index].income - months[index].expenses;
      }
    });

    return months;
  };

  const monthlyData = getLast6Months();

  // Category spending
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  // Financial health score
  const calculateHealthScore = () => {
    let score = 0;

    // Savings rate (40 points)
    if (savingsRate >= 20) score += 40;
    else score += (savingsRate / 20) * 40;

    // Active goals (20 points)
    const activeGoals = goals.filter(g => g.status !== 'achieved').length;
    score += Math.min(activeGoals * 5, 20);

    // Budget adherence (20 points)
    const budgetsOnTrack = budgets.filter(b => {
      const percentage = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
      return percentage <= 100;
    }).length;
    if (budgets.length > 0) {
      score += (budgetsOnTrack / budgets.length) * 20;
    }

    // Paid bills (20 points)
    const paidBills = bills.filter(b => b.paid).length;
    if (bills.length > 0) {
      score += (paidBills / bills.length) * 20;
    } else {
      score += 20;
    }

    return Math.round(score);
  };

  const healthScore = calculateHealthScore();

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-error';
  };

  const getHealthScoreGradient = (score: number) => {
    if (score >= 80) return 'from-success-500 to-success-600';
    if (score >= 60) return 'from-primary-500 to-primary-600';
    if (score >= 40) return 'from-warning-500 to-warning-600';
    return 'from-error-500 to-error-600';
  };

  // Upcoming bills
  const upcomingBills = bills
    .filter(b => !b.paid)
    .slice(0, 3);

  // Goals progress
  const activeGoals = goals
    .filter(g => g.status !== 'achieved')
    .slice(0, 3);

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-border">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Financial Dashboard
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                {(['week', 'month', 'year'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      timeframe === period
                        ? 'bg-white dark:bg-slate-800 shadow-sm text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                className={refreshing ? 'animate-spin' : ''}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Main Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Balance Card */}
          <Card className="card-gradient card-hover bg-gradient-to-br from-primary-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-primary-100 text-sm font-medium mb-2">Total Balance</p>
                  <div className="flex items-center gap-3">
                    {balanceVisible ? (
                      <h3 className="text-4xl font-bold tracking-tight">
                        ${balance.toLocaleString()}
                      </h3>
                    ) : (
                      <div className="flex gap-1">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="w-2 h-8 bg-white/30 rounded" />
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {balanceVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {balance >= 0 ? (
                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                        <ArrowUpRight className="h-3 w-3" />
                        <span className="text-xs font-semibold">
                          {savingsRate.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-error-500/20 px-2 py-1 rounded-full">
                        <ArrowDownRight className="h-3 w-3" />
                        <span className="text-xs font-semibold">Deficit</span>
                      </div>
                    )}
                    <span className="text-xs text-primary-100">savings rate</span>
                  </div>
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Income Card */}
          <Card className="card-hover border-success-200 bg-gradient-to-br from-success-50 to-white dark:from-success-950/20 dark:to-slate-900">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-2">Total Income</p>
                  <h3 className="text-3xl font-bold text-success-600 dark:text-success-400">
                    ${totalIncome.toLocaleString()}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-success-600 dark:text-success-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      +{transactions.filter(t => t.type === 'income').length} transactions
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-xl">
                  <ArrowUpRight className="h-6 w-6 text-success-600 dark:text-success-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Card */}
          <Card className="card-hover border-error-200 bg-gradient-to-br from-error-50 to-white dark:from-error-950/20 dark:to-slate-900">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-2">Total Expenses</p>
                  <h3 className="text-3xl font-bold text-error-600 dark:text-error-400">
                    ${totalExpenses.toLocaleString()}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-error-600 dark:text-error-400">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {transactions.filter(t => t.type === 'expense').length} transactions
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-error-100 dark:bg-error-900/30 rounded-xl">
                  <ArrowDownRight className="h-6 w-6 text-error-600 dark:text-error-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Score Card */}
          <Card className="card-hover border-purple-200 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-slate-900">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-2">Health Score</p>
                  <h3 className={`text-3xl font-bold ${getHealthScoreColor(healthScore)}`}>
                    {healthScore}/100
                  </h3>
                  <div className="w-full bg-muted rounded-full h-2 mt-3">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${getHealthScoreGradient(healthScore)} transition-all duration-1000`}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Income vs Expenses Trend */}
          <Card className="card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Cash Flow Trend</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Last 6 months overview</p>
                </div>
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorIncome)"
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#colorExpenses)"
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Top Spending Categories</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Where your money goes</p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={topCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Transactions */}
          <Card className="lg:col-span-2 card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Your latest transactions</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground">No recent transactions</p>
                  <p className="text-sm text-muted-foreground">Start adding transactions to see them here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          transaction.type === 'income'
                            ? 'bg-success-100 dark:bg-success-900/30'
                            : 'bg-error-100 dark:bg-error-900/30'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-5 w-5 text-success-600 dark:text-success-400" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-error-600 dark:text-error-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{transaction.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-background rounded-full text-muted-foreground">
                              {transaction.category}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transaction.type === 'income' ? 'text-success-600' : 'text-error-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Bills */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning-500" />
                  Upcoming Bills
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBills.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-8 w-8 text-success-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">All bills paid!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingBills.map((bill) => (
                      <div
                        key={bill.id}
                        className="flex items-center justify-between p-3 bg-warning-50 dark:bg-warning-900/10 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{bill.name}</p>
                          <p className="text-xs text-muted-foreground">Due on {bill.dueDate}</p>
                        </div>
                        <p className="font-bold text-warning-600">${bill.amount}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary-500" />
                  Active Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeGoals.length === 0 ? (
                  <div className="text-center py-6">
                    <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                    <p className="text-sm text-muted-foreground">No active goals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeGoals.map((goal) => {
                      const progress = (goal.current / goal.target) * 100;
                      return (
                        <div key={goal.id}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{goal.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {progress.toFixed(0)}%
                            </p>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Insights Banner */}
        <Card className="card-hover bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">AI-Powered Insights</h3>
                  <p className="text-purple-100 mb-4">
                    Based on your spending patterns, you could save an extra $320/month by reducing dining out expenses by 30%.
                  </p>
                  <Button variant="secondary" size="sm" className="bg-white text-purple-600 hover:bg-white/90">
                    View All Insights
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
