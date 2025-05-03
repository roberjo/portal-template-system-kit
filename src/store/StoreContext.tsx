import React, { createContext, useContext } from 'react';
import rootStore, { RootStore } from './RootStore';

// Create the context with a default value of the root store
const StoreContext = createContext<RootStore>(rootStore);

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