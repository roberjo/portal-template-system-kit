
import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  read?: boolean;
  timestamp?: number;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class NotificationStore {
  rootStore: RootStore;
  
  // All notifications (for history/notification center)
  notifications: Notification[] = [];
  
  // Toast notifications (for displaying)
  toasts: Notification[] = [];
  
  // Unread count
  unreadCount: number = 0;
  
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    
    // Mock notifications for demo
    this.notifications = [
      {
        id: '1',
        type: 'info',
        title: 'Welcome to Portal',
        message: 'Welcome to the Portal Template System. Explore the templates!',
        timestamp: Date.now() - 3600000,
        read: false
      },
      {
        id: '2',
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile information was updated successfully.',
        timestamp: Date.now() - 86400000,
        read: true
      }
    ];
    
    this.calculateUnread();
    
    makeAutoObservable(this, { rootStore: false });
  }
  
  addNotification = (notification: Omit<Notification, 'timestamp'>) => {
    const newNotification = {
      ...notification,
      timestamp: Date.now(),
      read: false
    };
    
    this.notifications.unshift(newNotification);
    
    // Add to toast queue if not persistent
    if (!notification.persistent) {
      this.toasts.push(newNotification);
      
      // Auto dismiss after duration
      if (notification.duration !== undefined) {
        setTimeout(() => {
          this.dismissToast(newNotification.id);
        }, notification.duration);
      }
    }
    
    this.calculateUnread();
  }
  
  markAsRead = (id: string) => {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.calculateUnread();
    }
  }
  
  markAllAsRead = () => {
    this.notifications.forEach(n => {
      n.read = true;
    });
    this.calculateUnread();
  }
  
  dismissToast = (id: string) => {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
  
  clearAllToasts = () => {
    this.toasts = [];
  }
  
  private calculateUnread = () => {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }
}
