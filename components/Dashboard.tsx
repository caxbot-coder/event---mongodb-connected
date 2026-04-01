'use client';

import { motion } from 'framer-motion';
import { Calendar, Trophy, Users, TrendingUp } from 'lucide-react';
import ProfileBadge from './ProfileBadge';
import CurrentPlan from './CurrentPlan';
import { useAuth } from './AuthContext';
import { PrimaryButton } from './Buttons';

export default function Dashboard() {
  const { user } = useAuth();
  const isPremium = user?.user_metadata?.is_premium || false;

  const stats = [
    {
      label: 'Events Created',
      value: isPremium ? 'Unlimited' : '3',
      icon: <Calendar className="w-5 h-5" />,
      color: 'from-blue-400 to-blue-600'
    },
    {
      label: 'Total Attendees',
      value: '1,234',
      icon: <Users className="w-5 h-5" />,
      color: 'from-green-400 to-green-600'
    },
    {
      label: 'Success Rate',
      value: '98%',
      icon: <Trophy className="w-5 h-5" />,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      label: 'Growth',
      value: '+24%',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-purple-400 to-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!</p>
        </div>
        <ProfileBadge />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
                {stat.icon}
              </div>
              {stat.label === 'Events Created' && isPremium && (
                <div className="px-2 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-full">
                  <span className="text-xs text-yellow-400 font-medium">Premium</span>
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Current Plan Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <CurrentPlan />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PrimaryButton className="justify-center">
            Create New Event
          </PrimaryButton>
          <PrimaryButton className="justify-center bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 border-0">
            {isPremium ? 'Manage Premium' : 'Upgrade to Premium'}
          </PrimaryButton>
        </div>
      </motion.div>

      {/* Premium Benefits (for non-premium users) */}
      {!isPremium && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Unlock Premium Features</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Get unlimited events, advanced analytics, priority support, and more with Premium!
          </p>
          <PrimaryButton className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 border-0">
            Upgrade Now
          </PrimaryButton>
        </motion.div>
      )}
    </div>
  );
}
