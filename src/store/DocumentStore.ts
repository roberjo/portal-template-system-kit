import { makeAutoObservable, makeObservable, observable, action } from 'mobx';
import { 
  IDocumentStore, 
  Document, 
  DocumentMetadata, 
  DocumentVersion, 
  DocumentAuditEntry,
  DocumentFilter,
  DocumentShare,
  IRootStore
} from './types';
import { ENV } from '../config/env';
import { generateMockDocuments } from '../utils/mockDocuments';

export class DocumentStore implements IDocumentStore {
  documents: Document[] = [];
  selectedDocument: Document | null = null;
  loading: boolean = false;
  error: string | null = null;
  filters: DocumentFilter = {
    sortBy: 'date',
    sortDirection: 'desc',
    ownedByMe: true
  };
  
  private rootStore: IRootStore;

  constructor(rootStore: IRootStore) {
    this.rootStore = rootStore;
    makeObservable(this, {
      documents: observable,
      selectedDocument: observable,
      loading: observable,
      error: observable,
      filters: observable,
      setFilter: action,
      resetFilter: action,
      initializeMockData: action
      // rootStore is intentionally not observable
    });
    
    // We'll initialize mock data after the entire root store is initialized
  }
  
  // Method to initialize mock data called from RootStore after full initialization
  initializeMockData = () => {
    console.log("Initializing mock document data");
    console.log("Mock auth enabled:", ENV.FEATURES.mockAuth);
    
    if (ENV.FEATURES.mockAuth) {
      this.initMockData();
    }
  }

  private initMockData = () => {
    const currentUser = this.rootStore.userStore.currentUser;
    console.log("Current user in initMockData:", currentUser);
    
    if (!currentUser) {
      console.warn("No current user found, mock documents will not be initialized");
      return;
    }

    // Generate mock documents using the utility function
    const users = this.rootStore.dataStore.users;
    console.log("Users found for document generation:", users.length);
    
    if (users.length > 0) {
      const mockDocs = generateMockDocuments(users, currentUser.id);
      console.log(`Generated ${mockDocs.length} mock documents`);
      this.documents = mockDocs;
    } else {
      console.log("No users found, creating default documents for current user");
      // Fallback to basic mock documents if users list is empty
      const now = new Date().toISOString();
      const yesterday = new Date(Date.now() - 86400000).toISOString();

      // Create sample documents for the current user
      this.documents = [
        {
          id: '1',
          ownerId: currentUser.id,
          ownerName: currentUser.name,
          fileName: 'project-proposal.pdf',
          fileSize: 1024 * 1024 * 2.5, // 2.5MB
          fileType: 'application/pdf',
          metadata: {
            title: 'Project Proposal - Q2 2023',
            description: 'Quarterly project proposal for the marketing department',
            tags: ['proposal', 'marketing', 'q2'],
            category: 'Marketing',
            customFields: {
              'department': 'Marketing',
              'status': 'Draft'
            }
          },
          currentVersion: 2,
          versions: [
            {
              id: 'v1',
              versionNumber: 1,
              fileUrl: '/mock-files/project-proposal-v1.pdf',
              createdAt: yesterday,
              createdBy: currentUser.id
            },
            {
              id: 'v2',
              versionNumber: 2,
              fileUrl: '/mock-files/project-proposal-v2.pdf',
              createdAt: now,
              createdBy: currentUser.id
            }
          ],
          auditLog: [
            {
              id: 'a1',
              action: 'upload',
              userId: currentUser.id,
              userName: currentUser.name,
              timestamp: yesterday,
              details: 'Initial upload'
            },
            {
              id: 'a2',
              action: 'edit',
              userId: currentUser.id,
              userName: currentUser.name,
              timestamp: yesterday,
              details: 'Updated document title and description'
            },
            {
              id: 'a3',
              action: 'upload',
              userId: currentUser.id,
              userName: currentUser.name,
              timestamp: now,
              details: 'Uploaded new version'
            }
          ],
          sharedWith: [],
          createdAt: yesterday,
          updatedAt: now,
          isPublic: false
        },
        {
          id: '2',
          ownerId: currentUser.id,
          ownerName: currentUser.name,
          fileName: 'monthly-report.xlsx',
          fileSize: 1024 * 512, // 512KB
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          metadata: {
            title: 'Monthly Sales Report - June 2023',
            description: 'Monthly sales figures and analysis',
            tags: ['report', 'sales', 'monthly'],
            category: 'Finance',
            customFields: {
              'department': 'Sales',
              'period': 'June 2023'
            }
          },
          currentVersion: 1,
          versions: [
            {
              id: 'v1',
              versionNumber: 1,
              fileUrl: '/mock-files/monthly-report.xlsx',
              createdAt: now,
              createdBy: currentUser.id
            }
          ],
          auditLog: [
            {
              id: 'a1',
              action: 'upload',
              userId: currentUser.id,
              userName: currentUser.name,
              timestamp: now,
              details: 'Initial upload'
            }
          ],
          sharedWith: [],
          createdAt: now,
          updatedAt: now,
          isPublic: false
        }
      ];
    }
  }

  fetchDocuments = async (filter?: DocumentFilter): Promise<Document[]> => {
    this.loading = true;
    this.error = null;
    
    try {
      if (filter) {
        this.filters = { ...this.filters, ...filter };
      }
      
      if (ENV.FEATURES.mockAuth) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Apply filters to mock data
        let filteredDocs = [...this.documents];
        const currentUser = this.rootStore.userStore.currentUser;
        
        if (this.filters.ownedByMe && currentUser) {
          filteredDocs = filteredDocs.filter(doc => doc.ownerId === currentUser.id);
        }
        
        if (this.filters.sharedWithMe && currentUser) {
          filteredDocs = filteredDocs.filter(doc => 
            doc.sharedWith.some(share => share.userId === currentUser.id) ||
            doc.isPublic
          );
        }
        
        if (this.filters.searchTerm) {
          const term = this.filters.searchTerm.toLowerCase();
          filteredDocs = filteredDocs.filter(doc => 
            doc.fileName.toLowerCase().includes(term) ||
            doc.metadata.title.toLowerCase().includes(term) ||
            doc.metadata.description.toLowerCase().includes(term) ||
            doc.metadata.tags.some(tag => tag.toLowerCase().includes(term))
          );
        }
        
        if (this.filters.category) {
          filteredDocs = filteredDocs.filter(doc => 
            doc.metadata.category === this.filters.category
          );
        }
        
        if (this.filters.tags && this.filters.tags.length > 0) {
          filteredDocs = filteredDocs.filter(doc => 
            this.filters.tags!.some(tag => doc.metadata.tags.includes(tag))
          );
        }
        
        // Sort documents
        if (this.filters.sortBy) {
          filteredDocs.sort((a, b) => {
            let comparison = 0;
            switch (this.filters.sortBy) {
              case 'name':
                comparison = a.fileName.localeCompare(b.fileName);
                break;
              case 'date':
                comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                break;
              case 'size':
                comparison = a.fileSize - b.fileSize;
                break;
            }
            
            // Apply sort direction
            return this.filters.sortDirection === 'desc' ? -comparison : comparison;
          });
        }
        
        return filteredDocs;
      } else {
        // Real API call would go here
        const queryParams = new URLSearchParams();
        
        if (this.filters.searchTerm) {
          queryParams.append('search', this.filters.searchTerm);
        }
        
        if (this.filters.category) {
          queryParams.append('category', this.filters.category);
        }
        
        if (this.filters.ownedByMe) {
          queryParams.append('ownedByMe', 'true');
        }
        
        if (this.filters.sharedWithMe) {
          queryParams.append('sharedWithMe', 'true');
        }
        
        if (this.filters.sortBy) {
          queryParams.append('sortBy', this.filters.sortBy);
          queryParams.append('sortDirection', this.filters.sortDirection || 'asc');
        }
        
        if (this.filters.tags && this.filters.tags.length > 0) {
          this.filters.tags.forEach(tag => {
            queryParams.append('tags', tag);
          });
        }
        
        const response = await fetch(`${ENV.API_URL}/documents?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(ENV.AUTH_CONFIG.tokenStorageKey)}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        
        const data = await response.json();
        this.documents = data;
        return data;
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An unknown error occurred';
      return [];
    } finally {
      this.loading = false;
    }
  }

  uploadDocument = async (file: File, metadata: DocumentMetadata): Promise<Document> => {
    this.loading = true;
    this.error = null;
    
    try {
      if (ENV.FEATURES.mockAuth) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const currentUser = this.rootStore.userStore.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        const now = new Date().toISOString();
        const newDocument: Document = {
          id: Date.now().toString(),
          ownerId: currentUser.id,
          ownerName: currentUser.name,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          metadata,
          currentVersion: 1,
          versions: [
            {
              id: `v1-${Date.now()}`,
              versionNumber: 1,
              fileUrl: `/mock-files/${file.name}`,
              createdAt: now,
              createdBy: currentUser.id
            }
          ],
          auditLog: [
            {
              id: `a1-${Date.now()}`,
              action: 'upload',
              userId: currentUser.id,
              userName: currentUser.name,
              timestamp: now,
              details: 'Initial upload'
            }
          ],
          sharedWith: [],
          createdAt: now,
          updatedAt: now,
          isPublic: false
        };
        
        this.documents = [...this.documents, newDocument];
        
        // Success notification
        this.rootStore.notificationStore.addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Document Uploaded',
          message: `Successfully uploaded ${file.name}`,
          duration: 5000
        });
        
        return newDocument;
      } else {
        // Real API upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('metadata', JSON.stringify(metadata));
        
        const response = await fetch(`${ENV.API_URL}/documents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(ENV.AUTH_CONFIG.tokenStorageKey)}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload document');
        }
        
        const newDocument = await response.json();
        this.documents = [...this.documents, newDocument];
        
        // Success notification
        this.rootStore.notificationStore.addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Document Uploaded',
          message: `Successfully uploaded ${file.name}`,
          duration: 5000
        });
        
        return newDocument;
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Error notification
      this.rootStore.notificationStore.addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Upload Failed',
        message: this.error,
        duration: 5000
      });
      
      throw error;
    } finally {
      this.loading = false;
    }
  }

  updateDocumentMetadata = async (id: string, metadata: DocumentMetadata): Promise<Document> => {
    this.loading = true;
    this.error = null;
    
    try {
      if (ENV.FEATURES.mockAuth) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const currentUser = this.rootStore.userStore.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        const docIndex = this.documents.findIndex(doc => doc.id === id);
        if (docIndex === -1) {
          throw new Error('Document not found');
        }
        
        // Check permissions
        const doc = this.documents[docIndex];
        if (doc.ownerId !== currentUser.id && 
            !doc.sharedWith.some(share => 
              share.userId === currentUser.id && 
              (share.permission === 'edit' || share.permission === 'admin')
            )) {
          throw new Error('You don\'t have permission to edit this document');
        }
        
        const now = new Date().toISOString();
        const updatedDoc = {
          ...doc,
          metadata,
          updatedAt: now,
          auditLog: [
            ...doc.auditLog,
            {
              id: `a${doc.auditLog.length + 1}-${Date.now()}`,
              action: 'edit',
              userId: currentUser.id,
              userName: currentUser.name,
              timestamp: now,
              details: 'Updated document metadata'
            }
          ]
        };
        
        this.documents = [
          ...this.documents.slice(0, docIndex),
          updatedDoc as Document,
          ...this.documents.slice(docIndex + 1)
        ];
        
        if (this.selectedDocument?.id === id) {
          this.selectedDocument = updatedDoc as Document;
        }
        
        return updatedDoc as Document;
      } else {
        // Real API call
        const response = await fetch(`${ENV.API_URL}/documents/${id}/metadata`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(ENV.AUTH_CONFIG.tokenStorageKey)}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(metadata)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update document metadata');
        }
        
        const updatedDoc = await response.json();
        
        // Update local state
        const docIndex = this.documents.findIndex(doc => doc.id === id);
        if (docIndex !== -1) {
          this.documents = [
            ...this.documents.slice(0, docIndex),
            updatedDoc,
            ...this.documents.slice(docIndex + 1)
          ];
        }
        
        if (this.selectedDocument?.id === id) {
          this.selectedDocument = updatedDoc;
        }
        
        return updatedDoc;
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An unknown error occurred';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  uploadNewVersion = async (id: string, file: File): Promise<Document> => {
    this.loading = true;
    this.error = null;
    
    try {
      if (ENV.FEATURES.mockAuth) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const currentUser = this.rootStore.userStore.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        const docIndex = this.documents.findIndex(doc => doc.id === id);
        if (docIndex === -1) {
          throw new Error('Document not found');
        }
        
        // Check permissions
        const doc = this.documents[docIndex];
        if (doc.ownerId !== currentUser.id && 
            !doc.sharedWith.some(share => 
              share.userId === currentUser.id && 
              (share.permission === 'edit' || share.permission === 'admin')
            )) {
          throw new Error('You don\'t have permission to update this document');
        }
        
        const now = new Date().toISOString();
        const newVersionNumber = doc.currentVersion + 1;
        
        const updatedDoc = {
          ...doc,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          currentVersion: newVersionNumber,
          versions: [
            ...doc.versions,
            {
              id: `v${newVersionNumber}-${Date.now()}`,
              versionNumber: newVersionNumber,
              fileUrl: `/mock-files/${file.name}`,
              createdAt: now,
              createdBy: currentUser.id
            }
          ],
          auditLog: [
            ...doc.auditLog,
            {
              id: `a${doc.auditLog.length + 1}-${Date.now()}`,
              action: 'upload',
              userId: currentUser.id,
              userName: currentUser.name,
              timestamp: now,
              details: `Uploaded new version (v${newVersionNumber})`
            }
          ],
          updatedAt: now
        };
        
        this.documents = [
          ...this.documents.slice(0, docIndex),
          updatedDoc as Document,
          ...this.documents.slice(docIndex + 1)
        ];
        
        if (this.selectedDocument?.id === id) {
          this.selectedDocument = updatedDoc as Document;
        }
        
        // Notification
        this.rootStore.notificationStore.addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'New Version Uploaded',
          message: `Version ${newVersionNumber} of ${file.name} has been uploaded`,
          duration: 5000
        });
        
        return updatedDoc as Document;
      } else {
        // Real API call
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${ENV.API_URL}/documents/${id}/versions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(ENV.AUTH_CONFIG.tokenStorageKey)}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload new version');
        }
        
        const updatedDoc = await response.json();
        
        // Update local state
        const docIndex = this.documents.findIndex(doc => doc.id === id);
        if (docIndex !== -1) {
          this.documents = [
            ...this.documents.slice(0, docIndex),
            updatedDoc,
            ...this.documents.slice(docIndex + 1)
          ];
        }
        
        if (this.selectedDocument?.id === id) {
          this.selectedDocument = updatedDoc;
        }
        
        return updatedDoc;
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Error notification
      this.rootStore.notificationStore.addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Upload Failed',
        message: this.error,
        duration: 5000
      });
      
      throw error;
    } finally {
      this.loading = false;
    }
  }

  shareDocument = async (id: string, userId: string, permission: 'view' | 'edit' | 'admin'): Promise<boolean> => {
    this.loading = true;
    this.error = null;
    
    try {
      if (ENV.FEATURES.mockAuth) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const currentUser = this.rootStore.userStore.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        const docIndex = this.documents.findIndex(doc => doc.id === id);
        if (docIndex === -1) {
          throw new Error('Document not found');
        }
        
        // Check ownership
        const doc = this.documents[docIndex];
        if (doc.ownerId !== currentUser.id) {
          throw new Error('You don\'t have permission to share this document');
        }
        
        // Get user info from the user store (for mock, use the first user in the dataStore)
        let userName = 'Unknown User';
        const dataStore = this.rootStore.dataStore;
        if (dataStore && dataStore.users) {
          const user = dataStore.users.find(u => u.id === userId);
          if (user) {
            userName = user.name;
          }
        }
        
        const now = new Date().toISOString();
        
        // Check if already shared with this user
        const shareIndex = doc.sharedWith.findIndex(share => share.userId === userId);
        
        let updatedShares;
        if (shareIndex !== -1) {
          // Update existing share
          updatedShares = [
            ...doc.sharedWith.slice(0, shareIndex),
            {
              ...doc.sharedWith[shareIndex],
              permission
            },
            ...doc.sharedWith.slice(shareIndex + 1)
          ];
        } else {
          // Add new share
          updatedShares = [
            ...doc.sharedWith,
            {
              id: `share-${Date.now()}`,
              userId,
              userName,
              permission,
              sharedAt: now
            }
          ];
        }
        
        const updatedDoc = {
          ...doc,
          sharedWith: updatedShares,
          auditLog: [
            ...doc.auditLog,
            {
              id: `a${doc.auditLog.length + 1}-${Date.now()}`,
              action: 'share',
              userId: currentUser.id,
              userName: currentUser.name,
              timestamp: now,
              details: `Shared with ${userName} (${permission} permission)`
            }
          ],
          updatedAt: now
        };
        
        this.documents = [
          ...this.documents.slice(0, docIndex),
          updatedDoc as Document,
          ...this.documents.slice(docIndex + 1)
        ];
        
        if (this.selectedDocument?.id === id) {
          this.selectedDocument = updatedDoc as Document;
        }
        
        // Notification
        this.rootStore.notificationStore.addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Document Shared',
          message: `Document shared with ${userName}`,
          duration: 5000
        });
        
        return true;
      } else {
        // Real API call
        const response = await fetch(`${ENV.API_URL}/documents/${id}/share`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(ENV.AUTH_CONFIG.tokenStorageKey)}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            permission
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to share document');
        }
        
        const updatedDoc = await response.json();
        
        // Update local state
        const docIndex = this.documents.findIndex(doc => doc.id === id);
        if (docIndex !== -1) {
          this.documents = [
            ...this.documents.slice(0, docIndex),
            updatedDoc,
            ...this.documents.slice(docIndex + 1)
          ];
        }
        
        if (this.selectedDocument?.id === id) {
          this.selectedDocument = updatedDoc;
        }
        
        return true;
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An unknown error occurred';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  deleteDocument = async (id: string): Promise<boolean> => {
    this.loading = true;
    this.error = null;
    
    try {
      if (ENV.FEATURES.mockAuth) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const currentUser = this.rootStore.userStore.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        const docIndex = this.documents.findIndex(doc => doc.id === id);
        if (docIndex === -1) {
          throw new Error('Document not found');
        }
        
        // Check ownership
        const doc = this.documents[docIndex];
        if (doc.ownerId !== currentUser.id) {
          throw new Error('You don\'t have permission to delete this document');
        }
        
        // Remove document
        this.documents = [
          ...this.documents.slice(0, docIndex),
          ...this.documents.slice(docIndex + 1)
        ];
        
        if (this.selectedDocument?.id === id) {
          this.selectedDocument = null;
        }
        
        return true;
      } else {
        // Real API call
        const response = await fetch(`${ENV.API_URL}/documents/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(ENV.AUTH_CONFIG.tokenStorageKey)}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete document');
        }
        
        // Update local state
        const docIndex = this.documents.findIndex(doc => doc.id === id);
        if (docIndex !== -1) {
          this.documents = [
            ...this.documents.slice(0, docIndex),
            ...this.documents.slice(docIndex + 1)
          ];
        }
        
        if (this.selectedDocument?.id === id) {
          this.selectedDocument = null;
        }
        
        return true;
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An unknown error occurred';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  getDocumentById = async (id: string): Promise<Document | null> => {
    this.loading = true;
    this.error = null;
    
    try {
      if (ENV.FEATURES.mockAuth) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const document = this.documents.find(doc => doc.id === id);
        if (!document) {
          throw new Error('Document not found');
        }
        
        // Check permissions
        const currentUser = this.rootStore.userStore.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        if (document.ownerId !== currentUser.id && 
            !document.isPublic && 
            !document.sharedWith.some(share => share.userId === currentUser.id)) {
          throw new Error('You don\'t have permission to view this document');
        }
        
        this.selectedDocument = document;
        return document;
      } else {
        // Real API call
        const response = await fetch(`${ENV.API_URL}/documents/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(ENV.AUTH_CONFIG.tokenStorageKey)}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        
        const document = await response.json();
        this.selectedDocument = document;
        return document;
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An unknown error occurred';
      return null;
    } finally {
      this.loading = false;
    }
  }

  getDocumentVersions = async (id: string): Promise<DocumentVersion[]> => {
    // For mock mode, we can just return the versions from the document
    if (ENV.FEATURES.mockAuth) {
      const document = this.documents.find(doc => doc.id === id);
      if (!document) {
        return [];
      }
      return document.versions;
    } else {
      // Real API call
      try {
        const response = await fetch(`${ENV.API_URL}/documents/${id}/versions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(ENV.AUTH_CONFIG.tokenStorageKey)}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch document versions');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching document versions:', error);
        return [];
      }
    }
  }

  getAuditLog = async (id: string): Promise<DocumentAuditEntry[]> => {
    // For mock mode, we can just return the audit log from the document
    if (ENV.FEATURES.mockAuth) {
      const document = this.documents.find(doc => doc.id === id);
      if (!document) {
        return [];
      }
      return document.auditLog;
    } else {
      // Real API call
      try {
        const response = await fetch(`${ENV.API_URL}/documents/${id}/audit`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(ENV.AUTH_CONFIG.tokenStorageKey)}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch document audit log');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching document audit log:', error);
        return [];
      }
    }
  }

  setFilter = (filter: Partial<DocumentFilter>): void => {
    this.filters = { ...this.filters, ...filter };
  }

  resetFilter = (): void => {
    this.filters = {
      sortBy: 'date',
      sortDirection: 'desc',
      ownedByMe: true
    };
  }
} 