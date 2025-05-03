
import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
}

export interface TableData {
  columns: {
    id: string;
    header: string;
    accessorKey?: string;
    cell?: (row: any) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
  }[];
  rows: Record<string, any>[];
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
}

export class DataStore {
  rootStore: RootStore;
  
  // Dashboard data
  dashboardCharts: Record<string, ChartData> = {};
  
  // Table data for various components
  tableData: Record<string, TableData> = {};
  
  // Users list for admin panel
  users: UserData[] = [];
  
  // Loading states
  loading: Record<string, boolean> = {};
  
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    
    // Initialize with mock data
    this.initMockData();
    
    makeAutoObservable(this, { rootStore: false });
  }
  
  // For demo purposes, initialize with mock data
  private initMockData() {
    // Dashboard chart data
    this.dashboardCharts = {
      'monthlyActivity': {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'User Activity',
            data: [65, 59, 80, 81, 56, 55],
            borderColor: 'hsl(212, 100%, 40%)'
          },
          {
            label: 'System Performance',
            data: [28, 48, 40, 19, 86, 27],
            borderColor: 'hsl(134, 61%, 41%)'
          }
        ]
      },
      'userDistribution': {
        labels: ['Admin', 'Manager', 'User', 'Guest'],
        datasets: [
          {
            label: 'User Roles',
            data: [12, 19, 35, 5],
            backgroundColor: [
              'hsl(354, 70%, 54%)',
              'hsl(45, 100%, 51%)',
              'hsl(212, 100%, 40%)',
              'hsl(134, 61%, 41%)'
            ]
          }
        ]
      }
    };
    
    // Users data
    this.users = [
      { 
        id: '1', 
        name: 'John Doe', 
        email: 'john.doe@example.com',
        role: 'Admin',
        department: 'IT',
        status: 'active',
        lastLogin: '2023-05-01T10:30:00Z'
      },
      { 
        id: '2', 
        name: 'Jane Smith', 
        email: 'jane.smith@example.com',
        role: 'Manager',
        department: 'HR',
        status: 'active',
        lastLogin: '2023-05-02T14:20:00Z'
      },
      { 
        id: '3', 
        name: 'Robert Johnson', 
        email: 'robert.j@example.com',
        role: 'User',
        department: 'Finance',
        status: 'inactive',
        lastLogin: '2023-04-28T09:15:00Z'
      },
      { 
        id: '4', 
        name: 'Emily Davis', 
        email: 'emily.d@example.com',
        role: 'User',
        department: 'Marketing',
        status: 'active',
        lastLogin: '2023-05-03T11:45:00Z'
      },
      { 
        id: '5', 
        name: 'Michael Wilson', 
        email: 'michael.w@example.com',
        role: 'Manager',
        department: 'Operations',
        status: 'pending',
        lastLogin: '2023-05-01T16:30:00Z'
      }
    ];
    
    // Data grid example
    this.tableData = {
      'users': {
        columns: [
          { id: 'name', header: 'Name', accessorKey: 'name', sortable: true, filterable: true },
          { id: 'email', header: 'Email', accessorKey: 'email', sortable: true, filterable: true },
          { id: 'role', header: 'Role', accessorKey: 'role', sortable: true, filterable: true },
          { id: 'department', header: 'Department', accessorKey: 'department', sortable: true, filterable: true },
          { id: 'status', header: 'Status', accessorKey: 'status', sortable: true, filterable: true },
          { id: 'lastLogin', header: 'Last Login', accessorKey: 'lastLogin', sortable: true }
        ],
        rows: this.users
      },
      'accountActivity': {
        columns: [
          { id: 'date', header: 'Date', accessorKey: 'date', sortable: true },
          { id: 'transaction', header: 'Transaction', accessorKey: 'transaction', sortable: true, filterable: true },
          { id: 'amount', header: 'Amount', accessorKey: 'amount', sortable: true },
          { id: 'balance', header: 'Balance', accessorKey: 'balance', sortable: true },
          { id: 'status', header: 'Status', accessorKey: 'status', sortable: true, filterable: true }
        ],
        rows: [
          { id: '1', date: '2023-05-01', transaction: 'Deposit', amount: '$1,250.00', balance: '$5,400.00', status: 'completed' },
          { id: '2', date: '2023-04-28', transaction: 'Withdrawal', amount: '$350.00', balance: '$4,150.00', status: 'completed' },
          { id: '3', date: '2023-04-25', transaction: 'Payment', amount: '$420.00', balance: '$4,500.00', status: 'completed' },
          { id: '4', date: '2023-04-20', transaction: 'Deposit', amount: '$2,000.00', balance: '$4,920.00', status: 'completed' },
          { id: '5', date: '2023-04-15', transaction: 'Transfer', amount: '$500.00', balance: '$2,920.00', status: 'pending' }
        ]
      }
    };
  }
  
  // Simulate API loading
  fetchData = async (key: string) => {
    this.loading[key] = true;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Data is already loaded in constructor for demo
    this.loading[key] = false;
    
    return key.includes('chart') 
      ? this.dashboardCharts[key.replace('chart_', '')] 
      : this.tableData[key.replace('table_', '')];
  }
  
  // Add a new user (admin function)
  addUser = (user: Omit<UserData, 'id' | 'lastLogin'>) => {
    const newUser = {
      ...user,
      id: (this.users.length + 1).toString(),
      lastLogin: 'Never'
    };
    
    this.users.push(newUser);
    this.tableData['users'].rows = this.users;
    
    return newUser;
  }
  
  // Update user role (admin function)
  updateUserRole = (userId: string, role: string) => {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      this.tableData['users'].rows = [...this.users];
    }
  }
  
  // Toggle user status (admin function)
  toggleUserStatus = (userId: string) => {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = user.status === 'active' ? 'inactive' : 'active';
      this.tableData['users'].rows = [...this.users];
    }
  }
}
