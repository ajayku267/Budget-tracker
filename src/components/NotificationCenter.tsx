import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { X, Check, AlertCircle, Info, CheckCircle, Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    notifications
  };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (toast: any) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Card key={toast.id} className="bg-white shadow-lg border-l-4 border-l-blue-500 min-w-80">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 mt-0.5" />}
                <div>
                  <p className="font-medium text-gray-900">{toast.title}</p>
                  <p className="text-sm text-gray-600">{toast.message}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}