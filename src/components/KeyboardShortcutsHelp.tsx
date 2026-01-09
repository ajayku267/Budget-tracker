import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X, Keyboard } from 'lucide-react';
import { KeyboardShortcutsManager } from '../utils/keyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ onClose }: KeyboardShortcutsHelpProps) {
  const shortcuts = KeyboardShortcutsManager.getAllShortcuts();

  // Group shortcuts by category
  const categories = {
    'Navigation': shortcuts.filter(s => ['dashboard', 'transactions', 'goals', 'bills', 'settings'].includes(s.id)),
    'Actions': shortcuts.filter(s => ['quickAdd', 'search'].includes(s.id)),
    'General': shortcuts.filter(s => ['help', 'escape'].includes(s.id)),
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto animate-slideIn">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
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

        <CardContent className="p-6 space-y-6">
          {Object.entries(categories).map(([category, items]) => {
            if (items.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map(({ id, shortcut }) => (
                    <div
                      key={id}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors"
                    >
                      <span className="text-sm text-foreground">{shortcut.description}</span>
                      <kbd className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-md shadow-sm">
                        {KeyboardShortcutsManager.formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Press <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">Esc</kbd> to close this dialog
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
