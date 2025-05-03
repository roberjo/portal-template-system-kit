
import { makeAutoObservable } from 'mobx';
import { UIStore } from './UIStore';
import { UserStore } from './UserStore';
import { NotificationStore } from './NotificationStore';
import { DataStore } from './DataStore';

export class RootStore {
  uiStore: UIStore;
  userStore: UserStore;
  notificationStore: NotificationStore;
  dataStore: DataStore;

  constructor() {
    this.uiStore = new UIStore(this);
    this.userStore = new UserStore(this);
    this.notificationStore = new NotificationStore(this);
    this.dataStore = new DataStore(this);
    
    makeAutoObservable(this);
  }
}

// Create a single instance of the store to be used throughout the app
const rootStore = new RootStore();
export default rootStore;
