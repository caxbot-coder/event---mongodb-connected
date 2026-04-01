'use client';

import { motion } from 'framer-motion';
import { Crown, Check, Star, Zap } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function CurrentPlan() {
  const { user } = useAuth();
  const isPremium = user?.user_metadata?.is_premium || false;
  const currentPlan = user?.user_metadata?.plan || 'Free';

  const plans = {
    Free: {
      name: 'Free Plan',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-gray-400 to-gray-600',
      features: ['Basic event creation', 'Limited analytics', 'Community support']
    },
    Starter: {
      name: 'Starter Plan',
      icon: <Star className="w-5 h-5" />,
      color: 'from-blue-400 to-blue-600',
      features: ['Advanced event creation', 'Basic analytics', 'Email support', 'Custom branding']
    },
    Growth: {
      name: 'Growth Plan',
      icon: <Check className="w-5 h-5" />,
      color: 'from-purple-400 to-purple-600',
      features: ['Unlimited events', 'Advanced analytics', 'Priority support', 'API access']
    },
    Scale: {
      name: 'Scale Plan',
      icon: <Crown className="w-5 h-5" />,
      color: 'from-yellow-400 to-orange-500',
      features: ['Everything in Growth', 'Dedicated support', 'Custom integrations', 'White label']
    }
  };

  const plan = plans[currentPlan as keyof typeof plans] || plans.Free;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-gradient-to-r ${plan.color} rounded-lg`}>
            {plan.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            {isPremium && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-yellow-400 flex items-center gap-1"
              >
                <Crown className="w-3 h-3" />
                Active
              </motion.p>
            )}
          </div>
        </div>
        
        {isPremium && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
          >
            <span className="text-xs font-bold text-white">PREMIUM</span>
          </motion.div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-300 mb-3">Included features:</p>
        {plan.features.map((feature, index) => (
          <motion.div
            key={feature}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 text-sm text-gray-300"
          >
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full" />
            {feature}
          </motion.div>
        ))}
      </div>

      {!isPremium && (
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
        >
          Upgrade to Premium
        </motion.button>
      )}
    </motion.div>
  );
}
