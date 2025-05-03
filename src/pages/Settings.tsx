import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store/StoreContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { ThemeToggle } from '../components/theme/ThemeToggle';
import { User, Bell, Lock, Shield, Smartphone } from 'lucide-react';

export const Settings = observer(() => {
  const { userStore, notificationStore } = useStore();
  const { currentUser, updatePreferences } = userStore;
  
  // Make sure we have a user
  if (!currentUser) {
    return <div>Loading settings...</div>;
  }
  
  const handleNotificationToggle = (key: 'email' | 'push' | 'sms') => {
    const current = currentUser.preferences?.notifications || { email: false, push: false, sms: false };
    updatePreferences({
      notifications: {
        ...current,
        [key]: !current[key]
      }
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-sm text-muted-foreground">Toggle between light and dark mode</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <Label htmlFor="push-notifications">Push Notifications</Label>
            </div>
            <Switch
              id="push-notifications"
              checked={currentUser.preferences?.notifications?.push || false}
              onCheckedChange={() => handleNotificationToggle('push')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <Label htmlFor="email-notifications">Email Notifications</Label>
            </div>
            <Switch
              id="email-notifications"
              checked={currentUser.preferences?.notifications?.email || false}
              onCheckedChange={() => handleNotificationToggle('email')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
            </div>
            <Switch
              id="sms-notifications"
              checked={currentUser.preferences?.notifications?.sms || false}
              onCheckedChange={() => handleNotificationToggle('sms')}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <Label>Two-Factor Authentication</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable 2FA for your account</span>
              <Switch id="2fa" />
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <Label>Session Management</Label>
            <div className="bg-accent/50 p-3 rounded-md">
              <div className="text-sm">Current Session: <span className="font-semibold">This Device</span></div>
              <div className="text-xs text-muted-foreground mt-1">Started: {new Date().toLocaleString()}</div>
            </div>
            <Button variant="outline" size="sm" className="mt-2">
              Log Out All Other Devices
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Security Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
});

export default Settings; 