import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  Database,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { demoDataGenerator } from '../utils/demoData';

export function DemoDataManager() {
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleGenerateDemoData = () => {
    if (confirm('This will add demo data to your account. Continue?')) {
      setGenerating(true);

      setTimeout(() => {
        const result = demoDataGenerator.generateAllDemoData();
        setMessage({
          type: 'success',
          text: `Generated ${result.transactions} transactions, ${result.goals} goals, ${result.bills} bills, ${result.budgets} budgets, and ${result.investments} investments!`
        });
        setGenerating(false);

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border animate-in ${
            message.type === 'success'
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-error/10 border-error/20 text-error'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Demo Data Generator
          </CardTitle>
          <CardDescription>
            Quickly populate your account with realistic demo data for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-semibold text-foreground mb-2">What's Included</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  100 realistic transactions (6 months)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  6 financial goals with progress
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  6 recurring bills
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  6 monthly budgets
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  5 investment holdings
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border bg-muted/50">
              <h4 className="font-semibold text-foreground mb-2">Perfect For</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Testing all dashboard features
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Viewing charts and visualizations
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Getting AI-powered insights
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Exploring recommendations
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Testing export features
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleGenerateDemoData}
              disabled={generating}
              className="gap-2"
              size="lg"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Generate Demo Data
                </>
              )}
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Note</p>
                <p className="text-sm text-muted-foreground">
                  Demo data will be added to your existing data. You can clear all data from the Data Management section if needed.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
