import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/StoreContext';
import { 
  ArrowLeft, 
  FileUp, 
  Download, 
  Trash2, 
  Edit, 
  Share2, 
  History, 
  Tag,
  Eye,
  Calendar,
  FileCog,
  Clock,
  User,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { formatFileSize } from '@/utils/formatters';
import { DocumentVersion, DocumentAuditEntry, DocumentShare } from '@/store/types';
import { FeatureErrorBoundary } from '@/features/shared/components/ErrorBoundary';

interface DocumentDetailsViewProps {
  documentId: string;
}

export const DocumentDetailsView = observer(({ documentId }: DocumentDetailsViewProps) => {
  const navigate = useNavigate();
  const { documentStore, userStore } = useStore();
  const { loading, error, selectedDocument, auditLog, deleteDocument, shareDocument } = documentStore;
  const { versions, loading: versionsLoading } = documentStore.versionStore;
  const { uploadNewVersion } = documentStore.versionStore;
  const { updateDocumentMetadata } = documentStore.metadataStore;
  const [activeTab, setActiveTab] = useState('info');
  const [uploadingVersion, setUploadingVersion] = useState(false);
  const [fileForUpload, setFileForUpload] = useState<File | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (documentId) {
      documentStore.selectDocument(documentId);
    }
    
    // Cleanup selected document when component unmounts
    return () => {
      documentStore.clearSelectedDocument();
    };
  }, [documentId, documentStore]);

  if (loading && !selectedDocument) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !selectedDocument) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-muted-foreground mb-4">{error || 'Document not found'}</p>
        <Button onClick={() => navigate('/documents')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Documents
        </Button>
      </div>
    );
  }

  const { 
    fileName, 
    fileSize, 
    fileType, 
    metadata, 
    currentVersion, 
    sharedWith,
    ownerId,
    ownerName,
    createdAt,
    updatedAt
  } = selectedDocument;

  const isOwner = userStore.currentUser?.id === ownerId;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileForUpload(event.target.files[0]);
    }
  };

  const handleUploadNewVersion = async () => {
    if (!fileForUpload || !documentId) return;
    
    setUploadingVersion(true);
    try {
      await uploadNewVersion(documentId, fileForUpload);
      setFileForUpload(null);
    } catch (error) {
      console.error('Failed to upload new version:', error);
    } finally {
      setUploadingVersion(false);
    }
  };

  const handleDelete = async () => {
    if (!documentId) return;
    
    setDeleting(true);
    try {
      const success = await deleteDocument(documentId);
      if (success) {
        navigate('/documents');
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getVersionInfo = (version: DocumentVersion) => {
    return (
      <div className="border rounded-md p-4 mb-4" key={version.id}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2">v{version.versionNumber}</Badge>
            <span className="text-sm">
              {format(new Date(version.createdAt), 'PPP p')}
            </span>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Uploaded {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
        </p>
      </div>
    );
  };

  const getAuditEntryInfo = (entry: DocumentAuditEntry) => {
    const getActionIcon = () => {
      switch (entry.action) {
        case 'upload': return <FileUp className="h-4 w-4 mr-2" />;
        case 'edit': return <Edit className="h-4 w-4 mr-2" />;
        case 'share': return <Share2 className="h-4 w-4 mr-2" />;
        case 'delete': return <Trash2 className="h-4 w-4 mr-2" />;
        case 'download': return <Download className="h-4 w-4 mr-2" />;
        default: return <FileCog className="h-4 w-4 mr-2" />;
      }
    };

    const getActionText = () => {
      switch (entry.action) {
        case 'upload': return 'Uploaded document';
        case 'edit': return 'Edited document';
        case 'share': return 'Shared document';
        case 'delete': return 'Deleted document';
        case 'download': return 'Downloaded document';
        default: return 'Modified document';
      }
    };

    return (
      <div className="border-b py-3" key={entry.id}>
        <div className="flex items-start">
          <div className="bg-muted rounded-full p-1 mr-3 mt-0.5">
            {getActionIcon()}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
              <div className="font-medium">{getActionText()}</div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(entry.timestamp), 'PPP p')}
              </div>
            </div>
            <div className="text-sm mb-1">{entry.details}</div>
            <div className="text-xs text-muted-foreground">
              <User className="h-3 w-3 inline mr-1" /> {entry.userName}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getShareInfo = (share: DocumentShare) => {
    const getPermissionBadge = () => {
      switch (share.permission) {
        case 'view':
          return <Badge variant="secondary"><Eye className="h-3 w-3 mr-1" /> View</Badge>;
        case 'edit':
          return <Badge variant="secondary"><Edit className="h-3 w-3 mr-1" /> Edit</Badge>;
        case 'admin':
          return <Badge variant="secondary"><Users className="h-3 w-3 mr-1" /> Admin</Badge>;
        default:
          return null;
      }
    };

    return (
      <div className="flex items-center justify-between py-2" key={share.userId}>
        <div className="flex items-center">
          <div className="rounded-full bg-muted w-8 h-8 flex items-center justify-center mr-3">
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{share.userName}</div>
            <div className="text-xs text-muted-foreground">
              Shared {formatDistanceToNow(new Date(share.sharedAt), { addSuffix: true })}
            </div>
          </div>
        </div>
        {getPermissionBadge()}
      </div>
    );
  };

  return (
    <FeatureErrorBoundary>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/documents')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{metadata.title}</h1>
              <p className="text-muted-foreground text-sm">{fileName}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={!selectedDocument}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              {isOwner && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FileUp className="h-4 w-4 mr-2" />
                      New Version
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload New Version</DialogTitle>
                      <DialogDescription>
                        Upload a new version of this document. The current version will be preserved in the version history.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <input
                        type="file"
                        className="w-full"
                        onChange={handleFileChange}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setFileForUpload(null)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUploadNewVersion} 
                        disabled={!fileForUpload || uploadingVersion}
                      >
                        {uploadingVersion ? 'Uploading...' : 'Upload'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              {isOwner && (
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Document</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this document? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">Information</TabsTrigger>
                    <TabsTrigger value="versions">Versions</TabsTrigger>
                    <TabsTrigger value="activity">Activity Log</TabsTrigger>
                  </TabsList>
                
                  <TabsContent value="info" className="mt-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Description</h3>
                        <p className="text-muted-foreground text-sm">
                          {metadata.description || 'No description provided'}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {metadata.tags && metadata.tags.length > 0 ? (
                            metadata.tags.map(tag => (
                              <Badge variant="outline" key={tag}>{tag}</Badge>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm">No tags</p>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Custom Fields</h3>
                        {metadata.customFields && Object.keys(metadata.customFields).length > 0 ? (
                          <div className="space-y-2">
                            {Object.entries(metadata.customFields).map(([key, value]) => (
                              <div key={key} className="flex items-start">
                                <div className="font-medium text-sm w-1/3">{key}:</div>
                                <div className="text-sm">{value}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">No custom fields</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="versions" className="mt-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-1">Version History</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This document has {versions.length} version{versions.length !== 1 ? 's' : ''}
                      </p>
                      
                      {versionsLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {versions.length > 0 ? (
                            versions
                              .slice()
                              .sort((a, b) => b.versionNumber - a.versionNumber)
                              .map(version => getVersionInfo(version))
                          ) : (
                            <p className="text-muted-foreground">No versions available</p>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="activity" className="mt-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-1">Activity Log</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Recent activity for this document
                      </p>
                      <div className="space-y-2">
                        {loading ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                          </div>
                        ) : auditLog.length > 0 ? (
                          auditLog
                            .slice()
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map(entry => getAuditEntryInfo(entry))
                        ) : (
                          <p className="text-muted-foreground">No activity recorded</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">File Information</h3>
                  <div className="text-sm">
                    <div className="flex items-center mb-1">
                      <FileCog className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2">{fileType.split('/')[1] || fileType}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span className="ml-2">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="ml-2">{formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Size:</span>
                      <span className="ml-2">{formatFileSize(fileSize)}</span>
                    </div>
                    <div className="flex items-center">
                      <History className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Version:</span>
                      <span className="ml-2">{currentVersion}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Owner</h3>
                  <div className="flex items-center">
                    <div className="rounded-full bg-muted w-8 h-8 flex items-center justify-center mr-3">
                      <User className="h-4 w-4" />
                    </div>
                    <span>{ownerName}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium">Shared With</h3>
                    {isOwner && (
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Share2 className="h-3.5 w-3.5 mr-1" />
                        Share
                      </Button>
                    )}
                  </div>
                  
                  {sharedWith.length > 0 ? (
                    <div className="space-y-2">
                      {sharedWith.map(share => getShareInfo(share))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Not shared with anyone</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </FeatureErrorBoundary>
  );
}); 