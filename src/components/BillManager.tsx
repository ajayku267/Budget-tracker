import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  CreditCard,
  Plus,
  Check,
  X,
  AlertCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { storage } from '../utils/storage';
import { Bill } from '../types';

export function BillManager() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    dueDate: '',
    frequency: 'monthly' as const,
    category: 'Bills',
    provider: ''
  });

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = () => {
    const data = storage.getBills();
    setBills(data);
  };

  const handleAddBill = () => {
    if (!newBill.name || !newBill.amount || !newBill.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const bill: Bill = {
      id: Date.now().toString(),
      name: newBill.name,
      amount: parseFloat(newBill.amount),
      dueDate: newBill.dueDate,
      frequency: newBill.frequency,
      paid: false,
      createdAt: new Date().toISOString(),
      autopay: false,
      reminderDays: 3,
      category: newBill.category,
      provider: newBill.provider || undefined
    };

    storage.addBill(bill);
    setNewBill({
      name: '',
      amount: '',
      dueDate: '',
      frequency: 'monthly',
      category: 'Bills',
      provider: ''
    });
    setShowAddForm(false);
    loadBills();
  };

  const handlePayBill = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    // Mark as paid
    storage.updateBill(billId, { paid: true });

    // Add as transaction
    const transaction = {
      id: Date.now().toString(),
      name: `Bill Payment: ${bill.name}`,
      amount: bill.amount,
      type: 'expense' as const,
      category: bill.category || 'Bills',
      date: new Date().toISOString().split('T')[0],
      description: `Payment for ${bill.name} - ${bill.provider || 'recurring bill'}`
    };

    storage.addTransaction(transaction);
    loadBills();

    // Trigger transaction update
    window.dispatchEvent(new CustomEvent('transactionAdded'));
  };

  const handleTogglePaid = (billId: string, currentStatus: boolean) => {
    storage.updateBill(billId, { paid: !currentStatus });
    loadBills();
  };

  const handleDeleteBill = (billId: string) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      storage.deleteBill(billId);
      loadBills();
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(today.getFullYear(), today.getMonth(), parseInt(dueDate));

    if (due < today) {
      due.setMonth(due.getMonth() + 1);
    }

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getBillStatus = (bill: Bill) => {
    if (bill.paid) return 'paid';

    const daysUntil = getDaysUntilDue(bill.dueDate);

    if (daysUntil < 0) return 'overdue';
    if (daysUntil === 0) return 'due-today';
    if (daysUntil <= 3) return 'due-soon';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success/10 text-success border-success/20';
      case 'overdue': return 'bg-error/10 text-error border-error/20';
      case 'due-today': return 'bg-warning/10 text-warning border-warning/20';
      case 'due-soon': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (bill: Bill) => {
    const status = getBillStatus(bill);
    if (status === 'paid') return 'Paid';

    const daysUntil = getDaysUntilDue(bill.dueDate);

    if (status === 'overdue') return 'Overdue';
    if (status === 'due-today') return 'Due Today';
    if (status === 'due-soon') return `Due in ${daysUntil} days`;
    return `Due on ${bill.dueDate}`;
  };

  const unpaidBills = bills.filter(b => !b.paid);
  const paidBills = bills.filter(b => b.paid);
  const totalDue = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-error" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unpaid Bills</p>
                <p className="text-2xl font-bold text-foreground">{unpaidBills.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Due</p>
                <p className="text-2xl font-bold text-foreground">${totalDue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Bills</p>
                <p className="text-2xl font-bold text-foreground">{paidBills.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Bill Button */}
      {!showAddForm && (
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Bill
        </Button>
      )}

      {/* Add Bill Form */}
      {showAddForm && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>Add New Bill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="billName">Bill Name *</Label>
                <Input
                  id="billName"
                  value={newBill.name}
                  onChange={(e) => setNewBill({...newBill, name: e.target.value})}
                  placeholder="e.g., Electric Bill"
                />
              </div>

              <div>
                <Label htmlFor="billAmount">Amount *</Label>
                <Input
                  id="billAmount"
                  type="number"
                  step="0.01"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date (Day of Month) *</Label>
                <Input
                  id="dueDate"
                  type="number"
                  min="1"
                  max="31"
                  value={newBill.dueDate}
                  onChange={(e) => setNewBill({...newBill, dueDate: e.target.value})}
                  placeholder="15"
                />
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <select
                  id="frequency"
                  value={newBill.frequency}
                  onChange={(e) => setNewBill({...newBill, frequency: e.target.value as any})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <Label htmlFor="provider">Provider (Optional)</Label>
                <Input
                  id="provider"
                  value={newBill.provider}
                  onChange={(e) => setNewBill({...newBill, provider: e.target.value})}
                  placeholder="e.g., Power Company"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newBill.category}
                  onChange={(e) => setNewBill({...newBill, category: e.target.value})}
                  placeholder="Bills"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddBill} className="gap-2">
                <Check className="h-4 w-4" />
                Add Bill
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bills List */}
      <div className="space-y-3">
        {bills.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No bills yet. Add your first bill to track payments and due dates.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {unpaidBills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Unpaid Bills</h3>
                <div className="space-y-2">
                  {unpaidBills.map((bill) => {
                    const status = getBillStatus(bill);
                    return (
                      <Card key={bill.id} className={`border-2 ${getStatusColor(status)}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-primary" />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground">{bill.name}</h3>
                                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(status)}`}>
                                    {getStatusLabel(bill)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  <span>{bill.frequency}</span>
                                  {bill.provider && <span>• {bill.provider}</span>}
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Due on {bill.dueDate}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <p className="text-xl font-bold text-foreground">
                                ${bill.amount.toLocaleString()}
                              </p>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handlePayBill(bill.id)}
                                  className="gap-2"
                                >
                                  <Check className="h-4 w-4" />
                                  Pay Now
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteBill(bill.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {paidBills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Paid Bills</h3>
                <div className="space-y-2">
                  {paidBills.map((bill) => (
                    <Card key={bill.id} className="opacity-60">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                              <Check className="h-5 w-5 text-success" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">{bill.name}</h3>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                                  Paid
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span>{bill.frequency}</span>
                                {bill.provider && <span>• {bill.provider}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <p className="text-xl font-bold text-foreground">
                              ${bill.amount.toLocaleString()}
                            </p>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTogglePaid(bill.id, bill.paid)}
                              >
                                Mark Unpaid
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteBill(bill.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
