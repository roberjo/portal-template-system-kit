import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '../../test/test-utils';
import { DataGrid } from './DataGrid';
import { TableData } from '../../store/types';

describe('DataGrid Component', () => {
  const mockData: TableData = {
    columns: [
      { id: 'id', header: 'ID', accessorKey: 'id' },
      { id: 'name', header: 'Name', accessorKey: 'name', sortable: true },
      { id: 'email', header: 'Email', accessorKey: 'email' },
      { id: 'role', header: 'Role', accessorKey: 'role', filterable: true },
    ],
    data: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
      { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'User' },
      { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin' },
      { id: '6', name: 'Diana Clark', email: 'diana@example.com', role: 'Editor' },
      { id: '7', name: 'Edward Hall', email: 'edward@example.com', role: 'User' },
      { id: '8', name: 'Fiona Green', email: 'fiona@example.com', role: 'Admin' },
      { id: '9', name: 'George Lee', email: 'george@example.com', role: 'User' },
      { id: '10', name: 'Helen Young', email: 'helen@example.com', role: 'Editor' },
      { id: '11', name: 'Ivan Morris', email: 'ivan@example.com', role: 'User' },
      { id: '12', name: 'Julia White', email: 'julia@example.com', role: 'Admin' },
    ]
  };

  it('renders correctly with data', () => {
    render(<DataGrid data={mockData} />);
    
    // Check headers
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    
    // Check data rows (first page only - 10 rows)
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.queryByText('Julia White')).not.toBeInTheDocument(); // Should be on second page
  });
  
  it('shows loading state', () => {
    render(<DataGrid data={mockData} isLoading={true} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('shows empty state when no data', () => {
    const emptyData: TableData = {
      columns: mockData.columns,
      data: []
    };
    
    render(<DataGrid data={emptyData} />);
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
  
  it('handles row clicks', () => {
    const handleRowClick = vi.fn();
    render(<DataGrid data={mockData} onRowClick={handleRowClick} />);
    
    // Click the first row
    const firstRowCells = screen.getAllByText('John Doe');
    fireEvent.click(firstRowCells[0]);
    
    expect(handleRowClick).toHaveBeenCalledTimes(1);
    expect(handleRowClick).toHaveBeenCalledWith(mockData.data[0]);
  });
  
  it('performs sorting when column header is clicked', () => {
    render(<DataGrid data={mockData} />);
    
    // Get the name column sort button
    const nameColumnHeader = screen.getByText('Name').closest('th');
    if (!nameColumnHeader) throw new Error('Name column header not found');
    
    const sortButton = within(nameColumnHeader).getByRole('button', { name: /Sort by Name/i });
    
    // Initial order (A-Z)
    let firstRow = screen.getAllByRole('row')[1]; // First data row (after header)
    expect(within(firstRow).getByText('John Doe')).toBeInTheDocument();
    
    // Click to sort ascending
    fireEvent.click(sortButton);
    
    // Click again to sort descending
    fireEvent.click(sortButton);
    
    // Now the first row should be different (Z-A)
    firstRow = screen.getAllByRole('row')[1];
    expect(within(firstRow).getByText('Julia White')).toBeInTheDocument();
  });
  
  it('filters data when search term is entered', () => {
    render(<DataGrid data={mockData} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    
    // Search for "admin" to filter by role
    fireEvent.change(searchInput, { target: { value: 'admin' } });
    
    // Should only show admin users
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Charlie Wilson')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Should show all users again (first page)
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
  
  it('renders custom actions', () => {
    const customActions = <button>Custom Action</button>;
    render(<DataGrid data={mockData} actions={customActions} />);
    
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });
  
  it('handles pagination correctly', () => {
    render(<DataGrid data={mockData} />);
    
    // Initially shows first page
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Julia White')).not.toBeInTheDocument(); // on second page
    
    // Go to next page
    const nextPageButton = screen.getByLabelText('Go to next page');
    fireEvent.click(nextPageButton);
    
    // Now second page should be visible
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument(); // no longer visible
    expect(screen.getByText('Julia White')).toBeInTheDocument(); // now visible
    
    // Go back to first page
    const prevPageButton = screen.getByLabelText('Go to previous page');
    fireEvent.click(prevPageButton);
    
    // First page should be visible again
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Julia White')).not.toBeInTheDocument();
  });
}); 