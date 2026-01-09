import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  TrendingUp, 
  PiggyBank,
  X,
  Check,
  Bell,
  Calendar,
  Target,
  CreditCard,
  Wallet,
  AlertCircle
} from 'lucide-react';
import { storage } from '../utils/storage';
import { notifications } from '../utils/notifications';
import { Transaction } from '../types';

interface QuickTransaction {
  type: 'income' | 'expense';
  amount: string;
  category: string;
  description: string;
}

interface QuickGoal {
  name: string;
  targetAmount: string;
  deadline: string;
  category: string;
}

interface QuickBill {
  name: string;
  amount: string;
  dueDate: string;
  frequency: string;
}

export function Dashboard() {
  const [data, setData] = useState(storage.getData());
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [quickTransaction, setQuickTransaction] = useState<QuickTransaction>({
    type: 'expense',
    amount: '',
    category: '',
    description: ''
  });
  const [quickGoal, setQuickGoal] = useState<QuickGoal>({
    name: '',
    targetAmount: '',
    deadline: '',
    category: ''
  });
  const [quickBill, setQuickBill] = useState<QuickBill>({
    name: '',
    amount: '',
    dueDate: '',
    frequency: 'monthly'
  });
  const [transferData, setTransferData] = useState({
    from: '',
    to: '',
    amount: '',
    description: ''
  });

  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];
  const expenseCategories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Housing', 'Other'];
  const goalCategories = ['Emergency Fund', 'Vacation', 'Car', 'Home', 'Education', 'Retirement', 'Other'];

  useEffect(() => {
    const interval = setInterval(() => {
      setData(storage.getData());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickTransaction = () => {
    if (!quickTransaction.amount || !quickTransaction.category) {
      notifications.addNotification({
        title: 'Missing Information',
        message: 'Please fill in all required fields',
        type: 'error',
        category: 'system',
        priority: 'medium'
      });
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      name: quickTransaction.description || quickTransaction.category,
      amount: parseFloat(quickTransaction.amount),
      type: quickTransaction.type,
      category: quickTransaction.category,
      date: new Date().toISOString(),
      description: quickTransaction.description
    };

    storage.addTransaction(transaction);
    notifications.notifyTransaction(transaction);
    
    notifications.addNotification({
      title: 'Transaction Added',
      message: `${quickTransaction.type === 'income' ? 'Income' : 'Expense'} of $${quickTransaction.amount} has been recorded`,
      type: 'success',
      category: 'transaction',
      priority: 'low'
    });

    setQuickTransaction({ type: 'expense', amount: '', category: '', description: '' });
    setShowAddTransaction(false);
    setData(storage.getData());
  };

  const handleQuickGoal = () => {
    if (!quickGoal.name || !quickGoal.targetAmount || !quickGoal.deadline) {
      notifications.addNotification({
        title: 'Missing Information',
        message: 'Please fill in all required fields',
        type: 'error',
        category: 'system',
        priority: 'medium'
      });
      return;
    }

    const goal = {
      id: Date.now().toString(),
      name: quickGoal.name,
      targetAmount: parseFloat(quickGoal.targetAmount),
      currentAmount: 0,
      deadline: quickGoal.deadline,
      category: quickGoal.category,
      createdAt: new Date().toISOString()
    };

    storage.addGoal(goal);
    
    notifications.addNotification({
      title: 'Goal Created',
      message: `New goal "${quickGoal.name}" has been created`,
      type: 'success',
      category: 'goal',
      priority: 'medium',
      actionUrl: '/goals',
      actionText: 'View Goal'
    });

    setQuickGoal({ name: '', targetAmount: '', deadline: '', category: '' });
    setShowAddGoal(false);
    setData(storage.getData());
  };

  const handleQuickBill = () => {
    if (!quickBill.name || !quickBill.amount || !quickBill.dueDate) {
      notifications.addNotification({
        title: 'Missing Information',
        message: 'Please fill in all required fields',
        type: 'error',
        category: 'system',
        priority: 'medium'
      });
      return;
    }

    const bill = {
      id: Date.now().toString(),
      name: quickBill.name,
      amount: parseFloat(quickBill.amount),
      dueDate: quickBill.dueDate,
      frequency: quickBill.frequency,
      paid: false,
      createdAt: new Date().toISOString()
    };

    storage.addBill(bill);
    
    notifications.addNotification({
      title: 'Bill Added',
      message: `New bill "${quickBill.name}" has been added`,
      type: 'success',
      category: 'bill',
      priority: 'medium',
      actionUrl: '/transaction',
      actionText: 'View Bills'
    });

    setQuickBill({ name: '', amount: '', dueDate: '', frequency: 'monthly' });
    setShowAddBill(false);
    setData(storage.getData());
  };

  const handleTransfer = () => {
    if (!transferData.from || !transferData.to || !transferData.amount) {
      notifications.addNotification({
        title: 'Missing Information',
        message: 'Please fill in all required fields',
        type: 'error',
        category: 'system',
        priority: 'medium'
      });
      return;
    }

    const amount = parseFloat(transferData.amount);
    
    // Create withdrawal transaction
    const withdrawal: Transaction = {
      id: Date.now().toString(),
      name: `Transfer to ${transferData.to}`,
      amount: amount,
      type: 'expense',
      category: 'Transfer',
      date: new Date().toISOString(),
      description: transferData.description
    };

    // Create deposit transaction
    const deposit: Transaction = {
      id: (Date.now() + 1).toString(),
      name: `Transfer from ${transferData.from}`,
      amount: amount,
      type: 'income',
      category: 'Transfer',
      date: new Date().toISOString(),
      description: transferData.description
    };

    storage.addTransaction(withdrawal);
    storage.addTransaction(deposit);
    
    notifications.addNotification({
      title: 'Transfer Completed',
      message: `$${amount} transferred from ${transferData.from} to ${transferData.to}`,
      type: 'success',
      category: 'transaction',
      priority: 'medium'
    });

    setTransferData({ from: '', to: '', amount: '', description: '' });
    setShowTransfer(false);
    setData(storage.getData());
  };

  const calculateBalance = () => {
    const income = data.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = data.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return income - expenses;
  };

  const calculateMonthlyIncome = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return data.transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateMonthlyExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return data.transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getUpcomingBills = () => {
    const today = new Date();
    const currentDay = today.getDate();
    return data.bills
      .filter(bill => !bill.paid)
      .sort((a, b) => parseInt(a.dueDate) - parseInt(b.dueDate))
      .slice(0, 3);
  };

  const getRecentTransactions = () => {
    return data.transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const balance = calculateBalance();
  const monthlyIncome = calculateMonthlyIncome();
  const monthlyExpenses = calculateMonthlyExpenses();
  const upcomingBills = getUpcomingBills();
  const recentTransactions = getRecentTransactions();

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-auto" style={{ fontFamily: 'Gilroy, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Dashboard</h1>
        <p className="text-gray-600 text-lg">Welcome back! Here's your financial overview</p>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-white font-semibold mb-4 text-lg">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => setShowAddTransaction(true)}
              className="bg-white text-blue-600 hover:bg-gray-100 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
            <Button
              onClick={() => setShowAddGoal(true)}
              className="bg-white text-blue-600 hover:bg-gray-100 font-medium"
            >
              <Target className="w-4 h-4 mr-2" />
              New Goal
            </Button>
            <Button
              onClick={() => setShowAddBill(true)}
              className="bg-white text-blue-600 hover:bg-gray-100 font-medium"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Add Bill
            </Button>
            <Button
              onClick={() => setShowTransfer(true)}
              className="bg-white text-blue-600 hover:bg-gray-100 font-medium"
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Transfer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Balance</p>
                <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${balance.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Income</p>
                <p className="text-3xl font-bold mt-2 text-green-600">
                  ${monthlyIncome.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <ArrowUpRight className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Expenses</p>
                <p className="text-3xl font-bold mt-2 text-red-600">
                  ${monthlyExpenses.toFixed(2)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <ArrowDownRight className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.name}</p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Upcoming Bills</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBills.length > 0 ? (
              <div className="space-y-3">
                {upcomingBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-900">{bill.name}</p>
                      <p className="text-sm text-gray-500">Due {bill.dueDate}</p>
                    </div>
                    <p className="font-semibold text-red-600">
                      ${bill.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming bills</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Quick Add Transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select value={quickTransaction.type} onValueChange={(value: any) => setQuickTransaction({...quickTransaction, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={quickTransaction.amount}
                  onChange={(e) => setQuickTransaction({...quickTransaction, amount: e.target.value})}
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select value={quickTransaction.category} onValueChange={(value) => setQuickTransaction({...quickTransaction, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(quickTransaction.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description (Optional)</Label>
                <Input
                  placeholder="Enter description"
                  value={quickTransaction.description}
                  onChange={(e) => setQuickTransaction({...quickTransaction, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddTransaction(false)}>
                  Cancel
                </Button>
                <Button onClick={handleQuickTransaction} className="bg-blue-600 hover:bg-blue-700">
                  Add Transaction
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create New Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Goal Name</Label>
                <Input
                  placeholder="Enter goal name"
                  value={quickGoal.name}
                  onChange={(e) => setQuickGoal({...quickGoal, name: e.target.value})}
                />
              </div>

              <div>
                <Label>Target Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={quickGoal.targetAmount}
                  onChange={(e) => setQuickGoal({...quickGoal, targetAmount: e.target.value})}
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select value={quickGoal.category} onValueChange={(value) => setQuickGoal({...quickGoal, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={quickGoal.deadline}
                  onChange={(e) => setQuickGoal({...quickGoal, deadline: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddGoal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleQuickGoal} className="bg-blue-600 hover:bg-blue-700">
                  Create Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add New Bill</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Bill Name</Label>
                <Input
                  placeholder="Enter bill name"
                  value={quickBill.name}
                  onChange={(e) => setQuickBill({...quickBill, name: e.target.value})}
                />
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={quickBill.amount}
                  onChange={(e) => setQuickBill({...quickBill, amount: e.target.value})}
                />
              </div>

              <div>
                <Label>Due Date (Day of Month)</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1-31"
                  value={quickBill.dueDate}
                  onChange={(e) => setQuickBill({...quickBill, dueDate: e.target.value})}
                />
              </div>

              <div>
                <Label>Frequency</Label>
                <Select value={quickBill.frequency} onValueChange={(value) => setQuickBill({...quickBill, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddBill(false)}>
                  Cancel
                </Button>
                <Button onClick={handleQuickBill} className="bg-blue-600 hover:bg-blue-700">
                  Add Bill
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Transfer Money</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>From Account</Label>
                <Select value={transferData.from} onValueChange={(value) => setTransferData({...transferData, from: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Checking">Checking Account</SelectItem>
                    <SelectItem value="Savings">Savings Account</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>To Account</Label>
                <Select value={transferData.to} onValueChange={(value) => setTransferData({...transferData, to: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Checking">Checking Account</SelectItem>
                    <SelectItem value="Savings">Savings Account</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                />
              </div>

              <div>
                <Label>Description (Optional)</Label>
                <Input
                  placeholder="Enter description"
                  value={transferData.description}
                  onChange={(e) => setTransferData({...transferData, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowTransfer(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTransfer} className="bg-blue-600 hover:bg-blue-700">
                  Transfer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}