// Define interfaces for all stores
import { ReactNode } from 'react';
import { DocumentService } from '@/features/documents/api/DocumentService';
import { DocumentStore } from '@/features/documents/store';
import { RootStore } from './RootStore';

// UI Store types
export type Theme = 'light' | 'dark';

export interface ModalOptions {
  title: string;
  content: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
}

export interface IUIStore {
  sidebarCollapsed: boolean;
  modalOpen: boolean;
  modalOptions: ModalOptions | null;
  theme: Theme;
  toggleSidebar: () => void;
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
  setTheme: (theme: Theme) => void;
}

// User Store types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'manager';
  permissions: string[];
  preferences: {
    theme?: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export interface UserPreferencesUpdate {
  theme?: 'light' | 'dark';
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface IUserStore {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  impersonating: boolean;
  originalUser: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  updatePreferences: (preferences: UserPreferencesUpdate) => void;
  startImpersonation: (userId: string) => Promise<void>;
  stopImpersonation: () => void;
  resetInactivityTimer: () => void;
  startInactivityTimer: () => void;
  stopInactivityTimer: () => void;
}

// Document Store types
export interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileUrl: string;
  createdAt: string;
  createdBy: string;
}

export interface DocumentAuditEntry {
  id: string;
  action: 'upload' | 'edit' | 'share' | 'delete' | 'download';
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
}

export interface DocumentMetadata {
  title: string;
  description: string;
  tags: string[];
  category?: string;
  customFields: Record<string, string>;
}

export interface DocumentShare {
  id: string;
  userId: string;
  userName: string;
  permission: 'view' | 'edit' | 'admin';
  sharedAt: string;
}

export interface Document {
  id: string;
  ownerId: string;
  ownerName: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  metadata: DocumentMetadata;
  currentVersion: number;
  versions: DocumentVersion[];
  auditLog: DocumentAuditEntry[];
  sharedWith: DocumentShare[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export interface DocumentFilter {
  searchTerm?: string;
  category?: string;
  tags?: string[];
  sharedWithMe?: boolean;
  ownedByMe?: boolean;
  sortBy?: 'name' | 'date' | 'size';
  sortDirection?: 'asc' | 'desc';
}

export interface IDocumentStore {
  documents: Document[];
  selectedDocument: Document | null;
  loading: boolean;
  error: string | null;
  filters: DocumentFilter;
  fetchDocuments: (filter?: DocumentFilter) => Promise<Document[]>;
  uploadDocument: (file: File, metadata: DocumentMetadata) => Promise<Document>;
  updateDocumentMetadata: (id: string, metadata: DocumentMetadata) => Promise<Document>;
  uploadNewVersion: (id: string, file: File) => Promise<Document>;
  shareDocument: (id: string, userId: string, permission: 'view' | 'edit' | 'admin') => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  getDocumentById: (id: string) => Promise<Document | null>;
  getDocumentVersions: (id: string) => Promise<DocumentVersion[]>;
  getAuditLog: (id: string) => Promise<DocumentAuditEntry[]>;
  setFilter: (filter: Partial<DocumentFilter>) => void;
  resetFilter: () => void;
}

// Notification Store types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  read?: boolean;
  timestamp?: number;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface INotificationStore {
  notifications: Notification[];
  toasts: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'timestamp' | 'read'> & { timestamp?: number; read?: boolean }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

// Data Store types
export interface TableData {
  columns: {
    id: string;
    header: string;
    accessorKey?: string;
    cell?: (value: Record<string, unknown>) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
  }[];
  data: Record<string, unknown>[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  created: string;
  [key: string]: unknown;
}

export interface IDataStore {
  dashboardCharts: Record<string, ChartData>;
  tableData: Record<string, TableData>;
  users: UserData[];
  loading: Record<string, boolean>;
  fetchData: (dataKey: string, params?: Record<string, unknown>) => Promise<unknown>;
  createData: (dataType: string, data: Record<string, unknown>) => Promise<unknown>;
  updateData: (dataType: string, id: string, data: Record<string, unknown>) => Promise<unknown>;
  deleteData: (dataType: string, id: string) => Promise<boolean>;
}

// Root Store interface
export interface IRootStore {
  uiStore: IUIStore;
  userStore: IUserStore;
  notificationStore: INotificationStore;
  dataStore: IDataStore;
  documentStore: DocumentStore;
  documentService: DocumentService;
}

// Add new StoreContextType type alias
export type StoreContextType = RootStore; 