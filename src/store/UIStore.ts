import { makeAutoObservable } from 'mobx';
import { IUIStore, Theme, ModalOptions } from './types';

export class UIStore implements IUIStore {
  // Sidebar
  sidebarCollapsed: boolean = false;
  
  // Modal
  modalOpen: boolean = false;
  modalOptions: ModalOptions | null = null;
  
  // Theme
  theme: Theme = 'light';
  
  constructor() {
    makeAutoObservable(this);
  }
  
  toggleSidebar = () => {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  openModal = (options: ModalOptions) => {
    this.modalOptions = options;
    this.modalOpen = true;
  }
  
  closeModal = () => {
    this.modalOpen = false;
    setTimeout(() => {
      this.modalOptions = null;
    }, 300); // After animation
  }
  
  // Add a public method to set the theme
  setTheme = (theme: Theme) => {
    this.theme = theme;
    this.applyTheme();
  }
  
  // The private method for internal use
  private applyTheme = () => {
    // Theme application logic
    if (this.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
