
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Bell, Menu, Moon, Search, Sun, User } from 'lucide-react';
import rootStore from '../../store/RootStore';

export const Header = observer(() => {
  const { toggleSidebar, theme, toggleTheme } = rootStore.uiStore;
  const { currentUser } = rootStore.userStore;
  const { unreadCount } = rootStore.notificationStore;
  
  return (
    <header className="bg-card border-b border-border h-16 flex items-center px-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link to="/" className="flex items-center">
            <span className="text-xl font-semibold text-primary">Portal</span>
            <span className="ml-2 text-xl font-normal">Templates</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64 rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          
          {/* Notifications */}
          <Link to="/notifications" className="relative p-2 rounded-md hover:bg-accent">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
          
          {/* User menu */}
          <Link to="/profile" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <span className="hidden md:inline-block font-medium">
              {currentUser?.name || 'User'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
});
