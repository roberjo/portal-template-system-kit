import { makeObservable, observable, action, computed, runInAction } from 'mobx';
import { Document, DocumentFilter, DocumentAuditEntry, DocumentMetadata } from '@/store/types';
import { DocumentService } from '../api/DocumentService';
import { DocumentMetadataStore } from './DocumentMetadataStore';
import { DocumentVersionStore } from './DocumentVersionStore';
import { ENV } from '@/config/env';
import { generateMockDocuments } from '@/utils/mockDocuments';

// Static cache across store instances
export let documentCache: Document[] = [];

export class DocumentStore {
  documents: Document[] = [];
  selectedDocument: Document | null = null;
  auditLog: DocumentAuditEntry[] = [];
  loading: boolean = false;
  error: string | null = null;
  filters: DocumentFilter = {
    sortBy: 'date',
    sortDirection: 'desc',
    ownedByMe: true
  };
  
  metadataStore: DocumentMetadataStore;
  versionStore: DocumentVersionStore;
  
  constructor(private documentService: DocumentService) {
    this.metadataStore = new DocumentMetadataStore(documentService);
    this.versionStore = new DocumentVersionStore(documentService);
    
    // Restore from static cache if available
    if (documentCache.length > 0) {
      console.log(`Restoring ${documentCache.length} documents from static cache`);
      this.documents = documentCache;
    }
    
    makeObservable(this, {
      documents: observable,
      selectedDocument: observable,
      auditLog: observable,
      loading: observable,
      error: observable,
      filters: observable,
      filteredDocuments: computed,
      searchResults: computed,
      documentCount: computed,
      hasSelectedDocument: computed,
      hasPendingRequests: computed,
      hasError: computed,
      setFilter: action,
      resetFilter: action,
      fetchDocuments: action,
      uploadDocument: action,
      deleteDocument: action,
      selectDocument: action,
      clearSelectedDocument: action,
      getAuditLog: action,
      shareDocument: action,
      initializeMockData: action,
      setDocuments: action
    });
    
    // Immediately initialize mock data in constructor
    if (ENV.FEATURES.mockAuth && documentCache.length === 0) {
      console.log("DocumentStore constructor - auto-initializing mock data");
      this.initializeMockData();
    }
  }
  
  // Add a dedicated action for setting documents
  setDocuments(docs: Document[]): void {
    this.documents = docs;
    // Update static cache for persistence
    documentCache = [...docs];
    console.log(`Set ${docs.length} documents in store and updated cache`);
  }
  
  // Add a special method for initializing mock data
  initializeMockData(): void {
    console.log("Initializing mock document data...");
    
    // Create default mock users if no real ones are available
    const defaultUsers = [
      {
        id: '1',
        name: 'Default User',
        email: 'default@example.com',
        role: 'Admin',
        status: 'active',
        lastLogin: new Date().toISOString(),
        created: new Date().toISOString()
      }
    ];
    
    // Generate documents directly
    const mockDocs = generateMockDocuments(defaultUsers, '1');
    
    if (mockDocs.length > 0) {
      console.log(`Generated ${mockDocs.length} mock documents successfully`);
      // Set documents and cache them
      this.setDocuments(mockDocs);
    } else {
      console.error("Failed to generate mock documents");
    }
  }
  
  get filteredDocuments(): Document[] {
    console.log("Computing filteredDocuments with", this.documents.length, "total documents");
    
    // If no documents, return empty array
    if (this.documents.length === 0) {
      console.log("No documents available");
      return [];
    }
    
    // Filter documents based on search criteria
    const filtered = this.searchResults;
    console.log("After search filters:", filtered.length, "documents");
    
    // Sort documents
    return filtered.slice().sort((a, b) => {
      const sortField = this.filters.sortBy === 'date' ? 'updatedAt' : 
                        this.filters.sortBy === 'name' ? 'fileName' :
                        this.filters.sortBy === 'size' ? 'fileSize' : 'updatedAt';
                        
      const sortDirection = this.filters.sortDirection === 'asc' ? 1 : -1;
      
      if (sortField === 'fileName') {
        return sortDirection * a.fileName.localeCompare(b.fileName);
      }
      
      if (sortField === 'fileSize') {
        return sortDirection * (a.fileSize - b.fileSize);
      }
      
      // Default sorting by date
      return sortDirection * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    });
  }
  
  get searchResults(): Document[] {
    // Apply search term filter
    let results = [...this.documents];
    console.log("Starting search with", results.length, "documents");
    
    if (this.filters.searchTerm) {
      const searchTerm = this.filters.searchTerm.toLowerCase();
      console.log(`Filtering by search term: "${searchTerm}"`);
      results = results.filter(doc => 
        doc.fileName.toLowerCase().includes(searchTerm) ||
        (doc.metadata?.title?.toLowerCase().includes(searchTerm) || false) ||
        (doc.metadata?.description?.toLowerCase().includes(searchTerm) || false) ||
        (doc.metadata?.tags && doc.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }
    
    // Apply ownership filter
    if (this.filters.ownedByMe === true) {
      console.log("Filtering by ownedByMe = true");
      // We need to make sure to return all documents that match the ownership filter
      return results;
    }
    
    if (this.filters.sharedWithMe === true) {
      console.log("Filtering by sharedWithMe = true");
      return results.filter(doc => doc.sharedWith && doc.sharedWith.length > 0);
    }
    
    // If no specific filters, return all documents
    console.log("No specific ownership filters applied, returning all documents");
    return results;
  }
  
  get documentCount(): number {
    return this.documents.length;
  }
  
  get hasSelectedDocument(): boolean {
    return this.selectedDocument !== null;
  }
  
  get hasPendingRequests(): boolean {
    return this.loading || this.metadataStore.loading || this.versionStore.loading;
  }
  
  get hasError(): boolean {
    return this.error !== null || this.metadataStore.error !== null || this.versionStore.error !== null;
  }
  
  async fetchDocuments(): Promise<Document[]> {
    this.loading = true;
    this.error = null;
    
    try {
      const documents = await this.documentService.fetchDocuments(this.filters.ownedByMe);
      
      runInAction(() => {
        this.documents = documents;
        this.loading = false;
      });
      
      return documents;
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error fetching documents';
      });
      
      throw error;
    }
  }
  
  async uploadDocument(file: File, metadata: DocumentMetadata): Promise<Document> {
    this.loading = true;
    this.error = null;
    
    try {
      const newDocument = await this.documentService.uploadDocument(file, metadata);
      
      runInAction(() => {
        this.documents.push(newDocument);
        this.loading = false;
      });
      
      return newDocument;
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error uploading document';
      });
      
      throw error;
    }
  }
  
  async selectDocument(id: string): Promise<Document | null> {
    this.loading = true;
    this.error = null;
    
    try {
      const document = await this.documentService.getDocumentById(id);
      
      runInAction(() => {
        this.selectedDocument = document;
        this.loading = false;
      });
      
      // Load versions and audit log for the selected document
      if (document) {
        this.versionStore.getDocumentVersions(id);
        this.getAuditLog(id);
      }
      
      return document;
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error selecting document';
      });
      
      return null;
    }
  }
  
  clearSelectedDocument() {
    this.selectedDocument = null;
    this.versionStore.clearVersions();
    this.auditLog = [];
  }
  
  async deleteDocument(id: string): Promise<boolean> {
    this.loading = true;
    this.error = null;
    
    try {
      const success = await this.documentService.deleteDocument(id);
      
      if (success) {
        runInAction(() => {
          this.documents = this.documents.filter(doc => doc.id !== id);
          
          // If the deleted document is currently selected, clear it
          if (this.selectedDocument && this.selectedDocument.id === id) {
            this.clearSelectedDocument();
          }
          
          this.loading = false;
        });
      }
      
      return success;
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error deleting document';
      });
      
      throw error;
    }
  }
  
  async getAuditLog(id: string): Promise<DocumentAuditEntry[]> {
    this.loading = true;
    this.error = null;
    
    try {
      const auditLog = await this.documentService.getAuditLog(id);
      
      runInAction(() => {
        this.auditLog = auditLog;
        this.loading = false;
      });
      
      return auditLog;
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error fetching audit log';
      });
      
      throw error;
    }
  }
  
  async shareDocument(id: string, userId: string, permission: 'view' | 'edit' | 'admin'): Promise<boolean> {
    this.loading = true;
    this.error = null;
    
    try {
      const success = await this.documentService.shareDocument(id, userId, permission);
      
      // Update the locally stored document if successful
      if (success && this.selectedDocument && this.selectedDocument.id === id) {
        // Re-fetch the document to get updated sharing info
        await this.selectDocument(id);
      }
      
      runInAction(() => {
        this.loading = false;
      });
      
      return success;
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error sharing document';
      });
      
      throw error;
    }
  }
  
  setFilter(filter: Partial<DocumentFilter>): void {
    this.filters = { ...this.filters, ...filter };
  }
  
  resetFilter(): void {
    this.filters = {
      sortBy: 'date',
      sortDirection: 'desc',
      ownedByMe: true
    };
  }
} 