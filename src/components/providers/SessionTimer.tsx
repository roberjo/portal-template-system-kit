import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../store/StoreContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertCircle } from 'lucide-react';

const WARNING_TIME = 60000; // Show warning 1 minute before timeout
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes total timeout
const CHECK_INTERVAL = 10000; // Check every 10 seconds

export const SessionTimer = observer(() => {
  const { userStore } = useStore();
  const { isAuthenticated, resetInactivityTimer } = userStore;
  
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  
  // Update last activity time when user interacts
  const updateActivity = () => {
    setLastActivity(Date.now());
    setShowWarning(false);
    if (isAuthenticated) {
      resetInactivityTimer();
    }
  };
  
  // Add event listeners to track user activity
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const events = ['mousedown', 'keydown', 'touchstart', 'mousemove'];
    
    const handleActivity = () => {
      updateActivity();
    };
    
    // Add throttling for mousemove
    let lastMove = 0;
    const handleMouseMove = () => {
      const now = Date.now();
      if (now - lastMove > 5000) { // Only track mousemove every 5 seconds
        lastMove = now;
        handleActivity();
      }
    };
    
    // Add event listeners
    events.forEach(event => {
      if (event === 'mousemove') {
        window.addEventListener(event, handleMouseMove);
      } else {
        window.addEventListener(event, handleActivity);
      }
    });
    
    // Check for inactivity periodically
    const intervalId = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      const timeUntilTimeout = INACTIVITY_TIMEOUT - timeSinceLastActivity;
      
      if (timeUntilTimeout <= WARNING_TIME && isAuthenticated) {
        setShowWarning(true);
        setRemainingTime(Math.floor(timeUntilTimeout / 1000));
      }
    }, CHECK_INTERVAL);
    
    // Cleanup
    return () => {
      events.forEach(event => {
        if (event === 'mousemove') {
          window.removeEventListener(event, handleMouseMove);
        } else {
          window.removeEventListener(event, handleActivity);
        }
      });
      clearInterval(intervalId);
    };
  }, [isAuthenticated, lastActivity, resetInactivityTimer]);
  
  const handleContinue = () => {
    updateActivity();
    setShowWarning(false);
  };
  
  if (!showWarning) return null;
  
  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Session Timeout Warning
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Your session will expire in {remainingTime} seconds due to inactivity.</p>
          <p className="mt-2">Do you want to continue your session?</p>
        </div>
        <DialogFooter>
          <Button onClick={handleContinue}>Continue Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default SessionTimer; 