import React, { useState, useEffect } from 'react';
import { Document } from '@/store/types';
import { Card, CardContent } from '@/components/ui/card';
import { FileIcon, FolderIcon, Share2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from 'date-fns';
import { useMemoized } from '@/hooks';

interface DocumentListProps {
  documents: Document[];
  onDocumentClick: (document: Document) => void;
  isLoading?: boolean;
  viewType?: 'grid' | 'list';
}

export function DocumentList({
  documents,
  onDocumentClick,
  isLoading = false,
  viewType = 'list'
}: DocumentListProps) {
  
  // Debug logging
  useEffect(() => {
    console.log("DocumentList rendered with", documents.length, "documents");
    console.log("Current view type:", viewType);
    if (documents.length > 0) {
      console.log("First document:", documents[0].fileName);
    }
  }, [documents, viewType]);
  
  // Get document file icon based on file type - memoized for better performance
  const getFileTypeIcon = useMemoized((fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileIcon className="h-6 w-6 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileIcon className="h-6 w-6 text-blue-500" />;
    } else if (fileType.includes('sheet') || fileType.includes('excel')) {
      return <FileIcon className="h-6 w-6 text-green-500" />;
    } else if (fileType.includes('image')) {
      return <FileIcon className="h-6 w-6 text-purple-500" />;
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
      return <FileIcon className="h-6 w-6 text-yellow-500" />;
    } else if (fileType.includes('folder')) {
      return <FolderIcon className="h-6 w-6 text-amber-500" />;
    }
    return <FileIcon className="h-6 w-6 text-gray-500" />;
  });
  
  // Format file size - memoized for better performance
  const formatFileSize = useMemoized((size: number): string => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
  });
  
  // Format relative time - memoized for better performance
  const formatRelativeTime = useMemoized((dateString: string): string => {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  });
  
  // Render loading skeleton if isLoading
  if (isLoading) {
    return (
      <div className={viewType === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
        {Array.from({ length: viewType === 'grid' ? 9 : 5 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="py-4">
              <div className={`${viewType === 'grid' ? "flex flex-col items-center text-center" : "flex items-center"} space-x-4`}>
                <div className={`${viewType === 'grid' ? "h-24 w-24 mb-4" : "h-10 w-10"} rounded-md bg-gray-200`}></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/3 rounded bg-gray-200"></div>
                </div>
                {viewType === 'list' && <div className="h-4 w-20 rounded bg-gray-200"></div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Render empty state
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FolderIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No documents found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a document or adjust your filters to see results.
        </p>
      </div>
    );
  }
  
  // Grid view
  if (viewType === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
          <Card
            key={document.id}
            className="hover:bg-accent cursor-pointer transition-colors duration-200"
            onClick={() => onDocumentClick(document)}
          >
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4">
                {getFileTypeIcon(document.fileType)}
              </div>
              
              <div>
                <div className="flex items-center justify-center">
                  <h3 className="text-sm font-medium truncate mr-2">
                    {document.metadata?.title || document.fileName || "Untitled Document"}
                  </h3>
                  {document.sharedWith && document.sharedWith.length > 0 && (
                    <Share2Icon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground truncate">
                  {formatFileSize(document.fileSize || 0)} • Updated {formatRelativeTime(document.updatedAt || new Date().toISOString())}
                </p>
                
                <div className="flex flex-wrap justify-center mt-2 gap-1">
                  {document.metadata?.category && (
                    <Badge variant="secondary" className="text-xs">
                      {document.metadata.category}
                    </Badge>
                  )}
                  
                  {document.metadata?.tags && document.metadata.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  
                  {document.metadata?.tags && document.metadata.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{document.metadata.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                v{document.currentVersion}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // List view
  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card
          key={document.id}
          className="mb-3 hover:bg-accent cursor-pointer transition-colors duration-200"
          onClick={() => onDocumentClick(document)}
        >
          <CardContent className="flex items-center p-4">
            <div className="flex-shrink-0 mr-4">
              {getFileTypeIcon(document.fileType)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h3 className="text-sm font-medium truncate mr-2">
                  {document.metadata?.title || document.fileName || "Untitled Document"}
                </h3>
                {document.sharedWith && document.sharedWith.length > 0 && (
                  <Share2Icon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              <p className="text-xs text-muted-foreground truncate">
                {formatFileSize(document.fileSize || 0)} • Updated {formatRelativeTime(document.updatedAt || new Date().toISOString())}
              </p>
              
              <div className="flex flex-wrap mt-2 gap-1">
                {document.metadata?.category && (
                  <Badge variant="secondary" className="text-xs">
                    {document.metadata.category}
                  </Badge>
                )}
                
                {document.metadata?.tags && document.metadata.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                
                {document.metadata?.tags && document.metadata.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{document.metadata.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0 ml-4 text-xs text-muted-foreground">
              v{document.currentVersion}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 