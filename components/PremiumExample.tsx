'use client';

import { useState } from 'react';
import { PrimaryButton } from './Buttons';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import PremiumGateWrapper from './PremiumGateWrapper';
import PremiumBadge from './PremiumBadge';

export default function PremiumExample() {
  const { 
    requirePremium, 
    premiumGateOpen, 
    closePremiumGate, 
    currentFeature 
  } = useAuthProtection();

  const handleUpgrade = () => {
    // Handle upgrade logic here
    console.log('Upgrade clicked');
  };

  const premiumFeatures = [
    {
      name: 'Advanced Analytics',
      description: 'Get detailed insights into your event performance',
      action: () => requirePremium(() => {}, 'Advanced Analytics', 'View detailed analytics and insights about your events')
    },
    {
      name: 'Custom Branding',
      description: 'Add your own logo and colors to events',
      action: () => requirePremium(() => {}, 'Custom Branding', 'Personalize your events with custom branding')
    },
    {
      name: 'Priority Support',
      description: 'Get 24/7 priority customer support',
      action: () => requirePremium(() => {}, 'Priority Support', 'Access our premium support team anytime')
    }
  ];

  return (
    <>
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Premium Features Demo</h2>
        
        <div className="grid gap-4">
          {premiumFeatures.map((feature, index) => (
            <PremiumBadge key={index} showAnimation={true} className="w-full">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{feature.name}</h3>
                <p className="text-gray-300 mb-4">{feature.description}</p>
                <PrimaryButton 
                  onClick={feature.action}
                  className="w-full"
                >
                  Access Feature
                </PrimaryButton>
              </div>
            </PremiumBadge>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            💡 Try clicking on any premium feature to see the right-to-left sliding animation!
          </p>
        </div>
      </div>

      <PremiumGateWrapper
        isOpen={premiumGateOpen}
        onClose={closePremiumGate}
        feature={currentFeature}
        onUpgrade={handleUpgrade}
      />
    </>
  );
}
