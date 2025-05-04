import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/storeFunctions';
import { useNavigate } from 'react-router-dom';
import { ENV } from '@/config/env';
import { 
  FileUp, 
  Search, 
  Filter, 
  SortDesc, 
  SortAsc, 
  ListFilter, 
  X, 
  User,
  Share2,
  LayoutGrid,
  List
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { useDebounce } from '@/hooks';
import { Document } from '@/store/types';
import { DocumentList } from './DocumentList';
import { FeatureErrorBoundary } from '@/features/shared/components/ErrorBoundary';
import { generateMockDocuments } from '@/utils/mockDocuments';
import { runInAction } from 'mobx';
import { documentCache } from '../store/DocumentStore';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DocumentListView = observer(() => {
  const navigate = useNavigate();
  const { documentStore, userStore } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'list'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce search term changes
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Component mount - fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("DocumentListView mounted, fetching documents");
        const userId = userStore.currentUser?.id;
        
        const result = await documentStore.fetchDocuments();
        console.log("Documents fetched:", result.length);
        
        // If no documents and mock auth is enabled, try to initialize some data
        if (result.length === 0 && ENV.FEATURES.mockAuth && userId) {
          console.log("No documents found with mock auth enabled, initializing mock data");
          // Create mock documents
          const mockDocuments = generateMockDocuments(userId, 20);
          
          // Add them to the store
          runInAction(() => {
            documentCache.set(mockDocuments);
            documentStore.setDocuments(mockDocuments);
          });
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Failed to load documents. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [documentStore, userStore.currentUser?.id]);
  
  // Apply search filter when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      setIsLoading(true);
      documentStore.setFilter({ searchTerm: debouncedSearchTerm });
      documentStore.fetchDocuments().finally(() => setIsLoading(false));
    }
  }, [debouncedSearchTerm, documentStore]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const updateFilters = async (filterUpdates: Partial<DocumentFilter>) => {
    setIsLoading(true);
    setError(null);
    try {
      documentStore.setFilter(filterUpdates);
      await documentStore.fetchDocuments();
    } catch (err) {
      console.error("Error updating filters:", err);
      setError("Failed to apply filters. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFilterOwned = () => {
    const filters = documentStore.filters;
    updateFilters({ 
      ownedByMe: !filters.ownedByMe,
      // If enabling "owned by me", disable "shared with me"
      sharedWithMe: filters.ownedByMe ? filters.sharedWithMe : false
    });
  };

  const toggleFilterShared = () => {
    const filters = documentStore.filters;
    updateFilters({ 
      sharedWithMe: !filters.sharedWithMe,
      // If enabling "shared with me", disable "owned by me"
      ownedByMe: filters.sharedWithMe ? filters.ownedByMe : false
    });
  };

  const setSortBy = (sortBy: 'name' | 'date' | 'size') => {
    updateFilters({ sortBy });
  };

  const toggleSortDirection = () => {
    const filters = documentStore.filters;
    updateFilters({ 
      sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' 
    });
  };

  const clearFilters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      documentStore.resetFilter();
      setSearchTerm('');
      await documentStore.fetchDocuments();
    } catch (err) {
      console.error("Error clearing filters:", err);
      setError("Failed to clear filters. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentClick = (document: Document) => {
    navigate(`/documents/${document.id}`);
  };

  const handleUploadClick = () => {
    navigate('/documents/upload');
  };

  const handleViewTypeChange = (value: string) => {
    if (value === 'grid' || value === 'list') {
      setViewType(value);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Button onClick={handleUploadClick} className="flex items-center" aria-label="Upload document">
          <FileUp className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search documents..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
                aria-label="Search documents"
              />
            </div>

            <div className="flex items-center gap-2">
              <ToggleGroup type="single" value={viewType} onValueChange={handleViewTypeChange} aria-label="View type">
                <ToggleGroupItem value="list" aria-label="List view">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1" aria-label="Filter documents">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={documentStore.filters.ownedByMe}
                    onCheckedChange={toggleFilterOwned}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Owned by me
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={documentStore.filters.sharedWithMe}
                    onCheckedChange={toggleFilterShared}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Shared with me
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1" aria-label="Sort documents">
                    <ListFilter className="h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup 
                    value={documentStore.filters.sortBy}
                    onValueChange={(value) => setSortBy(value as 'name' | 'date' | 'size')}
                  >
                    <DropdownMenuRadioItem value="name">
                      Name
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="date">
                      Date
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="size">
                      Size
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={toggleSortDirection}>
                    {documentStore.filters.sortDirection === 'asc' ? (
                      <>
                        <SortAsc className="mr-2 h-4 w-4" />
                        Ascending
                      </>
                    ) : (
                      <>
                        <SortDesc className="mr-2 h-4 w-4" />
                        Descending
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {(searchTerm || documentStore.filters.ownedByMe || documentStore.filters.sharedWithMe || 
                documentStore.filters.sortBy !== 'date' || documentStore.filters.sortDirection !== 'desc') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="gap-1"
                  aria-label="Clear filters"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <FeatureErrorBoundary>
        <DocumentList 
          documents={documentStore.filteredDocuments}
          onDocumentClick={handleDocumentClick}
          isLoading={isLoading}
          viewType={viewType}
        />
      </FeatureErrorBoundary>
    </div>
  );
}); 