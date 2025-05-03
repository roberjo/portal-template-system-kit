
import React from 'react';
import { observer } from 'mobx-react-lite';
import { X } from 'lucide-react';
import rootStore from '../../store/RootStore';

export const ModalContainer = observer(() => {
  const { modalOpen, modalOptions, closeModal } = rootStore.uiStore;
  
  if (!modalOpen || !modalOptions) return null;
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };
  
  const getSizeClass = () => {
    switch (modalOptions.size) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case 'full': return 'max-w-full m-4';
      default: return 'max-w-lg';
    }
  };
  
  return (
    <div 
      className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center transition-opacity duration-300
                  ${modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-card rounded-lg shadow-lg w-full ${getSizeClass()} transform transition-all duration-300
                    ${modalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 id="modal-title" className="text-xl font-semibold">{modalOptions.title}</h2>
          <button 
            onClick={closeModal} 
            className="p-1 rounded-md hover:bg-accent transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {modalOptions.content}
        </div>
        
        {(modalOptions.onConfirm || modalOptions.onCancel) && (
          <div className="flex justify-end gap-2 border-t border-border p-4">
            {modalOptions.onCancel && (
              <button
                onClick={() => {
                  modalOptions.onCancel?.();
                  closeModal();
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                {modalOptions.cancelText || 'Cancel'}
              </button>
            )}
            
            {modalOptions.onConfirm && (
              <button
                onClick={() => {
                  modalOptions.onConfirm?.();
                  closeModal();
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                {modalOptions.confirmText || 'Confirm'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
