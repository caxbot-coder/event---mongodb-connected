'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useHotToast } from '@/components/HotToastContext';

export const useAuthProtection = () => {
  const { user } = useAuth();
  const { showHotToast } = useHotToast();
  const [premiumGateOpen, setPremiumGateOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState('');

  const requireAuth = (callback?: () => void) => {
    if (!user) {
      return false;
    }
    callback?.();
    return true;
  };

  const requirePremium = (callback?: () => void, featureName?: string, featureDescription?: string) => {
    if (!user) {
      return false;
    }
    
    // Add your premium check logic here
    // For now, we'll assume all logged-in users have access
    // You can modify this based on your user data structure
    const isPremium = user.user_metadata?.is_premium || false;
    
    if (!isPremium) {
      if (featureName) {
        setCurrentFeature(featureName);
        setPremiumGateOpen(true);
      } else {
        showHotToast('You need a premium membership to access this feature', 'error');
      }
      return false;
    }
    
    callback?.();
    return true;
  };

  const closePremiumGate = () => {
    setPremiumGateOpen(false);
    setCurrentFeature('');
  };

  return {
    requireAuth,
    requirePremium,
    closePremiumGate,
    premiumGateOpen,
    currentFeature,
    isAuthenticated: !!user,
    isPremium: user?.user_metadata?.is_premium || false,
  };
};
