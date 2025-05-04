import { makeObservable, observable, action, runInAction } from 'mobx';
import { Document, DocumentMetadata } from '@/store/types';
import { DocumentService } from '../api/DocumentService';

export class DocumentMetadataStore {
  loading: boolean = false;
  error: string | null = null;
  
  constructor(private documentService: DocumentService) {
    makeObservable(this, {
      loading: observable,
      error: observable,
      updateDocumentMetadata: action
    });
  }
  
  async updateDocumentMetadata(id: string, metadata: DocumentMetadata): Promise<Document> {
    this.loading = true;
    this.error = null;
    
    try {
      const updatedDocument = await this.documentService.updateDocumentMetadata(id, metadata);
      
      runInAction(() => {
        this.loading = false;
      });
      
      return updatedDocument;
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error updating document metadata';
      });
      
      throw error;
    }
  }
} 