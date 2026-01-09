import { useCallback } from 'react';
import { notifications, ToastOptions } from '../utils/notifications';

export function useNotificationToast() {
  const showSuccess = useCallback((title: string, message: string, options?: ToastOptions) => {
    notifications.addNotification({
      title,
      message,
      type: 'success',
      category: 'system',
      priority: 'medium'
    });
  }, []);

  const showError = useCallback((title: string, message: string, options?: ToastOptions) => {
    notifications.addNotification({
      title,
      message,
      type: 'error',
      category: 'system',
      priority: 'high'
    });
  }, []);

  const showWarning = useCallback((title: string, message: string, options?: ToastOptions) => {
    notifications.addNotification({
      title,
      message,
      type: 'warning',
      category: 'system',
      priority: 'medium'
    });
  }, []);

  const showInfo = useCallback((title: string, message: string, options?: ToastOptions) => {
    notifications.addNotification({
      title,
      message,
      type: 'info',
      category: 'system',
      priority: 'low'
    });
  }, []);

  const showCustom = useCallback((notification: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    category?: 'transaction' | 'goal' | 'bill' | 'system' | 'security' | 'reminder';
    priority?: 'low' | 'medium' | 'high';
    actionUrl?: string;
    actionText?: string;
  }, options?: ToastOptions) => {
    notifications.addNotification({
      ...notification,
      category: notification.category || 'system',
      priority: notification.priority || 'medium'
    });
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCustom
  };
}