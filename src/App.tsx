import { useState, useEffect } from 'react';
import { PremiumSidebar } from './components/PremiumSidebar';
import { ModernDashboard } from './components/ModernDashboard';
import { EnhancedTransactions } from './components/EnhancedTransactions';
import { GoalsDashboard } from './components/GoalsDashboard';
import { AIInsights } from './components/AIInsights';
import { EnhancedSettings } from './components/EnhancedSettings';
import { ProfileSetup } from './components/ProfileSetup';
import { BillManager } from './components/BillManager';
import { InvestmentPortfolio } from './components/InvestmentPortfolio';
import { FloatingActionButton } from './components/FloatingActionButton';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';
import { ToastContainer } from './components/NotificationCenter';
import { notifications } from './utils/notifications';
import { storage } from './utils/storage';
import { RecurringTransactionManager } from './utils/recurringTransactions';
import { KeyboardShortcutsManager, createShortcut } from './utils/keyboardShortcuts';

function App() {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  useEffect(() => {
    // Check if user profile exists
    const profile = storage.getProfile();
    if (!profile) {
      setShowProfileSetup(true);
    }

    // Initialize recurring transaction automation
    RecurringTransactionManager.checkAndProcessRecurring();
    RecurringTransactionManager.resetMonthlyBills();

    // Initialize keyboard shortcuts
    KeyboardShortcutsManager.initialize();

    // Register shortcuts
    KeyboardShortcutsManager.register(
      'quickAdd',
      createShortcut('n', 'Quick Add Transaction/Goal', () => {
        window.dispatchEvent(new CustomEvent('openQuickAdd'));
      })
    );

    KeyboardShortcutsManager.register(
      'dashboard',
      createShortcut('d', 'Go to Dashboard', () => setActiveItem('dashboard'))
    );

    KeyboardShortcutsManager.register(
      'transactions',
      createShortcut('t', 'Go to Transactions', () => setActiveItem('transactions'))
    );

    KeyboardShortcutsManager.register(
      'goals',
      createShortcut('g', 'Go to Goals', () => setActiveItem('goals'))
    );

    KeyboardShortcutsManager.register(
      'bills',
      createShortcut('b', 'Go to Bills', () => setActiveItem('bills'))
    );

    KeyboardShortcutsManager.register(
      'settings',
      createShortcut('s', 'Go to Settings', () => setActiveItem('settings'))
    );

    KeyboardShortcutsManager.register(
      'help',
      createShortcut('/', 'Show Keyboard Shortcuts', () => setShowShortcutsHelp(true))
    );

    KeyboardShortcutsManager.register(
      'escape',
      createShortcut('Escape', 'Close Modal/Dialog', () => {
        setShowShortcutsHelp(false);
      }, { ctrl: false })
    );

    // Listen for recurring bill notifications
    const handleRecurringBillDue = (event: CustomEvent) => {
      notifications.addNotification({
        title: 'Bill Due',
        message: event.detail.message,
        type: 'warning',
        category: 'bill',
        priority: 'high'
      });
    };

    const handleAutoPaidBill = (event: CustomEvent) => {
      notifications.addNotification({
        title: 'Auto-Payment Processed',
        message: event.detail.message,
        type: 'success',
        category: 'bill',
        priority: 'medium'
      });
    };

    window.addEventListener('recurringBillDue', handleRecurringBillDue as EventListener);
    window.addEventListener('autoPaidBill', handleAutoPaidBill as EventListener);

    return () => {
      window.removeEventListener('recurringBillDue', handleRecurringBillDue as EventListener);
      window.removeEventListener('autoPaidBill', handleAutoPaidBill as EventListener);
      KeyboardShortcutsManager.cleanup();
    };
  }, []);

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return <ModernDashboard />;
      case 'transactions':
      case 'all-transactions':
      case 'recurring':
      case 'categories':
        return <EnhancedTransactions />;
      case 'goals':
        return <GoalsDashboard />;
      case 'insights':
        return <AIInsights />;
      case 'bills':
        return <BillManager />;
      case 'investments':
        return <InvestmentPortfolio />;
      case 'settings':
      case 'profile':
      case 'security':
      case 'notifications':
      case 'billing':
        return <EnhancedSettings activeView={activeItem} />;
      default:
        return <ModernDashboard />;
    }
  };

  if (showProfileSetup) {
    return (
      <ProfileSetup
        onComplete={() => {
          setShowProfileSetup(false);
          setActiveItem('dashboard');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <PremiumSidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="flex-1 flex flex-col overflow-auto">
        {renderContent()}
      </div>
      <FloatingActionButton />
      <ToastContainer />
      {showShortcutsHelp && (
        <KeyboardShortcutsHelp onClose={() => setShowShortcutsHelp(false)} />
      )}
    </div>
  );
}

export default App;