import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useStore } from '../store/StoreContext';
import { DataGrid } from '../components/ui/DataGrid';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export const Dashboard = observer(() => {
  const { dataStore, notificationStore, userStore } = useStore();
  const { currentUser } = userStore;
  
  // Load data when component mounts
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await dataStore.fetchData('chart_monthlyActivity');
        await dataStore.fetchData('chart_userDistribution');
        await dataStore.fetchData('table_accountActivity');
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    
    loadDashboardData();
    
    // Welcome notification
    if (currentUser) {
      notificationStore.addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: `Welcome back, ${currentUser.name}`,
        message: 'You have 2 new notifications',
        duration: 5000
      });
    }
  }, []);
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</span>
          <button className="p-2 rounded-md hover:bg-accent transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">1,284</div>
              <div className="p-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-md flex items-center space-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>12%</span>
              </div>
            </div>
            <p className="text-muted-foreground mt-2">Compared to last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Average Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">24m</div>
              <div className="p-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 rounded-md flex items-center space-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span>8%</span>
              </div>
            </div>
            <p className="text-muted-foreground mt-2">Compared to last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">98.2%</div>
              <div className="p-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-md flex items-center space-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>3%</span>
              </div>
            </div>
            <p className="text-muted-foreground mt-2">Uptime last 30 days</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>User Activity</CardTitle>
            <LineChartIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-80 rounded-md">
              {dataStore.loading['chart_monthlyActivity'] ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span>Loading chart data...</span>
                </div>
              ) : dataStore.dashboardCharts.monthlyActivity ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dataStore.dashboardCharts.monthlyActivity.labels.map((label, index) => ({
                      name: label,
                      value: dataStore.dashboardCharts.monthlyActivity.datasets[0].data[index]
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={dataStore.dashboardCharts.monthlyActivity.datasets[0].borderColor || '#8884d8'}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <LineChartIcon className="h-16 w-16 mx-auto mb-2 text-primary/50" />
                  <p>No chart data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>User Distribution</CardTitle>
            <PieChartIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-80 rounded-md">
              {dataStore.loading['chart_userDistribution'] ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span>Loading chart data...</span>
                </div>
              ) : dataStore.dashboardCharts.userDistribution ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataStore.dashboardCharts.userDistribution.labels.map((label, index) => ({
                        name: label,
                        value: dataStore.dashboardCharts.userDistribution.datasets[0].data[index]
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {dataStore.dashboardCharts.userDistribution.labels.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={dataStore.dashboardCharts.userDistribution.datasets[0].backgroundColor?.[index] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <PieChartIcon className="h-16 w-16 mx-auto mb-2 text-primary/50" />
                  <p>No chart data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Recent Account Activity</CardTitle>
          <BarChartIcon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {dataStore.tableData['accountActivity'] && (
            <DataGrid 
              data={dataStore.tableData['accountActivity']}
              isLoading={dataStore.loading['table_accountActivity']}
              actions={
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Export
                </button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default Dashboard;
