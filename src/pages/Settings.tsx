import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store/StoreContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { ThemeToggle } from '../components/theme/ThemeToggle';
import { 
  User, Bell, Lock, Shield, Smartphone, Mail, Phone, LogOut, 
  Save, ChevronRight, Monitor, Moon, Sun, Info, ExternalLink
} from 'lucide-react';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';

export const Settings = observer(() => {
  const { userStore, notificationStore } = useStore();
  const { currentUser, updatePreferences } = userStore;
  
  // Make sure we have a user
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    );
  }
  
  const handleNotificationToggle = (key: 'email' | 'push' | 'sms') => {
    const current = currentUser.preferences?.notifications || { email: false, push: false, sms: false };
    updatePreferences({
      notifications: {
        ...current,
        [key]: !current[key]
      }
    });
    
    // Show notification for better UX
    notificationStore.addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Settings Updated',
      message: `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${current[key] ? 'disabled' : 'enabled'}.`,
      duration: 3000
    });
  };
  
  const SettingRow = ({ 
    icon, 
    label, 
    children, 
    description 
  }: { 
    icon: React.ReactNode, 
    label: string, 
    children: React.ReactNode,
    description?: string
  }) => (
    <div className="flex flex-col space-y-2 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <Label className="text-base font-medium">{label}</Label>
            {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
  
  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        {/* Appearance Settings */}
        <Card className="overflow-hidden border-muted/30 shadow-sm">
          <CardHeader className="bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Monitor className="h-5 w-5 mr-2 text-primary" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize how the application looks</CardDescription>
              </div>
              <Badge variant="outline" className="px-3 py-1">Visual</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <SettingRow 
              icon={<Moon className="h-4 w-4" />} 
              label="Theme"
              description="Choose between light, dark, or system theme"
            >
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </SettingRow>
            
            <Separator className="my-3" />
            
            <SettingRow 
              icon={<Monitor className="h-4 w-4" />} 
              label="Density"
              description="Adjust the compactness of the user interface"
            >
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="px-3 py-1 h-auto">Compact</Button>
                <Button variant="outline" size="sm" className="px-3 py-1 h-auto bg-primary/10">Default</Button>
                <Button variant="outline" size="sm" className="px-3 py-1 h-auto">Comfortable</Button>
              </div>
            </SettingRow>
          </CardContent>
        </Card>
        
        {/* Notification Settings */}
        <Card className="overflow-hidden border-muted/30 shadow-sm">
          <CardHeader className="bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </div>
              <Badge variant="outline" className="px-3 py-1">Alerts</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-1">
            <SettingRow 
              icon={<Smartphone className="h-4 w-4" />} 
              label="Push Notifications"
              description="Receive alerts directly in your browser"
            >
              <Switch
                id="push-notifications"
                checked={currentUser.preferences?.notifications?.push || false}
                onCheckedChange={() => handleNotificationToggle('push')}
              />
            </SettingRow>
            
            <Separator />
            
            <SettingRow 
              icon={<Mail className="h-4 w-4" />} 
              label="Email Notifications"
              description="Get important updates via email"
            >
              <Switch
                id="email-notifications"
                checked={currentUser.preferences?.notifications?.email || false}
                onCheckedChange={() => handleNotificationToggle('email')}
              />
            </SettingRow>
            
            <Separator />
            
            <SettingRow 
              icon={<Phone className="h-4 w-4" />} 
              label="SMS Notifications"
              description="Receive text messages for critical alerts"
            >
              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-muted-foreground mr-2 cursor-help">
                      <Info className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Standard SMS rates may apply based on your carrier</p>
                  </TooltipContent>
                </Tooltip>
                <Switch
                  id="sms-notifications"
                  checked={currentUser.preferences?.notifications?.sms || false}
                  onCheckedChange={() => handleNotificationToggle('sms')}
                />
              </div>
            </SettingRow>
          </CardContent>
        </Card>
        
        {/* Security Settings */}
        <Card className="overflow-hidden border-muted/30 shadow-sm">
          <CardHeader className="bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account's security settings</CardDescription>
              </div>
              <Badge variant="outline" className="px-3 py-1 bg-orange-500/10 text-orange-600 border-orange-200">
                Important
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-1">
            <SettingRow 
              icon={<Lock className="h-4 w-4" />} 
              label="Password"
              description="Last changed 30 days ago"
            >
              <Button variant="outline" size="sm" className="h-9 px-4 flex items-center">
                <Lock className="h-3.5 w-3.5 mr-2" />
                Change Password
              </Button>
            </SettingRow>
            
            <Separator />
            
            <SettingRow 
              icon={<Shield className="h-4 w-4" />} 
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
            >
              <Switch id="2fa" />
            </SettingRow>
            
            <Separator />
            
            <div className="py-4">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <User className="h-4 w-4 mr-1.5 text-primary" />
                Active Sessions
              </h3>
              <div className="bg-muted/20 p-4 rounded-md border border-muted mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Current Session</div>
                    <div className="text-xs text-muted-foreground mt-1">Windows Chrome • Started {new Date().toLocaleString()}</div>
                  </div>
                  <Badge className="bg-green-500/15 text-green-600 hover:bg-green-500/20 border-green-200">
                    Active
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full justify-center text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Log Out All Other Devices
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <ExternalLink className="h-3.5 w-3.5 inline mr-1" />
              View our <a href="#" className="underline">security policy</a>
            </div>
            <Button className="px-5" size="sm">
              <Save className="h-3.5 w-3.5 mr-2" />
              Save All Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
});

export default Settings; 