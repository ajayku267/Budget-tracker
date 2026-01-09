import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Check, TrendingUp, Target } from 'lucide-react';
import { storage } from '../utils/storage';
import { Goal } from '../types';

interface QuickContributeGoalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickContributeGoal({ onClose, onSuccess }: QuickContributeGoalProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const data = storage.getGoals();
    const activeGoals = data.filter(g => g.status !== 'achieved');
    setGoals(activeGoals);
    if (activeGoals.length > 0) {
      setSelectedGoalId(activeGoals[0].id);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGoalId || !amount || parseFloat(amount) <= 0) {
      alert('Please select a goal and enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    const goal = goals.find(g => g.id === selectedGoalId);
    if (!goal) return;

    const contributionAmount = parseFloat(amount);

    // Update goal progress
    const newCurrent = goal.current + contributionAmount;
    const updates: Partial<Goal> = {
      current: newCurrent
    };

    // Check if goal is now achieved
    if (newCurrent >= goal.target) {
      updates.status = 'achieved';
    }

    storage.updateGoal(selectedGoalId, updates);

    // Create a transaction for this contribution
    const transaction = {
      id: Date.now().toString(),
      name: `Goal Contribution: ${goal.title}`,
      amount: contributionAmount,
      type: 'expense' as const,
      category: goal.category || 'Savings',
      date: new Date().toISOString().split('T')[0],
      description: notes || `Contribution toward ${goal.title}`,
      tags: ['goal-contribution', goal.title.toLowerCase().replace(/\s+/g, '-')]
    };

    storage.addTransaction(transaction);

    // Dispatch events to update other components
    window.dispatchEvent(new CustomEvent('transactionAdded'));
    window.dispatchEvent(new CustomEvent('goalUpdated'));

    // Reset form
    setAmount('');
    setNotes('');
    setIsSubmitting(false);

    // Show success and close
    if (onSuccess) onSuccess();

    setTimeout(() => {
      onClose();
    }, 100);
  };

  const selectedGoal = goals.find(g => g.id === selectedGoalId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md animate-slideIn">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Contribute to Goal
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Goal Selection */}
            <div>
              <Label htmlFor="goal">Select Goal *</Label>
              <select
                id="goal"
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                {goals.length === 0 ? (
                  <option value="">No active goals</option>
                ) : (
                  goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title} (${goal.current.toLocaleString()} / ${goal.target.toLocaleString()})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Goal Progress Display */}
            {selectedGoal && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Progress</span>
                  <span className="font-semibold text-foreground">
                    {((selectedGoal.current / selectedGoal.target) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min((selectedGoal.current / selectedGoal.target) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>${selectedGoal.current.toLocaleString()}</span>
                  <span>${(selectedGoal.target - selectedGoal.current).toLocaleString()} remaining</span>
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Contribution Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                disabled={goals.length === 0}
                className="text-lg font-semibold"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note about this contribution"
                disabled={goals.length === 0}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={isSubmitting || goals.length === 0}
              >
                <Check className="h-4 w-4" />
                {isSubmitting ? 'Contributing...' : 'Contribute'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>

            {goals.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                No active goals available. Create a goal first to make contributions.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
