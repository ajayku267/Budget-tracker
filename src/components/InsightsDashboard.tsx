import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const monthlyData = [
  { month: 'Jan', income: 5000, expenses: 3200, savings: 1800 },
  { month: 'Feb', income: 5200, expenses: 3400, savings: 1800 },
  { month: 'Mar', income: 5000, expenses: 3500, savings: 1500 },
  { month: 'Apr', income: 5500, expenses: 3300, savings: 2200 },
  { month: 'May', income: 5000, expenses: 3000, savings: 2000 },
  { month: 'Jun', income: 5300, expenses: 2800, savings: 2500 },
];

const categoryData = [
  { name: 'Housing', value: 1200, color: '#3b82f6' },
  { name: 'Food', value: 600, color: '#10b981' },
  { name: 'Transport', value: 400, color: '#f59e0b' },
  { name: 'Entertainment', value: 300, color: '#8b5cf6' },
  { name: 'Utilities', value: 200, color: '#ef4444' },
  { name: 'Other', value: 300, color: '#6b7280' },
];

const forecastData = [
  { month: 'Jul', projected: 2200, actual: null },
  { month: 'Aug', projected: 2300, actual: null },
  { month: 'Sep', projected: 2400, actual: null },
  { month: 'Oct', projected: 2500, actual: null },
  { month: 'Nov', projected: 2600, actual: null },
  { month: 'Dec', projected: 2700, actual: null },
];

export function InsightsDashboard() {
  const avgMonthlySavings = monthlyData.reduce((sum, m) => sum + m.savings, 0) / monthlyData.length;
  const totalExpenses = monthlyData[monthlyData.length - 1].expenses;
  const savingsRate = (avgMonthlySavings / 5000) * 100;

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-auto" style={{ fontFamily: 'Gilroy, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Financial Insights</h1>
        <p className="text-gray-600 text-lg">AI-powered analysis of your financial patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              Avg Monthly Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${avgMonthlySavings.toFixed(0)}</div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+12% vs last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-600" />
              Savings Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{savingsRate.toFixed(1)}%</div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">Above target</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-purple-600" />
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">-8% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
              Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">Low</div>
            <div className="text-sm text-gray-600 mt-2">Financial health is good</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Income vs Expenses Trend</CardTitle>
            <CardDescription>6-month financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Expense Categories</CardTitle>
            <CardDescription>Current month breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
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
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-xs text-gray-600">{cat.name}: ${cat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Forecast */}
      <Card className="bg-white border-0 shadow-sm mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Savings Forecast</CardTitle>
          <CardDescription>Projected savings based on current patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="projected" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Automated Reminders Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Smart Reminders</CardTitle>
          <CardDescription>Automated alerts to keep you on track</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-semibold text-sm">Monthly Review</span>
              </div>
              <p className="text-xs text-gray-600">Review your progress on the 1st of each month</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-green-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-semibold text-sm">Goal Milestone</span>
              </div>
              <p className="text-xs text-gray-600">Celebrate when you reach 50% of your goal</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-orange-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
                <span className="font-semibold text-sm">Budget Alert</span>
              </div>
              <p className="text-xs text-gray-600">Get notified when spending exceeds 80% of budget</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}