'use client';

import { motion } from 'framer-motion';
import { Crown, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { PrimaryButton } from './Buttons';
import { useAuth } from './AuthContext';
import { showToast } from '@/lib/toast';

interface PremiumUnlockProps {
  feature: string;
  description?: string;
  onUpgrade?: () => void;
}

export default function PremiumUnlock({ feature, description, onUpgrade }: PremiumUnlockProps) {
  const { user } = useAuth();

  const handleUpgrade = () => {
    if (!user) {
      showToast.loginRequired();
      return;
    }
    onUpgrade?.();
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 35,
        duration: 0.6,
      }}
      className="relative overflow-hidden rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/5 to-orange-500/5 backdrop-blur-sm p-6"
    >
      {/* Animated background gradient */}
      <motion.div
        animate={{
          x: [0, 100, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-yellow-400/10"
      />
      
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            delay: 0.1,
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full mb-4"
        >
          <Crown className="w-4 h-4" />
          <span className="text-sm font-bold">PREMIUM FEATURE</span>
          <Sparkles className="w-4 h-4 animate-pulse" />
        </motion.div>

        <motion.h3
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-white mb-2"
        >
          {feature}
        </motion.h3>

        {description && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 mb-6"
          >
            {description}
          </motion.p>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3"
        >
          <PrimaryButton
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0 flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Unlock Premium
            <ArrowRight className="w-4 h-4" />
          </PrimaryButton>
        </motion.div>

        {/* Floating sparkles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeInOut"
            }}
            className="absolute top-4 right-4"
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
