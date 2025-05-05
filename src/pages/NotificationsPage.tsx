import React from 'react';
import { observer } from 'mobx-react-lite';
import { AlertCircle, Bell, CheckCircle, Info, Trash, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import rootStore from '../store/RootStore';
import { Notification } from '../store/types';

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { markAsRead } = rootStore.notificationStore;
  
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info': default: return <Info className="h-5 w-5 text-info" />;
    }
  };
  
  const getTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div 
      onClick={() => !notification.read && markAsRead(notification.id)}
      className={`p-4 border-b border-border last:border-0 transition-colors cursor-pointer
                  ${notification.read ? 'bg-background' : 'bg-accent/30'}`}
    >
      <div className="flex">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className={`font-medium ${notification.read ? '' : 'text-primary'}`}>
              {notification.title}
            </h3>
            <span className="text-xs text-muted-foreground ml-2">
              {notification.timestamp && getTime(notification.timestamp)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {notification.action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const NotificationsPage = observer(() => {
  const { notifications, markAllAsRead } = rootStore.notificationStore;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Notifications</h1>
        
        <button
          onClick={markAllAsRead}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors text-sm"
        >
          Mark All as Read
        </button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Bell className="h-5 w-5" />
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
              <p className="text-muted-foreground">No notifications to display</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Info className="h-5 w-5 text-info" />
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.filter(n => n.type === 'info').length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">No info notifications</p>
              </div>
            ) : (
              <div>
                {notifications
                  .filter(n => n.type === 'info')
                  .map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <CardTitle>Success</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.filter(n => n.type === 'success').length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">No success notifications</p>
              </div>
            ) : (
              <div>
                {notifications
                  .filter(n => n.type === 'success')
                  .map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.filter(n => n.type === 'warning' || n.type === 'error').length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">No alert notifications</p>
              </div>
            ) : (
              <div>
                {notifications
                  .filter(n => n.type === 'warning' || n.type === 'error')
                  .map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Notification Usage Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>
              The notification system provides important alerts and information to users. Notifications can be:
            </p>
            
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>
                <span className="font-medium text-info">Info:</span> 
                <span className="ml-2">General information and updates</span>
              </li>
              <li>
                <span className="font-medium text-success">Success:</span> 
                <span className="ml-2">Confirmation of completed actions</span>
              </li>
              <li>
                <span className="font-medium text-warning">Warning:</span> 
                <span className="ml-2">Important alerts requiring attention</span>
              </li>
              <li>
                <span className="font-medium text-destructive">Error:</span> 
                <span className="ml-2">Critical issues that need immediate attention</span>
              </li>
            </ul>
            
            <p className="mt-4">
              To implement the notification system in your components, use the <code>notificationStore</code> from the root store. 
              Notifications can be added, marked as read, and cleared as needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default NotificationsPage;
