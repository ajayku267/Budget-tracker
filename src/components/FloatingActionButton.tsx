import { useState, useEffect } from 'react';
import { Plus, DollarSign, Target } from 'lucide-react';
import { QuickAddTransaction } from './QuickAddTransaction';
import { QuickContributeGoal } from './QuickContributeGoal';

export function FloatingActionButton() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showContribute, setShowContribute] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Listen for keyboard shortcut trigger
    const handleOpenQuickAdd = () => {
      setShowMenu(true);
    };

    window.addEventListener('openQuickAdd', handleOpenQuickAdd);

    return () => {
      window.removeEventListener('openQuickAdd', handleOpenQuickAdd);
    };
  }, []);

  const handleTransactionClick = () => {
    setShowMenu(false);
    setShowQuickAdd(true);
  };

  const handleContributeClick = () => {
    setShowMenu(false);
    setShowContribute(true);
  };

  return (
    <>
      {/* Menu */}
      {showMenu && (
        <div className="fixed bottom-24 right-8 bg-card border border-border rounded-lg shadow-xl z-40 overflow-hidden animate-fadeIn">
          <button
            onClick={handleTransactionClick}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors w-full text-left"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">Add Transaction</div>
              <div className="text-xs text-muted-foreground">Record income or expense</div>
            </div>
          </button>
          <div className="h-px bg-border" />
          <button
            onClick={handleContributeClick}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors w-full text-left"
          >
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">Contribute to Goal</div>
              <div className="text-xs text-muted-foreground">Add money to your goals</div>
            </div>
          </button>
        </div>
      )}

      {/* Backdrop */}
      {showMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* FAB Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 z-40 flex items-center justify-center group ${
          showMenu ? 'rotate-45' : ''
        }`}
        title="Quick Actions (Ctrl+N)"
      >
        <Plus className="h-6 w-6 transition-transform group-hover:rotate-90" />
      </button>

      {/* Modals */}
      {showQuickAdd && (
        <QuickAddTransaction
          onClose={() => setShowQuickAdd(false)}
          onSuccess={() => {
            window.dispatchEvent(new CustomEvent('transactionAdded'));
          }}
        />
      )}

      {showContribute && (
        <QuickContributeGoal
          onClose={() => setShowContribute(false)}
          onSuccess={() => {
            window.dispatchEvent(new CustomEvent('goalUpdated'));
          }}
        />
      )}
    </>
  );
}
