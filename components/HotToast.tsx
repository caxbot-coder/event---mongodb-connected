'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface HotToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export default function HotToast({ message, type, onClose }: HotToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = 4000; // 4 seconds
    const interval = 50; // Update every 50ms
    const step = (interval / duration) * 100;
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - step;
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, interval);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />
  };

  const titles = {
    success: 'Success',
    error: 'Error',
    info: 'Information',
    warning: 'Warning'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 400, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 400, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative bg-gray-900 rounded-xl shadow-lg min-w-[300px] max-w-md overflow-hidden"
        >
          {/* Main content */}
          <div className="flex items-center gap-3 p-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              {icons[type]}
            </div>
            
            {/* Text content */}
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">
                {titles[type]}
              </p>
              <p className="text-gray-400 text-xs">
                {message}
              </p>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Blue progress bar */}
          <div className="h-1 bg-gray-800">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: "100%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.05, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
