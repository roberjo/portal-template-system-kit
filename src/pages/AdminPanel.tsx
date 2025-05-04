import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { AlertCircle, Check, Shield, User, UserMinus, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DataGrid } from '../components/ui/DataGrid';
import rootStore from '../store/RootStore';

export const AdminPanel = observer(() => {
  const { userStore, dataStore, notificationStore, uiStore } = rootStore;
  const { currentUser } = userStore;
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Check if user has admin access
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="bg-destructive/10 p-8 rounded-lg border border-destructive/20 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="mb-6">You do not have permission to access the admin panel.</p>
          <p className="text-sm text-muted-foreground">Please contact your administrator if you believe this is an error.</p>
        </div>
      </div>
    );
  }
  
  const handleImpersonateUser = (userId: string) => {
    const user = dataStore.users.find(u => u.id === userId);
    if (!user) return;
    
    uiStore.openModal({
      title: 'Impersonate User',
      content: (
        <div>
          <p className="mb-4">
            You are about to impersonate <strong>{user.name}</strong>. While impersonating, you will see the portal as this user would see it, with their permissions and access levels.
          </p>
          <p>Do you want to continue?</p>
        </div>
      ),
      onConfirm: () => {
        // Convert database user to application user format
        userStore.startImpersonation({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase() as 'user' | 'admin' | 'manager',
          permissions: ['read:own'],  // Limited permissions for impersonated user
          preferences: {
            theme: 'light',
            notifications: {
              email: true,
              push: true,
              sms: false
            }
          }
        });
      },
      confirmText: 'Start Impersonation',
      cancelText: 'Cancel'
    });
  };
  
  const handleAddRole = () => {
    if (!selectedUserId) {
      notificationStore.addNotification({
        id: Date.now().toString(),
        type: 'warning',
        title: 'No User Selected',
        message: 'Please select a user to add a role.',
        duration: 5000
      });
      return;
    }
    
    const user = dataStore.users.find(u => u.id === selectedUserId);
    if (!user) return;
    
    uiStore.openModal({
      title: 'Add Role to User',
      content: (
        <div>
          <p className="mb-4">
            Select a role to add to <strong>{user.name}</strong>:
          </p>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="radio" name="role" value="Admin" className="h-4 w-4" />
              <span>Admin</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="role" value="Manager" defaultChecked className="h-4 w-4" />
              <span>Manager</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="role" value="User" className="h-4 w-4" />
              <span>User</span>
            </label>
          </div>
        </div>
      ),
      onConfirm: () => {
        // In a real app, we'd get the selected role value from the form
        dataStore.updateUserRole(selectedUserId, 'Manager');
        
        notificationStore.addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Role Added',
          message: `Manager role added to ${user.name}.`,
          duration: 5000
        });
      },
      confirmText: 'Add Role',
      cancelText: 'Cancel'
    });
  };
  
  const handleRemoveRole = () => {
    if (!selectedUserId) {
      notificationStore.addNotification({
        id: Date.now().toString(),
        type: 'warning',
        title: 'No User Selected',
        message: 'Please select a user to remove a role.',
        duration: 5000
      });
      return;
    }
    
    const user = dataStore.users.find(u => u.id === selectedUserId);
    if (!user) return;
    
    uiStore.openModal({
      title: 'Remove Role from User',
      content: (
        <div>
          <p className="mb-4">
            Are you sure you want to remove the <strong>{user.role}</strong> role from <strong>{user.name}</strong>?
          </p>
          <p>The user will be assigned the default "User" role.</p>
        </div>
      ),
      onConfirm: () => {
        dataStore.updateUserRole(selectedUserId, 'User');
        
        notificationStore.addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Role Removed',
          message: `${user.role} role removed from ${user.name}.`,
          duration: 5000
        });
      },
      confirmText: 'Remove Role',
      cancelText: 'Cancel'
    });
  };
  
  // If user is impersonating, show a banner
  const ImpersonationBanner = () => {
    if (!userStore.impersonating) return null;
    
    return (
      <div className="bg-warning/20 border-y border-warning/30 py-2 px-4 mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-warning mr-2" />
          <span className="text-sm font-medium">
            You are currently impersonating {userStore.currentUser?.name}
          </span>
        </div>
        <button
          onClick={userStore.endImpersonation}
          className="px-3 py-1 bg-warning/20 text-warning-foreground text-sm rounded hover:bg-warning/30 transition-colors"
        >
          End Impersonation
        </button>
      </div>
    );
  };
  
  // Enhanced table with selection
  const usersTableWithActions = {
    ...dataStore.tableData['users'],
    columns: [
      {
        id: 'select',
        header: '',
        cell: (row: Record<string, unknown>) => (
          <div className="flex items-center justify-center">
            <input
              type="radio"
              name="selectedUser"
              checked={selectedUserId === row.id}
              onChange={() => setSelectedUserId(row.id as string)}
              className="h-4 w-4 border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )
      },
      ...(dataStore.tableData['users']?.columns || []),
      {
        id: 'actions',
        header: 'Actions',
        cell: (row: Record<string, unknown>) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleImpersonateUser(row.id as string);
              }}
              className="p-2 text-primary hover:bg-accent rounded-md transition-colors"
              aria-label="Impersonate user"
            >
              <User className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dataStore.toggleUserStatus(row.id as string);
              }}
              className={`p-2 hover:bg-accent rounded-md transition-colors ${
                row.status === 'active' ? 'text-success' : 'text-muted-foreground'
              }`}
              aria-label={row.status === 'active' ? 'Deactivate user' : 'Activate user'}
            >
              {row.status === 'active' ? (
                <Check className="h-4 w-4" />
              ) : (
                <UserMinus className="h-4 w-4" />
              )}
            </button>
          </div>
        )
      }
    ]
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Admin Panel</h1>
      </div>
      
      <ImpersonationBanner />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button
                onClick={handleAddRole}
                disabled={!selectedUserId}
                className="flex items-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Role to User
              </button>
              
              <button
                onClick={handleRemoveRole}
                disabled={!selectedUserId}
                className="flex items-center w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Remove Role from User
              </button>
              
              <button
                onClick={() => {
                  if (!selectedUserId) {
                    notificationStore.addNotification({
                      id: Date.now().toString(),
                      type: 'warning',
                      title: 'No User Selected',
                      message: 'Please select a user to impersonate.',
                      duration: 5000
                    });
                    return;
                  }
                  handleImpersonateUser(selectedUserId);
                }}
                disabled={!selectedUserId}
                className="flex items-center w-full px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <User className="h-4 w-4 mr-2" />
                Impersonate Selected User
              </button>
            </div>
            
            <div className="mt-8 pt-4 border-t border-border">
              <h3 className="font-medium mb-4">Admin Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Users:</span>
                  <span>{dataStore.users.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Users:</span>
                  <span>{dataStore.users.filter(u => u.status === 'active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admins:</span>
                  <span>{dataStore.users.filter(u => u.role === 'Admin').length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-3">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Manage Users</CardTitle>
            <button
              onClick={() => {
                uiStore.openModal({
                  title: 'Add New User',
                  content: (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                        <input
                          id="name"
                          type="text"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                        <input
                          id="email"
                          type="email"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter email"
                        />
                      </div>
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
                        <select
                          id="role"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          defaultValue="User"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="User">User</option>
                        </select>
                      </div>
                    </div>
                  ),
                  onConfirm: () => {
                    // In a real app, we'd get values from form
                    dataStore.addUser({
                      name: 'New User',
                      email: 'new.user@example.com',
                      role: 'User',
                      department: 'IT',
                      status: 'pending'
                    });
                    
                    notificationStore.addNotification({
                      id: Date.now().toString(),
                      type: 'success',
                      title: 'User Added',
                      message: 'The new user has been added successfully.',
                      duration: 5000
                    });
                  },
                  confirmText: 'Add User'
                });
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </button>
          </CardHeader>
          <CardContent>
            {usersTableWithActions && (
              <DataGrid 
                data={usersTableWithActions}
                isLoading={dataStore.loading['table_users']}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Impersonation Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none dark:prose-invert">
            <p>
              User impersonation allows administrators to view the portal as another user to assist with troubleshooting or verify permission settings.
            </p>
            
            <p className="font-medium mt-4">How to use impersonation:</p>
            
            <ol className="list-decimal pl-5 space-y-2">
              <li>Select a user from the table by clicking the radio button</li>
              <li>Click the "Impersonate Selected User" button</li>
              <li>Confirm the action in the modal dialog</li>
              <li>Navigate the portal as the selected user</li>
              <li>When finished, click "End Impersonation" in the banner at the top</li>
            </ol>
            
            <div className="bg-muted p-4 rounded-md mt-4">
              <p className="font-medium">Important Notes:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>All actions taken while impersonating a user are logged</li>
                <li>Impersonation should only be used for legitimate administrative purposes</li>
                <li>User impersonation does not reveal password information</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default AdminPanel;
