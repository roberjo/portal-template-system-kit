import { makeAutoObservable } from 'mobx';
import { IRootStore } from './types';
import { UIStore } from './UIStore';
import { UserStore } from './UserStore';
import { NotificationStore } from './NotificationStore';
import { DataStore } from './DataStore';
import { DocumentStore } from './DocumentStore';
import { ENV } from '../config/env';

export class RootStore implements IRootStore {
  uiStore: UIStore;
  userStore: UserStore;
  notificationStore: NotificationStore;
  dataStore: DataStore;
  documentStore: DocumentStore;

  constructor() {
    // Create stores first
    this.uiStore = new UIStore();
    this.userStore = new UserStore();
    this.notificationStore = new NotificationStore();
    this.dataStore = new DataStore();
    this.documentStore = new DocumentStore(this);
    
    makeAutoObservable(this);
    
    // Initialize mock data after all stores are created
    if (ENV.FEATURES.mockAuth) {
      console.log("Mock auth enabled, initializing mock data");
      // Delay document initialization to ensure user is set
      setTimeout(() => {
        this.documentStore.initializeMockData();
      }, 100);
    }
  }
}

// Create a single instance of the store to be used throughout the app
const rootStore = new RootStore();
export default rootStore;
