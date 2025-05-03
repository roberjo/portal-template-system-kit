import React from 'react';
import { observer } from 'mobx-react-lite';
import { X } from 'lucide-react';
import rootStore from '../../store/RootStore';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const getSizeClass = () => {
  const { modalOptions } = rootStore.uiStore;
  
  switch (modalOptions.size) {
    case 'sm':
      return 'max-w-sm';
    case 'lg':
      return 'max-w-3xl';
    case 'md':
    default:
      return 'max-w-lg';
  }
};

export const ModalContainer = observer(() => {
  const { modalOpen, modalOptions, closeModal } = rootStore.uiStore;
  
  if (!modalOpen) {
    return null;
  }
  
  return (
    <TooltipProvider>
      <div 
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => modalOptions.closeOnOverlayClick !== false && closeModal()}
      >
        <div 
          className={`bg-card rounded-lg shadow-lg w-full ${getSizeClass()} transform transition-all duration-300
                      ${modalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 id="modal-title" className="text-xl font-semibold">{modalOptions.title}</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={closeModal} 
                  className="p-1 rounded-md hover:bg-accent transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close dialog</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {modalOptions.content}
          </div>
          
          {(modalOptions.onConfirm || modalOptions.onCancel) && (
            <div className="flex justify-end gap-2 border-t border-border p-4">
              {modalOptions.onCancel && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    modalOptions.onCancel?.();
                    closeModal();
                  }}
                  tooltip="Cancel this action"
                >
                  {modalOptions.cancelText || 'Cancel'}
                </Button>
              )}
              
              {modalOptions.onConfirm && (
                <Button
                  onClick={() => {
                    modalOptions.onConfirm?.();
                    closeModal();
                  }}
                  tooltip="Confirm this action"
                >
                  {modalOptions.confirmText || 'Confirm'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
});
