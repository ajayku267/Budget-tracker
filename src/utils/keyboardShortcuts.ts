/**
 * Keyboard Shortcuts Manager
 *
 * Available shortcuts:
 * - Ctrl/Cmd + N: Quick add transaction/goal
 * - Ctrl/Cmd + K: Command palette (search)
 * - Ctrl/Cmd + D: Go to dashboard
 * - Ctrl/Cmd + T: Go to transactions
 * - Ctrl/Cmd + G: Go to goals
 * - Ctrl/Cmd + B: Go to bills
 * - Ctrl/Cmd + S: Go to settings
 * - Ctrl/Cmd + /: Show keyboard shortcuts help
 * - Escape: Close modals
 */

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
}

export class KeyboardShortcutsManager {
  private static shortcuts: Map<string, KeyboardShortcut> = new Map();
  private static initialized = false;

  /**
   * Register a keyboard shortcut
   */
  static register(id: string, shortcut: KeyboardShortcut): void {
    this.shortcuts.set(id, shortcut);
  }

  /**
   * Unregister a keyboard shortcut
   */
  static unregister(id: string): void {
    this.shortcuts.delete(id);
  }

  /**
   * Initialize keyboard shortcuts listener
   */
  static initialize(): void {
    if (this.initialized) return;

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.initialized = true;
  }

  /**
   * Handle keydown events
   */
  private static handleKeyDown(event: KeyboardEvent): void {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Only allow Escape key in inputs
      if (event.key !== 'Escape') {
        return;
      }
    }

    // Check each registered shortcut
    this.shortcuts.forEach((shortcut) => {
      if (this.matchesShortcut(event, shortcut)) {
        event.preventDefault();
        shortcut.action();
      }
    });
  }

  /**
   * Check if event matches a shortcut
   */
  private static matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? event.metaKey : event.ctrlKey;

    // Normalize key comparison
    const eventKey = event.key.toLowerCase();
    const shortcutKey = shortcut.key.toLowerCase();

    return (
      eventKey === shortcutKey &&
      (shortcut.ctrlKey || shortcut.metaKey ? modifierKey : !modifierKey) &&
      (shortcut.shiftKey ? event.shiftKey : !event.shiftKey) &&
      (shortcut.altKey ? event.altKey : !event.altKey)
    );
  }

  /**
   * Get all registered shortcuts
   */
  static getAllShortcuts(): Array<{ id: string; shortcut: KeyboardShortcut }> {
    return Array.from(this.shortcuts.entries()).map(([id, shortcut]) => ({
      id,
      shortcut,
    }));
  }

  /**
   * Format shortcut for display
   */
  static formatShortcut(shortcut: KeyboardShortcut): string {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const parts: string[] = [];

    if (shortcut.ctrlKey || shortcut.metaKey) {
      parts.push(isMac ? '⌘' : 'Ctrl');
    }

    if (shortcut.shiftKey) {
      parts.push(isMac ? '⇧' : 'Shift');
    }

    if (shortcut.altKey) {
      parts.push(isMac ? '⌥' : 'Alt');
    }

    parts.push(shortcut.key.toUpperCase());

    return parts.join(isMac ? '' : '+');
  }

  /**
   * Clean up event listeners
   */
  static cleanup(): void {
    if (!this.initialized) return;

    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    this.shortcuts.clear();
    this.initialized = false;
  }
}

// Predefined shortcuts helper
export const createShortcut = (
  key: string,
  description: string,
  action: () => void,
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = { ctrl: true }
): KeyboardShortcut => {
  return {
    key,
    ctrlKey: modifiers.ctrl,
    metaKey: modifiers.ctrl,
    shiftKey: modifiers.shift,
    altKey: modifiers.alt,
    description,
    action,
  };
};
