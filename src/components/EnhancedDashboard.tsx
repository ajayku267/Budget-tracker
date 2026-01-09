import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Target,
  PiggyBank,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  TrendingUpIcon,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ComposedChart,
} from 'recharts';
import { storage } from '../utils/storage';

interface DashboardStats {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  healthScore: number;
  trend: 'up' | 'down';
  trendPercentage: number;
}

export function EnhancedDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
    savingsRate: 0,
    healthScore: 0,
    trend: 'up',
    trendPercentage: 0,
  });

  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [spendingTrend, setSpendingTrend] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  const loadDashboardData = () => {
    const appData = storage.getData();
    const transactions = appData.transactions;
    const goals = appData.goals;
    const budgets = appData.budgets;

    // Calculate date range based on timeframe
    const now = new Date();
    const startDate = new Date();
    if (timeframe === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Filter transactions for timeframe
    const periodTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= now;
    });

    const income = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // Calculate financial health score
    const healthScore = calculateHealthScore(income, expenses, savings, goals, budgets);

    // Get previous period for trend
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(startDate);
    if (timeframe === 'week') {
      prevStartDate.setDate(prevStartDate.getDate() - 7);
    } else if (timeframe === 'month') {
      prevStartDate.setMonth(prevStartDate.getMonth() - 1);
    } else {
      prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
    }

    const prevTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= prevStartDate && date < startDate;
    });

    const prevIncome = prevTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const prevExpenses = prevTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const prevSavings = prevIncome - prevExpenses;
    const trendPercentage = prevSavings > 0
      ? ((savings - prevSavings) / prevSavings) * 100
      : 0;

    setStats({
      balance: income - expenses,
      income,
      expenses,
      savings,
      savingsRate,
      healthScore,
      trend: savings >= prevSavings ? 'up' : 'down',
      trendPercentage: Math.abs(trendPercentage),
    });

    // Generate monthly trend data
    const months = storage.getMonthlyTrends(6);
    setMonthlyData(months);

    // Category breakdown
    const categoryTotals = storage.getTransactionsByCategory(timeframe);
    const categoryArray = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      percentage: expenses > 0 ? ((value as number / expenses) * 100).toFixed(1) : 0,
    }));
    setCategoryData(categoryArray.slice(0, 6));

    // Spending trend (last 7 days)
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.toDateString() === date.toDateString();
      });
      const dayExpenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      trendData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dayExpenses,
      });
    }
    setSpendingTrend(trendData);
  };

  const calculateHealthScore = (income: number, expenses: number, savings: number, goals: any[], budgets: any[]) => {
    let score = 50; // Base score

    // Savings rate (0-30 points)
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    if (savingsRate >= 30) score += 30;
    else if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 10;

    // Budget adherence (0-20 points)
    const budgetScore = budgets.reduce((sum, budget) => {
      const adherence = budget.amount > 0 ? ((budget.amount - budget.spent) / budget.amount) * 100 : 0;
      return sum + (adherence >= 0 ? 1 : 0);
    }, 0);
    score += Math.min(20, (budgetScore / Math.max(budgets.length, 1)) * 20);

    // Goal progress (0-20 points)
    const goalProgress = goals.reduce((sum, goal) => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      return sum + progress;
    }, 0);
    score += Math.min(20, (goalProgress / Math.max(goals.length, 1)) * 0.2);

    // Expense control (0-15 points)
    if (expenses < income * 0.5) score += 15;
    else if (expenses < income * 0.7) score += 10;
    else if (expenses < income * 0.9) score += 5;

    return Math.min(100, Math.round(score));
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Financial Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your financial health and progress</p>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-2 bg-muted rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeframe(tf)}
                  className="capitalize"
                >
                  {tf}
                </Button>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Net Balance</p>
                  <h3 className="text-2xl font-bold text-foreground">
                    ${stats.balance.toLocaleString()}
                  </h3>
                  <div className="flex items-center gap-1 text-xs">
                    {stats.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 text-success" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-error" />
                    )}
                    <span className={stats.trend === 'up' ? 'text-success' : 'text-error'}>
                      {stats.trendPercentage.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">vs last {timeframe}</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Income</p>
                  <h3 className="text-2xl font-bold text-success">
                    +${stats.income.toLocaleString()}
                  </h3>
                  <p className="text-xs text-muted-foreground">This {timeframe}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Expenses</p>
                  <h3 className="text-2xl font-bold text-error">
                    -${stats.expenses.toLocaleString()}
                  </h3>
                  <p className="text-xs text-muted-foreground">This {timeframe}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-error" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-foreground">{stats.healthScore}</h3>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div
                      className="bg-gradient-to-r from-error via-warning to-success h-1.5 rounded-full transition-all"
                      style={{ width: `${stats.healthScore}%` }}
                    />
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Income vs Expenses Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>Last 6 months comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Spending Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Daily Spending Trend</CardTitle>
              <CardDescription>Last 7 days spending pattern</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={spendingTrend}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Great Savings Rate!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your savings rate of {stats.savingsRate.toFixed(1)}% is {stats.savingsRate >= 20 ? 'excellent' : 'good'}. Keep it up!
                </p>
              </div>
            </div>

            {stats.expenses > stats.income * 0.8 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Watch Your Spending</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You're spending {((stats.expenses / stats.income) * 100).toFixed(0)}% of your income. Consider reducing discretionary expenses.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Smart Tip</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on your spending patterns, you could save an extra ${Math.round(stats.expenses * 0.15)} by cutting unnecessary expenses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
