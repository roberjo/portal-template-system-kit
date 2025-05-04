import { makeAutoObservable } from 'mobx';
import { IRootStore } from './types';
import { UIStore } from './UIStore';
import { UserStore } from './UserStore';
import { NotificationStore } from './NotificationStore';
import { DataStore } from './DataStore';
import { DocumentStore } from '@/features/documents/store';
import { DocumentService } from '@/features/documents/api/DocumentService';
import { ENV } from '../config/env';
import { generateMockDocuments } from '@/utils/mockDocuments';

export class RootStore implements IRootStore {
  uiStore: UIStore;
  userStore: UserStore;
  notificationStore: NotificationStore;
  dataStore: DataStore;
  documentStore: DocumentStore;
  documentService: DocumentService;

  constructor() {
    console.log("RootStore constructor - initializing stores");
    
    // Create services first
    this.documentService = new DocumentService();
    
    // Create core stores first that others may depend on 
    this.dataStore = new DataStore();
    console.log("DataStore initialized");
    
    // Then create the other stores
    this.uiStore = new UIStore();
    this.notificationStore = new NotificationStore();
    
    // Create user store after data store
    this.userStore = new UserStore();
    console.log("UserStore initialized");
    
    // Set up mock user information for the document service
    // This breaks the circular dependency
    if (ENV.FEATURES.mockAuth) {
      // Default mock user
      this.documentService.setUserContext('1', 'John Doe');
    }
    
    // Create document store last
    this.documentStore = new DocumentStore(this.documentService);
    console.log("DocumentStore initialized");
    
    makeAutoObservable(this, {
      documentService: false // Do not make the service observable
    });
    
    // Setup user context updates when the user changes
    this.setupUserContextSync();
    
    // Initialize data after all stores are created
    if (ENV.FEATURES.mockAuth) {
      console.log("Mock auth enabled, initializing mock documents directly");
      
      // Force generate some documents right away
      setTimeout(() => {
        // This timeout allows all stores to fully initialize
        this.forceGenerateMockDocuments();
      }, 500);
    }

    // Setup Zustand devtools
    if (process.env.NODE_ENV === 'development') {
      try {
        import('mobx-logger').then(mobxLogger => {
          mobxLogger.enableLogging({
            predicate: () => true,
            action: true,
            reaction: true,
            transaction: true,
            compute: true
          });
          console.log('MobX logging enabled in development mode');
        }).catch(err => {
          console.warn('Failed to load mobx-logger:', err);
        });
      } catch (error) {
        console.warn('Error setting up mobx-logger:', error);
      }
    }
  }

  // Setup synchronization between UserStore and DocumentService
  private setupUserContextSync() {
    // Update document service when user changes
    const updateUserContext = () => {
      const user = this.userStore.currentUser;
      if (user) {
        this.documentService.setUserContext(user.id, user.name);
      }
    };
    
    // Initial update
    updateUserContext();
    
    // Setup interval to periodically check for user changes
    if (typeof window !== 'undefined') {
      setInterval(updateUserContext, 5000);
    }
  }
  
  // Public method to force document generation that can be called from anywhere
  forceGenerateMockDocuments() {
    console.log("Force generating mock documents from RootStore");
    
    try {
      // Default mock user ID if not logged in yet
      const currentUserId = this.userStore.currentUser?.id || '1';
      
      // Generate documents directly
      const mockDocs = generateMockDocuments(this.dataStore.users, currentUserId);
      console.log(`Generated ${mockDocs.length} mock documents directly in RootStore`);
      
      // Use the DocumentStore's action method instead of direct assignment
      this.documentStore.setDocuments(mockDocs);
    } catch (error) {
      console.error("Error generating mock documents:", error);
    }
  }
}

// Create a single instance of the store to be used throughout the app
const rootStore = new RootStore();

// Add global access for debugging
if (typeof window !== 'undefined') {
  // @ts-ignore - Add to window for debugging
  window.__PORTAL_ROOT_STORE = rootStore;
  console.log("Added rootStore to window.__PORTAL_ROOT_STORE for debugging");
}

export default rootStore;
