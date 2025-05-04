import React, { useEffect, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Check, Edit, Plus, Trash, UserX, User, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DataGrid } from '../components/ui/DataGrid';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import rootStore from '../store/RootStore';
import { TableData } from '@/store/types';
import { useStore } from '../store/storeFunctions';

export const DataGridExample = observer(() => {
  const { dataStore, uiStore, notificationStore } = rootStore;
  
  // Load data when component mounts
  useEffect(() => {
    dataStore.fetchData('table_users');
  }, [dataStore]);
  
  const handleEditUser = (userId: string) => {
    uiStore.openModal({
      title: 'Edit User',
      content: (
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={dataStore.users.find(u => u.id === userId)?.name || ''}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={dataStore.users.find(u => u.id === userId)?.email || ''}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
            <select
              id="role"
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={dataStore.users.find(u => u.id === userId)?.role || ''}
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </select>
          </div>
        </div>
      ),
      onConfirm: () => {
        notificationStore.addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'User Updated',
          message: 'The user has been successfully updated.',
          duration: 5000
        });
      },
      confirmText: 'Save Changes'
    });
  };
  
  const handleDeleteUser = (userId: string) => {
    uiStore.openModal({
      title: 'Confirm Deletion',
      content: (
        <div>
          <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        </div>
      ),
      onConfirm: () => {
        notificationStore.addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'User Deleted',
          message: 'The user has been successfully deleted.',
          duration: 5000
        });
      },
      confirmText: 'Delete User',
      cancelText: 'Cancel'
    });
  };
  
  const handleAddUser = () => {
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
          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-1">Department</label>
            <select
              id="department"
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
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
  };
  
  // Create a useMemo version of the handleEditUser, handleDeleteUser functions
  // to use in the useMemo dependency array
  const memoizedHandleEditUser = useCallback(handleEditUser, [uiStore]);
  const memoizedHandleDeleteUser = useCallback(handleDeleteUser, [uiStore]);

  // Add actions column to table data
  const usersTableWithActions = useMemo(() => {
    if (!dataStore.tableData['users']) {
      return {
        columns: [],
        data: []
      };
    }
    
    return {
      ...dataStore.tableData['users'],
      columns: [
        ...(dataStore.tableData['users']?.columns || []),
        {
          id: 'actions',
          header: 'Actions',
          cell: (row: Record<string, unknown>) => (
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      memoizedHandleEditUser(row.id as string);
                    }}
                    className="p-2 text-primary hover:bg-accent rounded-md transition-colors"
                    aria-label="Edit user"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit user details</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
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
                      <UserX className="h-4 w-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{row.status === 'active' ? 'Deactivate user' : 'Activate user'}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      memoizedHandleDeleteUser(row.id as string);
                    }}
                    className="p-2 text-destructive hover:bg-accent rounded-md transition-colors"
                    aria-label="Delete user"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete user</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )
        }
      ]
    };
  }, [dataStore.tableData['users'], dataStore, memoizedHandleEditUser, memoizedHandleDeleteUser]);
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1>Data Grid Example</h1>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Users Management</CardTitle>
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </CardHeader>
          <CardContent>
            <DataGrid 
              data={usersTableWithActions}
              isLoading={dataStore.loading['table_users']}
              onRowClick={(row) => {
                uiStore.openModal({
                  title: 'User Details',
                  content: (
                    <div className="space-y-4">
                      <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-12 w-12 text-primary/60" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{row.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{row.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Role</p>
                          <p className="font-medium">{row.role}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Department</p>
                          <p className="font-medium">{row.department}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            row.status === 'active' 
                              ? 'bg-success/20 text-success' 
                              : row.status === 'inactive'
                                ? 'bg-destructive/20 text-destructive'
                                : 'bg-warning/20 text-warning'
                          }`}>
                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Login</p>
                          <p className="font-medium">{row.lastLogin}</p>
                        </div>
                      </div>
                    </div>
                  ),
                  size: 'md'
                });
              }}
              actions={
                <div className="flex items-center space-x-2">
                  <select
                    className="px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Bulk Actions</option>
                    <option value="activate">Activate Selected</option>
                    <option value="deactivate">Deactivate Selected</option>
                    <option value="delete">Delete Selected</option>
                  </select>
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors text-sm">
                    Apply
                  </button>
                </div>
              }
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Grid Usage Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p>
                The DataGrid component is a versatile tool for displaying and interacting with tabular data. 
                It provides built-in functionality for:
              </p>
              
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Sorting data by clicking on column headers</li>
                <li>Filtering data using the search box or column filters</li>
                <li>Pagination to handle large datasets efficiently</li>
                <li>Row click actions for viewing details or editing</li>
                <li>Custom action buttons in each row</li>
                <li>Bulk actions for selected items</li>
                <li>Responsive design that works on all device sizes</li>
              </ul>
              
              <p className="mt-4">
                To implement a data grid in your own components, simply import the DataGrid component and 
                provide it with the appropriate data structure as demonstrated in this example.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
});

export default DataGridExample;
