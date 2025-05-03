import { makeAutoObservable } from 'mobx';
import { IRootStore } from './types';
import { UIStore } from './UIStore';
import { UserStore } from './UserStore';
import { NotificationStore } from './NotificationStore';
import { DataStore } from './DataStore';

export class RootStore implements IRootStore {
  uiStore: UIStore;
  userStore: UserStore;
  notificationStore: NotificationStore;
  dataStore: DataStore;

  constructor() {
    this.uiStore = new UIStore();
    this.userStore = new UserStore();
    this.notificationStore = new NotificationStore();
    this.dataStore = new DataStore();
    
    makeAutoObservable(this);
  }
}

// Create a single instance of the store to be used throughout the app
const rootStore = new RootStore();
export default rootStore;
