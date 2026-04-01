'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X } from 'lucide-react';
import PremiumUnlock from './PremiumUnlock';

interface PremiumGateProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
  onUpgrade?: () => void;
}

export default function PremiumGate({ isOpen, onClose, feature, description, onUpgrade }: PremiumGateProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Sliding panel from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5,
            }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between mb-8"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Premium Feature</h2>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </motion.button>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <PremiumUnlock
                  feature={feature}
                  description={description}
                  onUpgrade={() => {
                    onUpgrade?.();
                    onClose();
                  }}
                />
              </motion.div>

              {/* Premium benefits list */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 space-y-4"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Premium Benefits:</h3>
                {[
                  'Unlimited event creation',
                  'Advanced analytics dashboard',
                  'Priority customer support',
                  'Custom branding options',
                  'API access',
                  'Advanced integrations'
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
