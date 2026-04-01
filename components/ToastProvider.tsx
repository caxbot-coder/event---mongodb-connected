'use client';

import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 4000,
        className: '',
        style: {
          background: 'rgba(30, 41, 59, 0.95)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          animation: 'slideInRight 0.3s ease-out, slideOutRight 0.3s ease-in 3.7s',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          style: {
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          },
        },
        loading: {
          iconTheme: {
            primary: '#8b5cf6',
            secondary: '#ffffff',
          },
          style: {
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          },
        },
      }}
    />
  );
};

export default ToastProvider;
