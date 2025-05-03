import { makeAutoObservable } from 'mobx';
import { IUIStore, ModalOptions } from './types';

export class UIStore implements IUIStore {
  // Sidebar
  sidebarCollapsed: boolean = false;
  
  // Modal
  modalOpen: boolean = false;
  modalOptions: ModalOptions | null = null;
  
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
}
