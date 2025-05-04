import { makeAutoObservable } from 'mobx';
import { 
  IDataStore, 
  TableData, 
  ChartData,
  UserData
} from './types';
import { ENV } from '../config/env';

export class DataStore implements IDataStore {
  // Dashboard data
  dashboardCharts: Record<string, ChartData> = {};
  
  // Table data for various components
  tableData: Record<string, TableData> = {};
  
  // Users list for admin panel
  users: UserData[] = [];
  
  // Loading states
  loading: Record<string, boolean> = {};
  
  constructor() {
    makeAutoObservable(this);
    
    console.log("DataStore constructor - initializing mock data");
    // Initialize with mock data
    this.initMockData();
  }
  
  private initMockData = () => {
    // Mock chart data
    this.dashboardCharts = {
      monthlyActivity: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Users',
            data: [65, 59, 80, 81, 56, 55],
            borderColor: 'rgba(75, 192, 192, 1)'
          }
        ]
      },
      userDistribution: {
        labels: ['Admin', 'Manager', 'User'],
        datasets: [
          {
            label: 'Users by Role',
            data: [15, 30, 55],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)'
            ]
          }
        ]
      }
    };
    
    // Mock table data
    this.tableData = {
      accountActivity: {
        columns: [
          { id: 'date', header: 'Date', accessorKey: 'date' },
          { id: 'user', header: 'User', accessorKey: 'user' },
          { id: 'action', header: 'Action', accessorKey: 'action' },
          { id: 'ip', header: 'IP Address', accessorKey: 'ip' }
        ],
        data: [
          { id: '1', date: '2023-09-01 09:15', user: 'John Doe', action: 'Login', ip: '192.168.1.1' },
          { id: '2', date: '2023-09-01 14:22', user: 'Jane Smith', action: 'Profile Update', ip: '192.168.1.45' },
          { id: '3', date: '2023-09-02 10:08', user: 'Alice Johnson', action: 'Password Change', ip: '192.168.2.15' }
        ],
        pagination: {
          pageIndex: 0,
          pageSize: 10,
          pageCount: 1,
          total: 3
        }
      }
    };
    
    // Mock users
    this.users = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        status: 'active',
        lastLogin: '2023-09-01 09:15',
        created: '2023-01-15'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Manager',
        status: 'active',
        lastLogin: '2023-09-01 14:22',
        created: '2023-02-20'
      },
      {
        id: '3',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'User',
        status: 'inactive',
        lastLogin: '2023-08-15 11:30',
        created: '2023-03-10'
      }
    ];
    
    console.log(`DataStore initialized with ${this.users.length} users`);
  }
  
  fetchData = async (dataKey: string, params?: Record<string, unknown>): Promise<unknown> => {
    this.loading[dataKey] = true;
    
    try {
      if (ENV.FEATURES.mockAuth) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return mock data based on dataKey
        switch (dataKey) {
          case 'chart_monthlyActivity':
            return this.dashboardCharts.monthlyActivity;
          
          case 'chart_userDistribution':
            return this.dashboardCharts.userDistribution;
            
          case 'table_accountActivity':
            return this.tableData.accountActivity;
            
          case 'table_users':
            // Create users table data on the fly from the users array
            if (!this.tableData.users) {
              this.tableData.users = {
                columns: [
                  { id: 'name', header: 'Name', accessorKey: 'name' },
                  { id: 'email', header: 'Email', accessorKey: 'email' },
                  { id: 'role', header: 'Role', accessorKey: 'role' },
                  { id: 'status', header: 'Status', accessorKey: 'status' },
                  { id: 'lastLogin', header: 'Last Login', accessorKey: 'lastLogin' }
                ],
                data: this.users || [] // Ensure data is always an array
              };
            } else {
              // Ensure tableData.users always has the data property as an array
              if (!this.tableData.users.data) {
                this.tableData.users.data = [];
              }
            }
            return this.tableData.users;
            
          default:
            // Return an empty structured data object for tables
            if (dataKey.startsWith('table_')) {
              return {
                columns: [],
                data: []
              };
            }
            throw new Error(`No mock data available for ${dataKey}`);
        }
      } else {
        // Real API call
        const queryParams = params 
          ? '?' + new URLSearchParams(params as Record<string, string>).toString() 
          : '';
          
        const response = await fetch(`${ENV.API_URL}/data/${dataKey}${queryParams}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${dataKey}`);
        }
        
        const data = await response.json();
        
        // Ensure table data has proper structure
        if (dataKey.startsWith('table_') && data) {
          if (!data.columns) data.columns = [];
          if (!data.data) data.data = [];
          
          // Store in the tableData cache
          const tableKey = dataKey.replace('table_', '');
          this.tableData[tableKey] = data;
        }
        
        return data;
      }
    } catch (error) {
      console.error(`Error fetching ${dataKey}:`, error);
      
      // Return safe defaults for different data types
      if (dataKey.startsWith('table_')) {
        return { columns: [], data: [] };
      } else if (dataKey.startsWith('chart_')) {
        return { labels: [], datasets: [] };
      }
      
      throw error;
    } finally {
      this.loading[dataKey] = false;
    }
  }
  
  createData = async (dataType: string, data: Record<string, unknown>): Promise<unknown> => {
    const key = `create_${dataType}`;
    this.loading[key] = true;
    
    try {
      if (ENV.FEATURES.mockAuth) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Prepare variable before the switch to avoid lexical declaration warning
        let newUser: UserData;
        
        // Handle mock creation
        switch (dataType) {
          case 'user':
            newUser = {
              id: Date.now().toString(),
              name: (data.name as string) || 'New User',
              email: (data.email as string) || 'user@example.com',
              role: (data.role as string) || 'User',
              status: (data.status as 'active' | 'inactive' | 'pending') || 'active',
              lastLogin: (data.lastLogin as string) || '-',
              created: new Date().toISOString().split('T')[0],
              ...(data as Partial<UserData>)
            };
            this.users = [...this.users, newUser];
            return newUser;
            
          default:
            throw new Error(`Cannot create mock data for ${dataType}`);
        }
      } else {
        // Real API call
        const response = await fetch(`${ENV.API_URL}/${dataType}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create ${dataType}`);
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error(`Error creating ${dataType}:`, error);
      throw error;
    } finally {
      this.loading[key] = false;
    }
  }
  
  updateData = async (dataType: string, id: string, data: Record<string, unknown>): Promise<unknown> => {
    const key = `update_${dataType}_${id}`;
    this.loading[key] = true;
    
    try {
      if (ENV.FEATURES.mockAuth) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Prepare variable before the switch to avoid lexical declaration warning
        let updatedData: unknown;
        
        // Handle mock update
        switch (dataType) {
          case 'user':
            this.users = this.users.map(user => 
              user.id === id ? { ...user, ...data as Partial<UserData> } : user
            );
            updatedData = this.users.find(user => user.id === id);
            break;
            
          default:
            throw new Error(`Cannot update mock data for ${dataType}`);
        }
        
        return updatedData;
      } else {
        // Real API call
        const response = await fetch(`${ENV.API_URL}/${dataType}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update ${dataType}`);
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error(`Error updating ${dataType}:`, error);
      throw error;
    } finally {
      this.loading[key] = false;
    }
  }
  
  deleteData = async (dataType: string, id: string): Promise<boolean> => {
    const key = `delete_${dataType}_${id}`;
    this.loading[key] = true;
    
    try {
      if (ENV.FEATURES.mockAuth) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Handle mock deletion
        switch (dataType) {
          case 'user':
            this.users = this.users.filter(user => user.id !== id);
            return true;
            
          default:
            throw new Error(`Cannot delete mock data for ${dataType}`);
        }
      } else {
        // Real API call
        const response = await fetch(`${ENV.API_URL}/${dataType}/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete ${dataType}`);
        }
        
        return true;
      }
    } catch (error) {
      console.error(`Error deleting ${dataType}:`, error);
      throw error;
    } finally {
      this.loading[key] = false;
    }
  }
  
  // Helper functions for UI components
  addUser = (userData: Partial<UserData>): void => {
    const newUser: UserData = {
      id: Date.now().toString(),
      name: userData.name || 'New User',
      email: userData.email || 'user@example.com',
      role: userData.role || 'User',
      status: userData.status || 'active',
      lastLogin: userData.lastLogin || '-',
      created: userData.created || new Date().toISOString().split('T')[0],
      ...userData
    };
    
    this.users.push(newUser);
    
    // Update the users table data if it exists
    if (this.tableData.users) {
      this.tableData.users.data = this.users;
    }
  }
  
  toggleUserStatus = (userId: string): void => {
    this.users = this.users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          status: user.status === 'active' ? 'inactive' : 'active'
        };
      }
      return user;
    });
    
    // Update the table data if it exists
    if (this.tableData.users && this.tableData.users.data) {
      this.tableData.users.data = this.tableData.users.data.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            status: user.status === 'active' ? 'inactive' : 'active'
          };
        }
        return user;
      });
    }
  }
}
