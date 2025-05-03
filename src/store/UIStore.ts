import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';
import { useTheme } from 'next-themes';

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
  
  // Sidebar
  sidebarCollapsed: boolean = false;
  
  // Modal
  modalOpen: boolean = false;
  modalOptions: ModalOptions | null = null;
  
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, { rootStore: false });
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
