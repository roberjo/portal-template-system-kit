import React, { useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import rootStore from '../../store/RootStore';
import { Notification } from '../../store/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const ToastItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { dismissToast } = rootStore.notificationStore;
  const [isExiting, setIsExiting] = React.useState(false);
  
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => dismissToast(notification.id), 300);
  }, [dismissToast, notification.id]);
  
  useEffect(() => {
    // Auto dismiss after duration
    if (notification.duration) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, handleDismiss]);
  
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info': default: return <Info className="h-5 w-5 text-info" />;
    }
  };
  
  const getBorderColor = () => {
    switch (notification.type) {
      case 'success': return 'border-success';
      case 'error': return 'border-destructive';
      case 'warning': return 'border-warning';
      case 'info': default: return 'border-info';
    }
  };
  
  return (
    <div
      className={`bg-card border-l-4 ${getBorderColor()} rounded-md shadow-md p-4 mb-2 w-full max-w-sm
                  transform transition-all duration-300 ${
                    isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
                  }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex">
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-medium text-sm">{notification.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
            
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="mt-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {notification.action.label}
              </button>
            )}
          </div>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 ml-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dismiss notification</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export const ToastContainer = observer(() => {
  const { toasts } = rootStore.notificationStore;
  
  return (
    <TooltipProvider>
      <div className="fixed z-50 top-4 right-4 flex flex-col items-end space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem notification={toast} />
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
});
