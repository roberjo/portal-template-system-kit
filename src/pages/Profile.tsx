
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Bell, Lock, Moon, Shield, Sun, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import rootStore from '../store/RootStore';

export const Profile = observer(() => {
  const { userStore, uiStore, notificationStore } = rootStore;
  const { currentUser, updatePreferences } = userStore;
  const { theme, toggleTheme } = uiStore;
  
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: currentUser?.preferences.notifications.email || false,
    push: currentUser?.preferences.notifications.push || false,
    sms: currentUser?.preferences.notifications.sms || false
  });
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, save to API
    notificationStore.addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile information has been updated successfully.',
      duration: 5000
    });
  };
  
  const handleNotificationSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Update in store as well
    updatePreferences({
      notifications: {
        ...currentUser!.preferences.notifications,
        [name]: checked
      }
    });
  };
  
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-lg mb-2">User not found</p>
          <p className="text-muted-foreground">Please log in to view your profile</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1>User Profile</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>User Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="h-16 w-16 text-primary/60" />
                </div>
                
                <h2 className="text-xl font-medium">{currentUser.name}</h2>
                <p className="text-muted-foreground">{currentUser.email}</p>
                
                <div className="mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                </div>
                
                <button className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors w-full">
                  Change Avatar
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive email alerts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="email"
                      className="sr-only peer"
                      checked={notificationSettings.email}
                      onChange={handleNotificationSettingsChange}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="push"
                      className="sr-only peer"
                      checked={notificationSettings.push}
                      onChange={handleNotificationSettingsChange}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive text messages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="sms"
                      className="sr-only peer"
                      checked={notificationSettings.sms}
                      onChange={handleNotificationSettingsChange}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Sun className="h-5 w-5 dark:hidden" />
              <Moon className="h-5 w-5 hidden dark:block" />
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Enable dark theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                  />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Roles & Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Current Role</h3>
                  <div className="px-3 py-2 bg-muted rounded-md flex items-center">
                    {currentUser.role === 'admin' ? (
                      <div className="px-2 py-1 bg-destructive text-destructive-foreground text-xs rounded-md mr-2">
                        Admin
                      </div>
                    ) : currentUser.role === 'manager' ? (
                      <div className="px-2 py-1 bg-warning text-warning-foreground text-xs rounded-md mr-2">
                        Manager
                      </div>
                    ) : (
                      <div className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md mr-2">
                        User
                      </div>
                    )}
                    <span className="text-sm">{currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} role with appropriate permissions</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Permissions</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.permissions.map((permission, index) => (
                      <div key={index} className="px-2 py-1 bg-muted text-xs rounded-md">
                        {permission}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors w-full">
                  Change Password
                </button>
                
                <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors w-full">
                  Enable Two-Factor Authentication
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

export default Profile;
