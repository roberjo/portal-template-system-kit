import React from 'react';
import { observer } from 'mobx-react-lite';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ModalContainer } from '../modals/ModalContainer';
import { ToastContainer } from '../notifications/ToastContainer';
import { useStore } from '../../store/StoreContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = observer(({ children }: MainLayoutProps) => {
  const { sidebarCollapsed } = useStore().uiStore;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main 
          className="flex-1 overflow-y-auto pt-4 pr-4 pb-4"
        >
          {children}
        </main>
      </div>
      
      {/* Modal and Toast containers */}
      <ModalContainer />
      <ToastContainer />
    </div>
  );
});
