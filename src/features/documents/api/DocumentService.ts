import { Document, DocumentMetadata, DocumentVersion, DocumentAuditEntry, DocumentShare, UserData } from '@/store/types';
import { generateMockDocuments } from '@/utils/mockDocuments';
import { ENV } from '@/config/env';
import apiClient from '@/api';

let createIdCounter = 0;
const getUniqueId = (prefix = '') => {
  createIdCounter++;
  return `${prefix}-${Date.now()}-${createIdCounter}-${Math.floor(Math.random() * 10000)}`;
};

export class DocumentService {
  // Local mock documents cache
  private static mockDocumentsCache: Document[] | null = null;
  
  // Store the current user info for document generation
  private currentUserId: string = 'unknown-user';
  private currentUserName: string = 'Unknown User';
  
  // Method to update user context
  setUserContext(userId: string, userName: string) {
    this.currentUserId = userId;
    this.currentUserName = userName;
    console.log(`DocumentService: User context updated to ${userId} (${userName})`);
  }

  async fetchDocuments(ownedByMe: boolean = true): Promise<Document[]> {
    if (ENV.FEATURES.mockAuth) {
      try {
        // Get the mock documents
        const documents = this.getMockDocuments();
        
        // If we have documents, return them
        if (documents.length > 0) {
          console.log(`Returning ${documents.length} existing mock documents`);
          return Promise.resolve(documents);
        }
        
        // If we don't have documents, force generation by calling getMockDocuments again with forceGenerate=true
        console.log("No mock documents found, forcing generation");
        const freshDocuments = this.getMockDocuments(true);
        console.log(`Generated ${freshDocuments.length} fresh mock documents`);
        return Promise.resolve(freshDocuments);
      } catch (error) {
        console.error("Error generating mock documents:", error);
        return Promise.resolve([]);
      }
    }
    
    try {
      const response = await apiClient.get<Document[]>('/api/documents', {
        params: { owned: ownedByMe }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }
  
  async getDocumentById(id: string): Promise<Document | null> {
    if (ENV.FEATURES.mockAuth) {
      // Make sure to get the latest mock documents
      const mockDocs = this.getMockDocuments();
      console.log(`Looking for document with ID: ${id} among ${mockDocs.length} documents`);
      
      const doc = mockDocs.find(doc => doc.id === id);
      
      if (!doc) {
        console.error(`Document with ID ${id} not found in mock documents`);
        return Promise.resolve(null);
      }
      
      console.log(`Found document: ${doc.fileName}`);
      return Promise.resolve(doc);
    }
    
    try {
      const response = await apiClient.get<Document>(`/api/documents/${id}`);
      return response.data;
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      console.error(`Error fetching document ${id}:`, error);
      throw error;
    }
  }
  
  async uploadDocument(file: File, metadata: DocumentMetadata): Promise<Document> {
    if (ENV.FEATURES.mockAuth) {
      // Mock implementation for document upload
      const mockDoc = this.createMockDocument(file, metadata);
      return Promise.resolve(mockDoc);
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));
      
      const response = await apiClient.post<Document>('/api/documents', formData);
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }
  
  async updateDocumentMetadata(id: string, metadata: DocumentMetadata): Promise<Document> {
    if (ENV.FEATURES.mockAuth) {
      // Mock implementation for updating metadata
      const mockDocs = this.getMockDocuments();
      const docIndex = mockDocs.findIndex(doc => doc.id === id);
      
      if (docIndex === -1) {
        throw new Error(`Document not found with id: ${id}`);
      }
      
      mockDocs[docIndex].metadata = metadata;
      mockDocs[docIndex].updatedAt = new Date().toISOString();
      
      return Promise.resolve(mockDocs[docIndex]);
    }
    
    try {
      const response = await apiClient.put<Document>(`/api/documents/${id}/metadata`, metadata);
      return response.data;
    } catch (error) {
      console.error(`Error updating metadata for document ${id}:`, error);
      throw error;
    }
  }
  
  async uploadNewVersion(id: string, file: File): Promise<Document> {
    if (ENV.FEATURES.mockAuth) {
      // Mock implementation for uploading a new version
      const mockDocs = this.getMockDocuments();
      const docIndex = mockDocs.findIndex(doc => doc.id === id);
      
      if (docIndex === -1) {
        throw new Error(`Document not found with id: ${id}`);
      }
      
      const doc = mockDocs[docIndex];
      const newVersionNumber = doc.currentVersion + 1;
      
      const newVersion: DocumentVersion = {
        id: `v${newVersionNumber}`,
        versionNumber: newVersionNumber,
        fileUrl: `/mock-files/${file.name}`,
        createdAt: new Date().toISOString(),
        createdBy: this.getCurrentUserId()
      };
      
      doc.versions.push(newVersion);
      doc.currentVersion = newVersionNumber;
      doc.updatedAt = new Date().toISOString();
      
      return Promise.resolve(doc);
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<Document>(`/api/documents/${id}/versions`, formData);
      return response.data;
    } catch (error) {
      console.error(`Error uploading new version for document ${id}:`, error);
      throw error;
    }
  }
  
  async shareDocument(id: string, userId: string, permission: 'view' | 'edit' | 'admin'): Promise<boolean> {
    if (ENV.FEATURES.mockAuth) {
      // Mock implementation for sharing a document
      const mockDocs = this.getMockDocuments();
      const docIndex = mockDocs.findIndex(doc => doc.id === id);
      
      if (docIndex === -1) {
        throw new Error(`Document not found with id: ${id}`);
      }
      
      const doc = mockDocs[docIndex];
      const existingShareIndex = doc.sharedWith.findIndex(share => share.userId === userId);
      
      if (existingShareIndex !== -1) {
        doc.sharedWith[existingShareIndex].permission = permission;
      } else {
        // Find user name from users if possible
        // For mock implementation, try to find a user name or use a default
        const userObj = this.getMockUsers().find(user => user.id === userId);
        const userName = userObj?.name || 'Unknown User';
        
        doc.sharedWith.push({
          id: getUniqueId(`share-${userId}`),
          userId,
          userName,
          permission,
          sharedAt: new Date().toISOString()
        });
      }
      
      return Promise.resolve(true);
    }
    
    try {
      await apiClient.post(`/api/documents/${id}/share`, { userId, permission });
      return true;
    } catch (error) {
      console.error(`Error sharing document ${id} with user ${userId}:`, error);
      return false;
    }
  }
  
  async deleteDocument(id: string): Promise<boolean> {
    if (ENV.FEATURES.mockAuth) {
      // Mock implementation for deleting a document
      const mockDocs = this.getMockDocuments();
      const docIndex = mockDocs.findIndex(doc => doc.id === id);
      
      if (docIndex === -1) {
        throw new Error(`Document not found with id: ${id}`);
      }
      
      mockDocs.splice(docIndex, 1);
      return Promise.resolve(true);
    }
    
    try {
      await apiClient.delete(`/api/documents/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      return false;
    }
  }
  
  async getDocumentVersions(id: string): Promise<DocumentVersion[]> {
    if (ENV.FEATURES.mockAuth) {
      const mockDocs = this.getMockDocuments();
      const doc = mockDocs.find(doc => doc.id === id);
      
      if (!doc) {
        throw new Error(`Document not found with id: ${id}`);
      }
      
      return Promise.resolve(doc.versions);
    }
    
    try {
      const response = await apiClient.get<DocumentVersion[]>(`/api/documents/${id}/versions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching versions for document ${id}:`, error);
      throw error;
    }
  }
  
  async getAuditLog(id: string): Promise<DocumentAuditEntry[]> {
    if (ENV.FEATURES.mockAuth) {
      const mockDocs = this.getMockDocuments();
      const doc = mockDocs.find(doc => doc.id === id);
      
      if (!doc) {
        throw new Error(`Document not found with id: ${id}`);
      }
      
      return Promise.resolve(doc.auditLog);
    }
    
    try {
      const response = await apiClient.get<DocumentAuditEntry[]>(`/api/documents/${id}/audit`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching audit log for document ${id}:`, error);
      throw error;
    }
  }

  // Private methods
  private getMockDocuments(forceGenerate: boolean = false, users?: UserData[]): Document[] {
    console.log("getMockDocuments called with forceGenerate:", forceGenerate);
    
    // If we have a cached version and don't need to force generate, use it
    if (DocumentService.mockDocumentsCache && DocumentService.mockDocumentsCache.length > 0 && !forceGenerate) {
      const cachedUsers = this.getMockUsers();
      console.log(`Using ${cachedUsers.length} users for document generation`);
      console.log(`Reusing ${DocumentService.mockDocumentsCache.length} cached mock documents`);
      return DocumentService.mockDocumentsCache;
    }
    
    // Generate new mock documents
    const mockUsers = users || this.getMockUsers();
    console.log(`Generating mock documents for ${mockUsers.length} users`);
    
    const currentUserId = this.currentUserId || (mockUsers.length > 0 ? mockUsers[0].id : '1');
    console.log(`Current user ID for document generation: ${currentUserId}`);
    
    // Generate documents
    const docs = generateMockDocuments(mockUsers, currentUserId);
    
    // Cache the documents
    DocumentService.mockDocumentsCache = docs;
    
    console.log(`Generated ${docs.length} new mock documents`);
    return docs;
  }
  
  private createMockDocument(file: File, metadata: DocumentMetadata): Document {
    const now = new Date().toISOString();
    
    return {
      id: getUniqueId(`doc-${this.currentUserId}`),
      ownerId: this.currentUserId,
      ownerName: this.currentUserName,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      metadata,
      currentVersion: 1,
      versions: [{
        id: getUniqueId('v1'),
        versionNumber: 1,
        fileUrl: `/mock-files/${file.name}`,
        createdAt: now,
        createdBy: this.currentUserId
      }],
      auditLog: [{
        id: getUniqueId('audit'),
        action: 'upload',
        userId: this.currentUserId,
        userName: this.currentUserName,
        timestamp: now,
        details: 'Initial upload'
      }],
      sharedWith: [],
      createdAt: now,
      updatedAt: now,
      isPublic: false
    };
  }
  
  private getMockUsers(): UserData[] {
    // This is a simple mock implementation that returns a default set of users
    // In a real app, you might fetch this from a user service or API
    return [
      {
        id: this.currentUserId,
        name: this.currentUserName,
        email: 'user@example.com',
        role: 'User',
        status: 'active',
        lastLogin: new Date().toISOString(),
        created: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'User',
        status: 'active',
        lastLogin: new Date().toISOString(),
        created: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'Admin',
        status: 'active',
        lastLogin: new Date().toISOString(),
        created: new Date().toISOString()
      }
    ];
  }
  
  // No more direct rootStore access
  private getCurrentUserId(): string {
    return this.currentUserId;
  }
  
  private getCurrentUserName(): string {
    return this.currentUserName;
  }
} 