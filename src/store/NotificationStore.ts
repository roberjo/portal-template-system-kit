import { makeAutoObservable } from 'mobx';
import { INotificationStore, Notification } from './types';

export class NotificationStore implements INotificationStore {
  // All notifications (for history/notification center)
  notifications: Notification[] = [];
  
  // Toast notifications (for displaying)
  toasts: Notification[] = [];
  
  // Unread count
  unreadCount: number = 0;
  
  constructor() {
    makeAutoObservable(this);
    
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
  }
  
  private calculateUnread = () => {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }
  
  addNotification = (notification: Omit<Notification, 'timestamp' | 'read'> & { timestamp?: number; read?: boolean }) => {
    const newNotification: Notification = {
      ...notification,
      timestamp: notification.timestamp || Date.now(),
      read: notification.read || false
    };
    
    // Add to notifications list
    this.notifications = [newNotification, ...this.notifications];
    
    // If not marked as read, increase unread count
    if (!newNotification.read) {
      this.unreadCount++;
    }
    
    // If it has a duration, add it to toasts for temporary display
    if (newNotification.duration) {
      this.toasts = [newNotification, ...this.toasts];
      
      // Automatically remove from toasts after duration
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== newNotification.id);
      }, newNotification.duration);
    }
  }
  
  markAsRead = (id: string) => {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount--;
    }
  }
  
  markAllAsRead = () => {
    this.notifications.forEach(n => {
      n.read = true;
    });
    this.unreadCount = 0;
  }
  
  removeNotification = (id: string) => {
    const notification = this.notifications.find(n => n.id === id);
    
    // If it's unread, decrease unread count
    if (notification && !notification.read) {
      this.unreadCount--;
    }
    
    // Remove from notifications
    this.notifications = this.notifications.filter(n => n.id !== id);
    
    // Remove from toasts if present
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
  
  dismissToast = (id: string) => {
    // Remove from toasts only, but keep in notifications
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
  
  clearAll = () => {
    this.notifications = [];
    this.toasts = [];
    this.unreadCount = 0;
  }
}
