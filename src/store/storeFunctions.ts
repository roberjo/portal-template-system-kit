import { useContext } from 'react';
import { StoreContext } from './StoreContext';

// Create a custom hook to use the store
export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
}; 