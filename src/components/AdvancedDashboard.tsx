import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Eye
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storage } from '../utils/storage';

export function AdvancedDashboard() {
  const [data, setData] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
    investments: 0,
    goals: [],
    transactions: [],
    budgets: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const appData = storage.getData();
    const transactions = appData.transactions;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const investments = appData.investments.reduce((sum, inv) => sum + inv.currentValue, 0);

    setData({
      balance: income - expenses,
      income,
      expenses,
      savings: Math.max(0, income - expenses),
      investments,
      goals: appData.goals,
      transactions: monthlyTransactions,
      budgets: appData.budgets
    });
    setLoading(false);
  };

  // Sample chart data
  const spendingData = [
    { name: 'Mon', amount: 240 },
    { name: 'Tue', amount: 139 },
    { name: 'Wed', amount: 380 },
    { name: 'Thu', amount: 390 },
    { name: 'Fri', amount: 480 },
    { name: 'Sat', amount: 380 },
    { name: 'Sun', amount: 430 }
  ];

  const categoryData = [
    { name: 'Food', value: 400, color: '#3B82F6' },
    { name: 'Transport', value: 300, color: '#10B981' },
    { name: 'Shopping', value: 300, color: '#F59E0B' },
    { name: 'Bills', value: 200, color: '#EF4444' },
    { name: 'Other', value: 150, color: '#8B5CF6' }
  ];

  const monthlyTrend = [
    { month: 'Jan', income: 4000, expenses: 2400 },
    { month: 'Feb', income: 4200, expenses: 2800 },
    { month: 'Mar', income: 4500, expenses: 2600 },
    { month: 'Apr', income: 4800, expenses: 2900 },
    { month: 'May', income: 5200, expenses: 3100 },
    { month: 'Jun', income: 5500, expenses: 3200 }
  ];

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              This Month
            </Button>
            <Button>
              <Eye className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 opacity-80" />
                <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                  {data.balance >= 0 ? 'Positive' : 'Negative'}
                </span>
              </div>
              <p className="text-sm opacity-90 mb-1">Current Balance</p>
              <p className="text-2xl font-bold">${data.balance.toFixed(2)}</p>
              <div className="flex items-center mt-2 text-sm">
                {data.balance >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                <span>{Math.abs(data.balance / data.income * 100).toFixed(1)}% of income</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                  +12.5%
                </span>
              </div>
              <p className="text-sm opacity-90 mb-1">Total Income</p>
              <p className="text-2xl font-bold">${data.income.toFixed(2)}</p>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingDown className="w-8 h-8 opacity-80" />
                <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                  -8.2%
                </span>
              </div>
              <p className="text-sm opacity-90 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold">${data.expenses.toFixed(2)}</p>
              <div className="flex items-center mt-2 text-sm">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                <span>vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 opacity-80" />
                <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                  {data.goals.length} Active
                </span>
              </div>
              <p className="text-sm opacity-90 mb-1">Total Savings</p>
              <p className="text-2xl font-bold">${data.savings.toFixed(2)}</p>
              <div className="flex items-center mt-2 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>On track</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spending Trend */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Weekly Spending</span>
              </CardTitle>
              <CardDescription>Your spending pattern this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Area type="monotone" dataKey="amount" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5" />
                <span>Spending by Category</span>
              </CardTitle>
              <CardDescription>Where your money goes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend */}
        <Card className="bg-white border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Income vs Expenses Trend</span>
            </CardTitle>
            <CardDescription>6-month financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm">Add Transaction</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Target className="w-6 h-6" />
                  <span className="text-sm">Create Goal</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm">View Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm">Schedule Bill</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>Recent Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bill Payment Due</p>
                    <p className="text-xs text-gray-600">Electricity bill due in 3 days</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Goal Achieved</p>
                    <p className="text-xs text-gray-600">Emergency fund target reached!</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Investment Update</p>
                    <p className="text-xs text-gray-600">Portfolio up 5.2% this month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}