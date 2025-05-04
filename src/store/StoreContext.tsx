import React, { createContext, useContext } from 'react';
import rootStore from './RootStore';
import { StoreContextType } from './types';

// Create the context with a default value of the root store
export const StoreContext = createContext<StoreContextType>(rootStore);

// Create a provider component
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
};

// Create a custom hook to use the store
export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
}; 