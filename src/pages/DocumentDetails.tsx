import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
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
  ExternalLink,
  Clock,
  User,
  ChevronRight,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '../components/ui/dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { formatFileSize } from '../utils/formatters';
import { DocumentVersion, DocumentAuditEntry, DocumentShare } from '../store/types';

const DocumentDetails = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { documentStore, userStore } = useStore();
  const { loading, error, selectedDocument, getDocumentById, uploadNewVersion, deleteDocument } = documentStore;
  const [activeTab, setActiveTab] = useState('info');
  const [uploadingVersion, setUploadingVersion] = useState(false);
  const [fileForUpload, setFileForUpload] = useState<File | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      getDocumentById(id);
    }
  }, [id]);

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
    versions, 
    auditLog, 
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
    if (!fileForUpload) return;
    
    setUploadingVersion(true);
    try {
      await uploadNewVersion(id!, fileForUpload);
      setFileForUpload(null);
    } catch (error) {
      console.error('Failed to upload new version:', error);
    } finally {
      setUploadingVersion(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const success = await deleteDocument(id!);
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
      <div className="border rounded-md p-4 mb-4">
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
          return <Badge variant="secondary">View</Badge>;
        case 'edit':
          return <Badge variant="default">Edit</Badge>;
        case 'admin':
          return <Badge variant="destructive">Admin</Badge>;
        default:
          return <Badge variant="outline">{share.permission}</Badge>;
      }
    };

    return (
      <div className="flex items-center justify-between py-2 border-b" key={share.id}>
        <div className="flex items-center">
          <div className="bg-muted rounded-full p-1 mr-3">
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{share.userName}</div>
            <div className="text-xs text-muted-foreground">
              Shared {formatDistanceToNow(new Date(share.sharedAt), { addSuffix: true })}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {getPermissionBadge()}
          <Button variant="ghost" size="icon" className="ml-2">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/documents')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{metadata.title}</h1>
            <p className="text-muted-foreground">
              {fileName} • {formatFileSize(fileSize)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          
          {isOwner && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Document</DialogTitle>
                    <DialogDescription>
                      Share this document with other users
                    </DialogDescription>
                  </DialogHeader>
                  {/* Share UI would go here */}
                  <div className="py-4">
                    <p className="text-center text-muted-foreground">
                      Sharing functionality will be implemented here
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <FileUp className="mr-2 h-4 w-4" />
                    New Version
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Version</DialogTitle>
                    <DialogDescription>
                      Upload a new version of this document
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="mb-4">
                      <p className="text-sm mb-2">Current version: <strong>v{currentVersion}</strong></p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Uploading a new version will replace the current file but preserve the document history.
                      </p>
                      
                      <input
                        type="file"
                        className="w-full"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setFileForUpload(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUploadNewVersion}
                      disabled={!fileForUpload || uploadingVersion}
                    >
                      {uploadingVersion ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FileUp className="mr-2 h-4 w-4" />
                          Upload Version
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
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
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDeleteDialog(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
          <TabsTrigger value="history">History ({auditLog.length})</TabsTrigger>
          {isOwner && (
            <TabsTrigger value="sharing">Sharing ({sharedWith.length})</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Details</h3>
                  <div className="bg-muted p-4 rounded-md space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">File name:</span>
                      <span className="text-sm font-medium">{fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">File size:</span>
                      <span className="text-sm font-medium">{formatFileSize(fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">File type:</span>
                      <span className="text-sm font-medium">{fileType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current version:</span>
                      <span className="text-sm font-medium">v{currentVersion}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Timeline</h3>
                  <div className="bg-muted p-4 rounded-md space-y-3">
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Created</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(createdAt), 'PPP')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Last updated</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <User className="h-4 w-4 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Owner</div>
                        <div className="text-xs text-muted-foreground">{ownerName}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {metadata.description || 'No description provided'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-sm font-medium mb-2">Category</h3>
                  <Badge variant="outline">{metadata.category || 'Uncategorized'}</Badge>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium mb-2">Tags</h3>
                  {metadata.tags && metadata.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {metadata.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>
                View and download previous versions of this document
              </CardDescription>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No versions available
                </div>
              ) : (
                <div className="space-y-1">
                  {[...versions].reverse().map((version) => getVersionInfo(version))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Audit History</CardTitle>
              <CardDescription>
                Track all changes and actions performed on this document
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLog.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No history available
                </div>
              ) : (
                <div className="space-y-1">
                  {[...auditLog].reverse().map((entry) => getAuditEntryInfo(entry))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {isOwner && (
          <TabsContent value="sharing">
            <Card>
              <CardHeader>
                <CardTitle>Shared With</CardTitle>
                <CardDescription>
                  Manage user access to this document
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sharedWith.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="font-medium text-lg mb-1">Not shared yet</h3>
                    <p className="mb-4">
                      This document is private. Share it with others to collaborate.
                    </p>
                    <Button>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sharedWith.map((share) => getShareInfo(share))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
});

export default DocumentDetails;