'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import HotToast from './HotToast';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface HotToastContextType {
  showHotToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const HotToastContext = createContext<HotToastContextType | undefined>(undefined);

interface HotToastProviderProps {
  children: ReactNode;
}

export function HotToastProvider({ children }: HotToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showHotToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <HotToastContext.Provider value={{ showHotToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto">
              <HotToast
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </HotToastContext.Provider>
  );
}

export function useHotToast() {
  const context = useContext(HotToastContext);
  if (context === undefined) {
    throw new Error('useHotToast must be used within a HotToastProvider');
  }
  return context;
}
