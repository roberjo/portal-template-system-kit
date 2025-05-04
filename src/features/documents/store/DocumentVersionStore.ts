import { makeObservable, observable, action, runInAction } from 'mobx';
import { Document, DocumentVersion } from '@/store/types';
import { DocumentService } from '../api/DocumentService';

export class DocumentVersionStore {
  versions: DocumentVersion[] = [];
  loading: boolean = false;
  error: string | null = null;
  
  constructor(private documentService: DocumentService) {
    makeObservable(this, {
      versions: observable,
      loading: observable,
      error: observable,
      getDocumentVersions: action,
      uploadNewVersion: action,
      clearVersions: action
    });
  }
  
  async getDocumentVersions(id: string): Promise<DocumentVersion[]> {
    this.loading = true;
    this.error = null;
    
    try {
      const versions = await this.documentService.getDocumentVersions(id);
      
      runInAction(() => {
        this.versions = versions;
        this.loading = false;
      });
      
      return versions;
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error fetching document versions';
      });
      
      throw error;
    }
  }
  
  async uploadNewVersion(id: string, file: File): Promise<Document> {
    this.loading = true;
    this.error = null;
    
    try {
      const updatedDocument = await this.documentService.uploadNewVersion(id, file);
      
      runInAction(() => {
        this.versions = updatedDocument.versions;
        this.loading = false;
      });
      
      return updatedDocument;
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error uploading new version';
      });
      
      throw error;
    }
  }
  
  clearVersions() {
    this.versions = [];
    this.loading = false;
    this.error = null;
  }
} 