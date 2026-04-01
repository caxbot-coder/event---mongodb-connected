'use client';

import { Shield, AlertCircle, Mail } from 'lucide-react';

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-red-100 rounded-full">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Blocked
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your account has been blocked by the administrator. This could be due to violation of our terms of service or other policy infractions.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">
                What happens next?
              </h3>
              <p className="text-sm text-yellow-700">
                If you believe this is a mistake, please contact our support team to review your case.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <a
            href="mailto:support@example.com"
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
          </a>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Reference ID: {typeof window !== 'undefined' ? window.location.pathname : 'BLOCKED'}
          </p>
        </div>
      </div>
    </div>
  );
}
