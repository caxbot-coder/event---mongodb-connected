'use client';

import { useEffect } from 'react';
import { AnalyticsService } from '@/lib/analytics';

export default function AnalyticsTracker() {
  useEffect(() => {
    // Initialize analytics tracking
    AnalyticsService.init();
  }, []);

  return null; // This component doesn't render anything
}
