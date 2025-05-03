import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store/StoreContext';
import { useNavigate } from 'react-router-dom';
import { 
  FileUp, 
  Search, 
  Filter, 
  SortDesc, 
  SortAsc, 
  ListFilter, 
  X, 
  FileText,
  FileImage, 
  FileSpreadsheet,
  FileArchive, 
  FileCode, 
  FileQuestion,
  Share2,
  Calendar,
  Tag,
  CheckSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Document, DocumentFilter } from '../store/types';
import { formatFileSize } from '../utils/formatters';

const DocumentList = observer(() => {
  const navigate = useNavigate();
  const { documentStore } = useStore();
  const { documents, loading, filters, fetchDocuments, setFilter, resetFilter } = documentStore;
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({ searchTerm });
    fetchDocuments();
  };

  const toggleFilterOwned = () => {
    setFilter({ 
      ownedByMe: !filters.ownedByMe,
      // If enabling "owned by me", disable "shared with me"
      sharedWithMe: filters.ownedByMe ? filters.sharedWithMe : false
    });
    fetchDocuments();
  };

  const toggleFilterShared = () => {
    setFilter({ 
      sharedWithMe: !filters.sharedWithMe,
      // If enabling "shared with me", disable "owned by me"
      ownedByMe: filters.sharedWithMe ? filters.ownedByMe : false
    });
    fetchDocuments();
  };

  const setSortBy = (sortBy: 'name' | 'date' | 'size') => {
    setFilter({ sortBy });
    fetchDocuments();
  };

  const toggleSortDirection = () => {
    setFilter({ 
      sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' 
    });
    fetchDocuments();
  };

  const clearFilters = () => {
    resetFilter();
    setSearchTerm('');
    fetchDocuments();
  };

  const handleDocumentClick = (documentId: string) => {
    navigate(`/documents/${documentId}`);
  };

  const getFileIcon = (fileType: string, className: string = 'h-6 w-6') => {
    if (fileType.includes('image')) return <FileImage className={className} />;
    if (fileType.includes('pdf')) return <FileText className={className} />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) return <FileSpreadsheet className={className} />;
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return <FileQuestion className={className} />;
    if (fileType.includes('zip') || fileType.includes('archive') || fileType.includes('compressed')) return <FileArchive className={className} />;
    if (fileType.includes('code') || fileType.includes('javascript') || fileType.includes('html') || fileType.includes('css')) return <FileCode className={className} />;
    return <FileQuestion className={className} />;
  };

  const handleUploadClick = () => {
    navigate('/documents/upload');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">Securely manage, share, and track your documents</p>
        </div>
        <Button onClick={handleUploadClick}>
          <FileUp className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>
                {documents.length} document{documents.length !== 1 ? 's' : ''} available
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <form 
                onSubmit={handleSearchSubmit}
                className="flex w-full md:w-auto"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search documents..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="secondary" className="ml-2">
                  Search
                </Button>
              </form>

              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuCheckboxItem
                      checked={filters.ownedByMe}
                      onCheckedChange={toggleFilterOwned}
                    >
                      Owned by me
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filters.sharedWithMe}
                      onCheckedChange={toggleFilterShared}
                    >
                      Shared with me
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={clearFilters}
                      className="justify-center text-red-500"
                    >
                      Reset Filters
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <ListFilter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup 
                      value={filters.sortBy} 
                      onValueChange={(value) => setSortBy(value as 'name' | 'date' | 'size')}
                    >
                      <DropdownMenuRadioItem value="name">
                        Sort by Name
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="date">
                        Sort by Date
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="size">
                        Sort by Size
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSortDirection}
                >
                  {filters.sortDirection === 'asc' ? 
                    <SortAsc className="h-4 w-4" /> : 
                    <SortDesc className="h-4 w-4" />
                  }
                </Button>
              </div>
            </div>
          </div>

          {(searchTerm || filters.ownedByMe || filters.sharedWithMe) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex gap-1 items-center">
                  <span>Search: {searchTerm}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilter({ searchTerm: '' });
                      fetchDocuments();
                    }} 
                  />
                </Badge>
              )}
              {filters.ownedByMe && (
                <Badge variant="secondary" className="flex gap-1 items-center">
                  <span>Owned by me</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => {
                      setFilter({ ownedByMe: false });
                      fetchDocuments();
                    }} 
                  />
                </Badge>
              )}
              {filters.sharedWithMe && (
                <Badge variant="secondary" className="flex gap-1 items-center">
                  <span>Shared with me</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => {
                      setFilter({ sharedWithMe: false });
                      fetchDocuments();
                    }} 
                  />
                </Badge>
              )}
              {(searchTerm || filters.ownedByMe || filters.sharedWithMe) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted rounded-full p-3 mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-1">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filters.ownedByMe || filters.sharedWithMe
                  ? "Try changing your search or filters"
                  : "Upload your first document to get started"}
              </p>
              {!(searchTerm || filters.ownedByMe || filters.sharedWithMe) && (
                <Button onClick={handleUploadClick}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((document) => (
                <Card 
                  key={document.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleDocumentClick(document.id)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center p-4 border-b">
                      <div className="bg-muted rounded-md p-2 mr-3">
                        {getFileIcon(document.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate" title={document.metadata.title}>
                          {document.metadata.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {document.fileName}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 text-xs text-muted-foreground">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-3.5 w-3.5 mr-2" />
                        <span>Updated {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <CheckSquare className="h-3.5 w-3.5 mr-2" />
                        <span>Version {document.currentVersion}</span>
                        <span className="mx-2">•</span>
                        <span>{formatFileSize(document.fileSize)}</span>
                      </div>
                      {document.metadata.tags && document.metadata.tags.length > 0 && (
                        <div className="flex items-start mb-2">
                          <Tag className="h-3.5 w-3.5 mr-2 mt-0.5" />
                          <div className="flex flex-wrap gap-1">
                            {document.metadata.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-[10px] h-5 px-1.5 whitespace-nowrap">
                                {tag}
                              </Badge>
                            ))}
                            {document.metadata.tags.length > 3 && (
                              <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                +{document.metadata.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {document.sharedWith.length > 0 && (
                        <div className="flex items-center">
                          <Share2 className="h-3.5 w-3.5 mr-2" />
                          <span>
                            Shared with {document.sharedWith.length} user{document.sharedWith.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default DocumentList; 