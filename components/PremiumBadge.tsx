'use client';

import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';

interface PremiumBadgeProps {
  children: React.ReactNode;
  className?: string;
  showAnimation?: boolean;
}

export default function PremiumBadge({ children, className = '', showAnimation = true }: PremiumBadgeProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {showAnimation && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.8,
          }}
          className="absolute -top-2 -right-2 z-10"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-md opacity-60 animate-pulse" />
            <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Crown className="w-3 h-3" />
              <span className="text-xs font-bold">PREMIUM</span>
              <Sparkles className="w-3 h-3 animate-pulse" />
            </div>
          </motion.div>
        </motion.div>
      )}
      
      <motion.div
        initial={showAnimation ? { x: 50, opacity: 0 } : false}
        animate={showAnimation ? { x: 0, opacity: 1 } : false}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 40,
          delay: showAnimation ? 0.2 : 0,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
