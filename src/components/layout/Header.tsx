import React from 'react';
import { observer } from 'mobx-react-lite';
import { Bell, Menu, Search, User } from 'lucide-react';
import { Input } from '../ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { useStore } from '../../store/StoreContext';
import { ThemeToggle } from '../theme/ThemeToggle';

export const Header = observer(() => {
  const { toggleSidebar } = useStore().uiStore;
  const { currentUser } = useStore().userStore;
  const { unreadCount } = useStore().notificationStore;

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

        {/* Notifications */}
        <button className="relative p-2 rounded-md hover:bg-accent">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser?.avatar || undefined} alt={currentUser?.name} />
            <AvatarFallback>
              {currentUser?.name?.split(' ').map(n => n[0]).join('') || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden md:block">{currentUser?.name}</span>
        </div>
      </div>
    </header>
  );
});
