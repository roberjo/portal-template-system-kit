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
  }
  
  fetchData = async (dataKey: string, params?: Record<string, any>): Promise<any> => {
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
            
          default:
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
        
        return await response.json();
      }
    } catch (error) {
      console.error(`Error fetching ${dataKey}:`, error);
      throw error;
    } finally {
      this.loading[dataKey] = false;
    }
  }
  
  createData = async (dataType: string, data: any): Promise<any> => {
    const key = `create_${dataType}`;
    this.loading[key] = true;
    
    try {
      if (ENV.FEATURES.mockAuth) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Handle mock creation
        switch (dataType) {
          case 'user':
            const newUser: UserData = {
              ...data,
              id: Date.now().toString(),
              created: new Date().toISOString().split('T')[0]
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
  
  updateData = async (dataType: string, id: string, data: any): Promise<any> => {
    const key = `update_${dataType}_${id}`;
    this.loading[key] = true;
    
    try {
      if (ENV.FEATURES.mockAuth) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Handle mock update
        switch (dataType) {
          case 'user':
            this.users = this.users.map(user => 
              user.id === id ? { ...user, ...data } : user
            );
            return this.users.find(user => user.id === id);
            
          default:
            throw new Error(`Cannot update mock data for ${dataType}`);
        }
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
  
  deleteData = async (dataType: string, id: string): Promise<any> => {
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
            return { success: true };
            
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
        
        return await response.json();
      }
    } catch (error) {
      console.error(`Error deleting ${dataType}:`, error);
      throw error;
    } finally {
      this.loading[key] = false;
    }
  }
}
