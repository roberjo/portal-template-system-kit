
import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';

export interface ModalOptions {
  title: string;
  content: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export class UIStore {
  rootStore: RootStore;
  
  // Theme
  theme: 'light' | 'dark' = 'light';
  
  // Sidebar
  sidebarCollapsed: boolean = false;
  
  // Modal
  modalOpen: boolean = false;
  modalOptions: ModalOptions | null = null;
  
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    
    // Initialize theme from localStorage if available
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.theme = savedTheme;
      this.applyTheme(savedTheme);
    } else {
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.theme = 'dark';
        this.applyTheme('dark');
      }
    }
    
    makeAutoObservable(this, { rootStore: false });
  }
  
  toggleTheme = () => {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    this.applyTheme(newTheme);
  }
  
  private applyTheme = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
}
