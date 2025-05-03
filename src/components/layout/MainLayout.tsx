
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ModalContainer } from '../modals/ModalContainer';
import { ToastContainer } from '../notifications/ToastContainer';
import rootStore from '../../store/RootStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = observer(({ children }: MainLayoutProps) => {
  const { sidebarCollapsed } = rootStore.uiStore;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main 
          className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
          }`}
        >
          <div className="container mx-auto py-4">
            {children}
          </div>
        </main>
      </div>
      
      {/* Modal and Toast containers */}
      <ModalContainer />
      <ToastContainer />
    </div>
  );
});
