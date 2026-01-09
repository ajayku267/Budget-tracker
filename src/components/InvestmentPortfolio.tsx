import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  PieChart,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Shield
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storage } from '../utils/storage';

export function InvestmentPortfolio() {
  const [investments, setInvestments] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [totalReturn, setTotalReturn] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = () => {
    const data = storage.getData();
    const investments = data.investments || [];
    setInvestments(investments);
    
    const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalCost = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const returnPercentage = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
    
    setPortfolioValue(totalValue);
    setTotalReturn(returnPercentage);
  };

  const portfolioData = [
    { name: 'Stocks', value: 45, color: '#3B82F6' },
    { name: 'Bonds', value: 25, color: '#10B981' },
    { name: 'Real Estate', value: 20, color: '#F59E0B' },
    { name: 'Crypto', value: 10, color: '#8B5CF6' }
  ];

  const performanceData = [
    { month: 'Jan', value: 10000 },
    { month: 'Feb', value: 10500 },
    { month: 'Mar', value: 11200 },
    { month: 'Apr', value: 10800 },
    { month: 'May', value: 11500 },
    { month: 'Jun', value: 12300 }
  ];

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investment Portfolio</h1>
            <p className="text-gray-600 mt-2">Track and manage your investments</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Investment
          </Button>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 opacity-80" />
                <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                  {totalReturn >= 0 ? 'Profit' : 'Loss'}
                </span>
              </div>
              <p className="text-sm opacity-90 mb-1">Total Portfolio Value</p>
              <p className="text-2xl font-bold">${portfolioValue.toFixed(2)}</p>
              <div className="flex items-center mt-2 text-sm">
                {totalReturn >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                <span>{totalReturn.toFixed(2)}% total return</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                  +15.3%
                </span>
              </div>
              <p className="text-sm opacity-90 mb-1">Monthly Gain</p>
              <p className="text-2xl font-bold">+${(portfolioValue * 0.153).toFixed(2)}</p>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 opacity-80" />
                <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                  Moderate
                </span>
              </div>
              <p className="text-sm opacity-90 mb-1">Risk Level</p>
              <p className="text-2xl font-bold">Balanced</p>
              <div className="flex items-center mt-2 text-sm">
                <Target className="w-4 h-4 mr-1" />
                <span>Diversified portfolio</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Portfolio Performance */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Portfolio Performance</span>
              </CardTitle>
              <CardDescription>6-month performance trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Asset Allocation */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5" />
                <span>Asset Allocation</span>
              </CardTitle>
              <CardDescription>Diversification breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {portfolioData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment List */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Your Investments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Investment</th>
                    <th className="text-left p-4 font-medium text-gray-700">Type</th>
                    <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                    <th className="text-left p-4 font-medium text-gray-700">Current Value</th>
                    <th className="text-right p-4 font-medium text-gray-700">Return</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((investment: any) => (
                    <tr key={investment.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{investment.name}</p>
                          <p className="text-sm text-gray-500">{new Date(investment.date).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {investment.type}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">${investment.amount.toFixed(2)}</td>
                      <td className="p-4 text-gray-900">${investment.currentValue.toFixed(2)}</td>
                      <td className={`p-4 text-right font-medium ${
                        investment.currentValue >= investment.amount ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {investment.currentValue >= investment.amount ? '+' : ''}
                        {((investment.currentValue - investment.amount) / investment.amount * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {investments.length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No investments yet</p>
                  <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                    Add Your First Investment
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Investment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Investment</CardTitle>
              <CardDescription>Enter investment details</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Investment Name</Label>
                  <Input id="name" placeholder="e.g., Apple Stock" />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stocks">Stocks</SelectItem>
                      <SelectItem value="bonds">Bonds</SelectItem>
                      <SelectItem value="real-estate">Real Estate</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="mutual-funds">Mutual Funds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount Invested</Label>
                  <Input id="amount" type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="currentValue">Current Value</Label>
                  <Input id="currentValue" type="number" placeholder="0.00" />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Investment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}