
import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { TableData } from '../../store/DataStore';

interface DataGridProps {
  data: TableData;
  onRowClick?: (row: any) => void;
  actions?: React.ReactNode;
  isLoading?: boolean;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  [key: string]: string;
}

export const DataGrid: React.FC<DataGridProps> = ({
  data,
  onRowClick,
  actions,
  isLoading = false
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  // Handle sorting
  const handleSort = (columnId: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === columnId && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnId, direction });
  };
  
  // Apply sorting
  const sortedRows = React.useMemo(() => {
    let sortableRows = [...data.rows];
    
    if (sortConfig) {
      sortableRows.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableRows;
  }, [data.rows, sortConfig]);
  
  // Apply filtering
  const filteredRows = React.useMemo(() => {
    return sortedRows.filter(row => {
      // Filter by column filters
      for (const [key, value] of Object.entries(filterConfig)) {
        if (value && !String(row[key]).toLowerCase().includes(value.toLowerCase())) {
          return false;
        }
      }
      
      // Filter by global search
      if (searchTerm) {
        return data.columns.some(column => {
          const accessorKey = column.accessorKey;
          return accessorKey && String(row[accessorKey]).toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
      
      return true;
    });
  }, [sortedRows, filterConfig, searchTerm, data.columns]);
  
  // Pagination
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  
  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-wrap justify-between items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        {/* Actions slot */}
        {actions}
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full data-grid">
          <thead>
            <tr>
              {data.columns.map((column) => (
                <th key={column.id} className="px-4 py-3 text-left">
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.accessorKey || column.id)}
                        className="p-1 rounded hover:bg-accent/50"
                        aria-label={`Sort by ${column.header}`}
                      >
                        {sortConfig?.key === (column.accessorKey || column.id) ? (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </button>
                    )}
                    
                    {column.filterable && (
                      <div className="relative">
                        <button
                          className="p-1 rounded hover:bg-accent/50"
                          aria-label={`Filter ${column.header}`}
                        >
                          <Filter className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={data.columns.length} className="p-4 text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={data.columns.length} className="p-4 text-center">
                  No data available
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => (
                <tr 
                  key={row.id} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? "hover:bg-accent/50 cursor-pointer" : ""}
                >
                  {data.columns.map((column) => (
                    <td key={`${row.id}-${column.id}`} className="px-4 py-3">
                      {column.cell ? column.cell(row) : row[column.accessorKey || column.id]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredRows.length)} of {filteredRows.length} entries
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-input bg-background disabled:opacity-50"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background border border-input'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-input bg-background disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
