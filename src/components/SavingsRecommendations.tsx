import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { storage } from '../utils/storage';
import { recommendationEngine, Recommendation } from '../utils/recommendations';

export function SavingsRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
    // Load completed recommendations from storage
    const saved = localStorage.getItem('completed-recommendations');
    if (saved) {
      setCompletedIds(new Set(JSON.parse(saved)));
    }
  }, []);

  const loadRecommendations = () => {
    const appData = storage.getData();
    const transactions = appData.transactions;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTransactions = transactions.filter(t => new Date(t.date) >= monthStart);

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const recs = recommendationEngine.generateRecommendations(
      monthTransactions,
      income,
      expenses
    );

    setRecommendations(recs);
    setTotalSavings(recommendationEngine.calculateTotalPotentialSavings(recs));
  };

  const markAsCompleted = (id: string) => {
    const newCompleted = new Set(completedIds);
    newCompleted.add(id);
    setCompletedIds(newCompleted);
    localStorage.setItem('completed-recommendations', JSON.stringify([...newCompleted]));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-error/50 bg-error/5';
      case 'medium': return 'border-warning/50 bg-warning/5';
      case 'low': return 'border-primary/50 bg-primary/5';
      default: return 'border-border';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-error/20 text-error';
      case 'medium': return 'bg-warning/20 text-warning';
      case 'low': return 'bg-primary/20 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">AI Savings Coach</h2>
              </div>
              <p className="text-muted-foreground">
                Personalized recommendations to help you save more
              </p>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-4xl font-bold text-primary">
                  ${Math.round(totalSavings).toLocaleString()}
                </span>
                <span className="text-muted-foreground">potential monthly savings</span>
              </div>
            </div>
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {completedIds.size}/{recommendations.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-foreground">
                  {recommendations.filter(r => r.priority === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actionable</p>
                <p className="text-2xl font-bold text-foreground">
                  {recommendations.filter(r => r.actionable).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isCompleted = completedIds.has(rec.id);

          return (
            <Card
              key={rec.id}
              className={`border-2 transition-all ${
                isCompleted
                  ? 'opacity-60 bg-muted/50'
                  : getPriorityColor(rec.priority)
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? 'bg-success/20' : 'bg-primary/20'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <DollarSign className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{rec.title}</h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${getPriorityBadge(
                              rec.priority
                            )}`}
                          >
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground">Save up to</p>
                        <p className="text-lg font-bold text-success">
                          ${Math.round(rec.potentialSavings).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                      <Lightbulb className="h-4 w-4 text-primary flex-shrink-0" />
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Tip:</span> {rec.tip}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCompleted && rec.actionable && (
                        <Button
                          size="sm"
                          onClick={() => markAsCompleted(rec.id)}
                          className="gap-2"
                        >
                          Mark as Completed
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Category: {rec.category}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recommendations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Recommendations Yet
            </h3>
            <p className="text-muted-foreground">
              Add some transactions to get personalized savings recommendations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
