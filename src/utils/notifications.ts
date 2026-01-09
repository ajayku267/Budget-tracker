export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'transaction' | 'goal' | 'bill' | 'system' | 'security' | 'reminder';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  billReminders: boolean;
  goalUpdates: boolean;
  weeklyReports: boolean;
  securityAlerts: boolean;
  transactionAlerts: boolean;
  budgetAlerts: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string;
  sound?: string;
}

class NotificationManager {
  private static instance: NotificationManager;
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private toastContainer: HTMLElement | null = null;
  private settings: NotificationSettings;
  private soundEnabled: boolean = true;

  private constructor() {
    this.settings = this.loadSettings();
    this.initializeToastContainer();
    this.loadNotifications();
    this.setupServiceWorker();
    this.setupPeriodicChecks();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Initialize toast container
  private initializeToastContainer() {
    if (typeof document !== 'undefined') {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      this.toastContainer.className = 'fixed z-50 pointer-events-none';
      document.body.appendChild(this.toastContainer);
    }
  }

  // Load settings from localStorage
  private loadSettings(): NotificationSettings {
    const stored = localStorage.getItem('notification-settings');
    return stored ? JSON.parse(stored) : {
      emailNotifications: true,
      pushNotifications: true,
      billReminders: true,
      goalUpdates: true,
      weeklyReports: false,
      securityAlerts: true,
      transactionAlerts: true,
      budgetAlerts: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      soundEnabled: true,
      vibrationEnabled: true
    };
  }

  // Save settings to localStorage
  saveSettings(settings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem('notification-settings', JSON.stringify(this.settings));
  }

  getSettings(): NotificationSettings {
    return this.settings;
  }

  // Load notifications from localStorage
  private loadNotifications() {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      this.notifications = parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
        expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined
      }));
      this.cleanupExpiredNotifications();
    }
  }

  // Save notifications to localStorage
  private saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    this.notifyListeners();
  }

  // Cleanup expired notifications
  private cleanupExpiredNotifications() {
    const now = new Date();
    this.notifications = this.notifications.filter(n => 
      !n.expiresAt || n.expiresAt > now
    );
  }

  // Check if it's quiet hours
  private isQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = this.settings.quietHours;
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      return currentTime >= start || currentTime <= end;
    }
  }

  // Check if notification should be shown
  private shouldShowNotification(category: Notification['category'], priority: Notification['priority']): boolean {
    if (this.isQuietHours() && priority !== 'high') return false;
    
    switch (category) {
      case 'bill':
        return this.settings.billReminders;
      case 'goal':
        return this.settings.goalUpdates;
      case 'transaction':
        return this.settings.transactionAlerts;
      case 'security':
        return this.settings.securityAlerts;
      case 'system':
        return true;
      case 'reminder':
        return true;
      default:
        return true;
    }
  }

  // Add notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false
    };

    if (this.shouldShowNotification(notification.category, notification.priority)) {
      this.notifications.unshift(newNotification);
      this.saveNotifications();
      
      // Show toast if not in quiet hours
      if (!this.isQuietHours() || notification.priority === 'high') {
        this.showToast(newNotification);
      }
      
      // Show browser notification if permitted
      if (this.settings.pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
        this.showBrowserNotification(newNotification);
      }
      
      // Play sound if enabled
      if (this.settings.soundEnabled && !this.isQuietHours()) {
        this.playNotificationSound(notification.type);
      }
      
      // Vibrate if enabled and supported
      if (this.settings.vibrationEnabled && 'vibrate' in navigator && !this.isQuietHours()) {
        this.vibrate(notification.type);
      }
    }

    return id;
  }

  // Show toast notification
  showToast(notification: Notification, options: ToastOptions = {}) {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    const toastId = `toast-${notification.id}`;
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    const position = options.position || 'top-right';
    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    toast.id = toastId;
    toast.className = `
      pointer-events-auto mb-4 p-4 rounded-lg shadow-lg bg-white border-l-4 
      transform transition-all duration-300 translate-x-full
      ${notification.type === 'success' ? 'border-green-500' : ''}
      ${notification.type === 'error' ? 'border-red-500' : ''}
      ${notification.type === 'warning' ? 'border-yellow-500' : ''}
      ${notification.type === 'info' ? 'border-blue-500' : ''}
      max-w-sm
    `;

    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0 text-2xl">${options.icon || icons[notification.type]}</div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium text-gray-900">${notification.title}</p>
          <p class="mt-1 text-sm text-gray-500">${notification.message}</p>
          ${notification.actionText ? `
            <button class="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 notification-action">
              ${notification.actionText}
            </button>
          ` : ''}
          ${options.action ? `
            <button class="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 toast-action">
              ${options.action.label}
            </button>
          ` : ''}
        </div>
        <button class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 close-toast">
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `;

    // Position the toast container
    this.toastContainer.className = `fixed z-50 pointer-events-none ${positionClasses[position]}`;
    this.toastContainer.appendChild(toast);

    // Add event listeners
    const closeBtn = toast.querySelector('.close-toast');
    const actionBtn = toast.querySelector('.notification-action');
    const toastActionBtn = toast.querySelector('.toast-action');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.removeToast(toastId));
    }

    if (actionBtn && notification.actionUrl) {
      actionBtn.addEventListener('click', () => {
        window.location.href = notification.actionUrl!;
        this.removeToast(toastId);
      });
    }

    if (toastActionBtn && options.action) {
      toastActionBtn.addEventListener('click', () => {
        options.action!.onClick();
        this.removeToast(toastId);
      });
    }

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
      toast.classList.add('translate-x-0');
    }, 100);

    // Auto remove
    if (!options.persistent) {
      setTimeout(() => {
        this.removeToast(toastId);
      }, options.duration || 5000);
    }
  }

  // Remove toast
  private removeToast(toastId: string) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }

  // Show browser notification
  private showBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'high'
      });

      if (notification.actionUrl) {
        browserNotification.onclick = () => {
          window.focus();
          window.location.href = notification.actionUrl!;
          browserNotification.close();
        };
      }

      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  }

  // Play notification sound
  private playNotificationSound(type: Notification['type']) {
    if (!this.soundEnabled) return;

    const audio = new Audio();
    const sounds = {
      success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
      error: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
      warning: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
      info: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    };

    audio.src = sounds[type] || sounds.info;
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignore errors if audio can't play
    });
  }

  // Vibrate device
  private vibrate(type: Notification['type']) {
    if ('vibrate' in navigator) {
      const patterns = {
        success: [100],
        error: [100, 50, 100],
        warning: [200],
        info: [50]
      };
      navigator.vibrate(patterns[type] || patterns.info);
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  }

  // Get notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Get notifications by category
  getNotificationsByCategory(category: Notification['category']): Notification[] {
    return this.notifications.filter(n => n.category === category);
  }

  // Mark notification as read
  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  // Delete notification
  deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
  }

  // Clear all notifications
  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Setup service worker for push notifications
  private setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Ignore registration errors
      });
    }
  }

  // Setup periodic checks for reminders
  private setupPeriodicChecks() {
    // Check for bill reminders every hour
    setInterval(() => {
      this.checkBillReminders();
    }, 60 * 60 * 1000);

    // Check for goal milestones every 6 hours
    setInterval(() => {
      this.checkGoalMilestones();
    }, 6 * 60 * 60 * 1000);

    // Cleanup expired notifications daily
    setInterval(() => {
      this.cleanupExpiredNotifications();
      this.saveNotifications();
    }, 24 * 60 * 60 * 1000);
  }

  // Check bill reminders
  private checkBillReminders() {
    const data = JSON.parse(localStorage.getItem('primepay-data') || '{}');
    const bills = data.bills || [];
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;

    bills.forEach((bill: any) => {
      if (!bill.paid) {
        const dueDay = parseInt(bill.dueDate);
        const daysUntilDue = dueDay - currentDay;
        
        if (daysUntilDue === 3) {
          this.addNotification({
            title: 'Bill Due Soon',
            message: `Your ${bill.name} bill of $${bill.amount} is due in 3 days`,
            type: 'warning',
            category: 'bill',
            priority: 'medium',
            actionUrl: '/transaction',
            actionText: 'View Bills'
          });
        } else if (daysUntilDue === 0) {
          this.addNotification({
            title: 'Bill Due Today',
            message: `Your ${bill.name} bill of $${bill.amount} is due today`,
            type: 'error',
            category: 'bill',
            priority: 'high',
            actionUrl: '/transaction',
            actionText: 'Pay Now'
          });
        } else if (daysUntilDue < 0 && Math.abs(daysUntilDue) <= 7) {
          this.addNotification({
            title: 'Bill Overdue',
            message: `Your ${bill.name} bill of $${bill.amount} is ${Math.abs(daysUntilDue)} days overdue`,
            type: 'error',
            category: 'bill',
            priority: 'high',
            actionUrl: '/transaction',
            actionText: 'Pay Now'
          });
        }
      }
    });
  }

  // Check goal milestones
  private checkGoalMilestones() {
    const data = JSON.parse(localStorage.getItem('primepay-data') || '{}');
    const goals = data.goals || [];

    goals.forEach((goal: any) => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      
      if (progress >= 25 && progress < 30) {
        this.addNotification({
          title: 'Goal Milestone!',
          message: `You've reached 25% of your ${goal.name} goal!`,
          type: 'success',
          category: 'goal',
          priority: 'medium',
          actionUrl: '/goals',
          actionText: 'View Goal'
        });
      } else if (progress >= 50 && progress < 55) {
        this.addNotification({
          title: 'Halfway There!',
          message: `You're 50% closer to your ${goal.name} goal!`,
          type: 'success',
          category: 'goal',
          priority: 'medium',
          actionUrl: '/goals',
          actionText: 'View Goal'
        });
      } else if (progress >= 75 && progress < 80) {
        this.addNotification({
          title: 'Almost There!',
          message: `You're 75% of the way to your ${goal.name} goal!`,
          type: 'success',
          category: 'goal',
          priority: 'medium',
          actionUrl: '/goals',
          actionText: 'View Goal'
        });
      } else if (progress >= 100) {
        this.addNotification({
          title: 'Goal Achieved! 🎉',
          message: `Congratulations! You've reached your ${goal.name} goal!`,
          type: 'success',
          category: 'goal',
          priority: 'high',
          actionUrl: '/goals',
          actionText: 'Celebrate'
        });
      }
    });
  }

  // Transaction alerts
  notifyTransaction(transaction: any) {
    if (transaction.type === 'expense' && transaction.amount > 1000) {
      this.addNotification({
        title: 'Large Expense Alert',
        message: `You spent $${transaction.amount} on ${transaction.name}`,
        type: 'warning',
        category: 'transaction',
        priority: 'medium'
      });
    }

    if (transaction.type === 'income') {
      this.addNotification({
        title: 'Income Received',
        message: `$${transaction.amount} from ${transaction.name} has been added`,
        type: 'success',
        category: 'transaction',
        priority: 'low'
      });
    }
  }

  // Budget alerts
  notifyBudgetAlert(category: string, spent: number, budget: number) {
    const percentage = (spent / budget) * 100;
    
    if (percentage >= 90) {
      this.addNotification({
        title: 'Budget Almost Exceeded',
        message: `You've used ${percentage.toFixed(0)}% of your ${category} budget`,
        type: 'error',
        category: 'system',
        priority: 'high',
        actionUrl: '/insights',
        actionText: 'View Budget'
      });
    } else if (percentage >= 75) {
      this.addNotification({
        title: 'Budget Warning',
        message: `You've used ${percentage.toFixed(0)}% of your ${category} budget`,
        type: 'warning',
        category: 'system',
        priority: 'medium',
        actionUrl: '/insights',
        actionText: 'View Budget'
      });
    }
  }

  // Security alerts
  notifySecurityAlert(event: string, details: string) {
    this.addNotification({
      title: 'Security Alert',
      message: `${event}: ${details}`,
      type: 'error',
      category: 'security',
      priority: 'high',
      actionUrl: '/settings',
      actionText: 'Review Security'
    });
  }

  // System notifications
  notifySystem(message: string, type: Notification['type'] = 'info') {
    this.addNotification({
      title: 'System Notification',
      message,
      type,
      category: 'system',
      priority: 'low'
    });
  }

  // Enable/disable sounds
  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  // Get notification count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}

// Export singleton instance
export const notifications = NotificationManager.getInstance();

// React Hook for notifications
export function useNotifications() {
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial load
    setNotificationList(notifications.getNotifications());
    setUnreadCount(notifications.getUnreadCount());

    // Subscribe to changes
    const unsubscribe = notifications.subscribe((updatedNotifications) => {
      setNotificationList(updatedNotifications);
      setUnreadCount(notifications.getUnreadCount());
    });

    return unsubscribe;
  }, []);

  return {
    notifications: notificationList,
    unreadCount,
    markAsRead: notifications.markAsRead.bind(notifications),
    markAllAsRead: notifications.markAllAsRead.bind(notifications),
    deleteNotification: notifications.deleteNotification.bind(notifications),
    clearAll: notifications.clearAllNotifications.bind(notifications),
    addNotification: notifications.addNotification.bind(notifications),
    settings: notifications.getSettings(),
    updateSettings: notifications.saveSettings.bind(notifications),
    requestPermission: notifications.requestPermission.bind(notifications)
  };
}