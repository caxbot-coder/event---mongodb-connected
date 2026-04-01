'use client';

import PremiumGate from './PremiumGate';

interface PremiumGateWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
  onUpgrade?: () => void;
}

export default function PremiumGateWrapper({ 
  isOpen, 
  onClose, 
  feature, 
  description, 
  onUpgrade 
}: PremiumGateWrapperProps) {
  return (
    <PremiumGate
      isOpen={isOpen}
      onClose={onClose}
      feature={feature}
      description={description}
      onUpgrade={onUpgrade}
    />
  );
}
