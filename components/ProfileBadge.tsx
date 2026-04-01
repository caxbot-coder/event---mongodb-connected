'use client';

import { motion } from 'framer-motion';
import { Crown, User } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function ProfileBadge() {
  const { user } = useAuth();
  const isPremium = user?.user_metadata?.is_premium || false;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative"
    >
      <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          
          {isPremium && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                delay: 0.2
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400/20 border-2 border-yellow-400 rounded-full flex items-center justify-center"
            >
              <motion.div
                animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1.05, 1]
                }}
                transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    times: [0, 0.25, 0.75, 1]
                }}
              >
                <Crown className="w-3 h-3 text-yellow-400" fill="none" strokeWidth={2} />
              </motion.div>
            </motion.div>
          )}
        </div>
        
        <div className="flex-1">
          <p className="text-white font-medium text-sm">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
          </p>
          {isPremium && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-yellow-400 font-medium"
            >
              Premium Member
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
