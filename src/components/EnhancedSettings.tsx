import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { DataManagement } from './DataManagement';
import { DemoDataManager } from './DemoDataManager';
import { SavingsRecommendations } from './SavingsRecommendations';
import { BillManager } from './BillManager';
import { BudgetTracker } from './BudgetTracker';
import {
  Settings as SettingsIcon,
  Database,
  Download,
  Sparkles,
  User,
  Shield,
  Bell,
  CreditCard,
  DollarSign,
  Receipt,
} from 'lucide-react';

interface EnhancedSettingsProps {
  activeView: string;
}

export function EnhancedSettings({ activeView }: EnhancedSettingsProps) {
  const [activeTab, setActiveTab] = useState(activeView === 'settings' ? 'data' : activeView);

  const tabs = [
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'demo', label: 'Demo Data', icon: Sparkles },
    { id: 'export', label: 'Export & Import', icon: Download },
    { id: 'recommendations', label: 'Savings Coach', icon: Sparkles },
    { id: 'bills', label: 'Bill Manager', icon: CreditCard },
    { id: 'budgets', label: 'Budget Tracker', icon: DollarSign },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'data':
      case 'export':
        return <DataManagement />;
      case 'demo':
        return <DemoDataManager />;
      case 'recommendations':
        return <SavingsRecommendations />;
      case 'bills':
        return <BillManager />;
      case 'budgets':
        return <BudgetTracker />;
      default:
        return <DataManagement />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your data, preferences, and get personalized recommendations
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
