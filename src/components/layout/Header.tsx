import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Bell, Menu, Search, User, LogOut, Settings, UserPlus, UserCheck, ChevronDown } from 'lucide-react';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '../ui/dropdown-menu';
import { useStore } from '../../store/StoreContext';
import { ThemeToggle } from '../theme/ThemeToggle';
import { Notification } from '../../store/types';
import { Badge } from '../ui/badge';
import { ENV } from '../../config/env';

// Create a default user for development testing
const defaultUser = {
  id: 'test',
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin',
  permissions: ['read:all'],
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  }
};

// Notification Item Component
const NotificationItem = ({ notification, onRead }: { notification: Notification, onRead: (id: string) => void }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <Badge variant="success" className="mr-2 h-1.5 w-1.5 rounded-full" />;
      case 'error': return <Badge variant="destructive" className="mr-2 h-1.5 w-1.5 rounded-full" />;
      case 'warning': return <Badge variant="warning" className="mr-2 h-1.5 w-1.5 rounded-full" />;
      case 'info': default: return <Badge variant="info" className="mr-2 h-1.5 w-1.5 rounded-full" />;
    }
  };
  
  return (
    <div 
      className={`p-3 hover:bg-accent cursor-pointer ${!notification.read ? 'bg-accent/30' : ''}`}
      onClick={() => onRead(notification.id)}
    >
      <div className="flex items-start">
        <div className="mt-0.5">{getIcon()}</div>
        <div>
          <div className="font-medium text-sm">{notification.title}</div>
          <div className="text-xs text-muted-foreground mt-1">{notification.message}</div>
          {notification.timestamp && (
            <div className="text-xs text-muted-foreground mt-1.5">
              {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simplified standalone user menu component
const UserMenu = observer(() => {
  const { userStore } = useStore();
  // Debug: Use a default user if the currentUser is null
  const user = userStore.currentUser || defaultUser;
  
  console.log("UserMenu rendering with user:", user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 cursor-pointer rounded-md hover:bg-accent p-1 transition-colors">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center text-sm font-medium hidden md:flex">
            <span>{user.name}</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* User info */}
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <Badge variant="outline" className="mt-1">
            {user.role}
          </Badge>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Menu items */}
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {/* Logout */}
        <DropdownMenuItem onClick={() => userStore.logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export const Header = observer(() => {
  const { toggleSidebar } = useStore().uiStore;
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useStore().notificationStore;
  
  // API call to fetch notifications (simulated)
  const [loading, setLoading] = useState(false);
  
  const fetchNotifications = async () => {
    // In a real app, this would call an API endpoint
    // Here we'll just simulate an API call using the store's mock data
    if (ENV.FEATURES.mockAuth) {
      // Simulating API delay
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    } else {
      try {
        setLoading(true);
        const response = await fetch(`${ENV.API_URL}/notifications`);
        const data = await response.json();
        // Would update store with the fetched notifications
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setLoading(false);
      }
    }
  };

  return (
    <header className="bg-background border-b flex items-center justify-between px-4 py-2 h-16 shrink-0">
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle */}
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-accent md:hidden">
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo or Title - Placeholder */}
        <div className="font-bold text-lg hidden md:block">Portal</div>

        {/* Global Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-10 w-64" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="relative p-2 rounded-md hover:bg-accent"
              onClick={fetchNotifications}
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Mark all as read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell className="h-8 w-8 text-muted-foreground opacity-20 mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">No notifications</p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.slice(0, 5).map(notification => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onRead={markAsRead} 
                  />
                ))}
              </div>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}); 