import React from 'react';
import { observer } from 'mobx-react-lite';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '../store/types';
import { useStore } from '../store/StoreContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { ThemeToggle } from '../components/theme/ThemeToggle';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  // Avatar would be handled separately (e.g., file upload)
  preferences: z.object({
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean()
    })
  })
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const Profile = observer(() => {
  const { userStore } = useStore();
  const { currentUser, updatePreferences } = userStore;
  
  console.log("Profile page rendering with currentUser:", currentUser);
  
  // For development: fallback to default user if currentUser is null
  const user = currentUser || {
    id: 'dev',
    name: 'Development User',
    email: 'dev@example.com',
    role: 'user',
    permissions: ['read:all'],
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    }
  };
  
  const { register, handleSubmit, control, formState: { errors, isDirty, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      preferences: {
        notifications: {
          email: user.preferences?.notifications?.email || false,
          push: user.preferences?.notifications?.push || false,
          sms: user.preferences?.notifications?.sms || false
        }
      }
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update only preferences for now
    updatePreferences({
      notifications: data.preferences.notifications
    });
    
    console.log('Profile updated:', data);
    // Here you would typically call an API to update the user profile
  };

  if (!currentUser) {
    console.log("No current user, showing development user data");
    // Keep showing the form with development data instead of loading message
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Profile</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback>
                  {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" type="button">Change Avatar</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Theme</Label>
              <div className="mt-1">
                <ThemeToggle />
              </div>
            </div>
            
            <div>
              <Label>Notification Preferences</Label>
              <div className="space-y-2 mt-1">
                <Controller
                  name="preferences.notifications.email"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="emailNotifications" checked={field.value} onChange={field.onChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                    </div>
                  )}
                />
                <Controller
                  name="preferences.notifications.push"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="pushNotifications" checked={field.value} onChange={field.onChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                    </div>
                  )}
                />
                <Controller
                  name="preferences.notifications.sms"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="smsNotifications" checked={field.value} onChange={field.onChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    </div>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
});

export default Profile;
