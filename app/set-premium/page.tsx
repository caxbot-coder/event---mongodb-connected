'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';

export default function SetPremiumPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const setPremiumStatus = async (isPremium: boolean) => {
    if (!user?.id) {
      setMessage('No user found. Please log in first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/set-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          isPremium: isPremium
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage(`Success! Premium status set to ${isPremium}. Please refresh the page to see changes.`);
        // Reload the page after a short delay to update the user session
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error setting premium status:', error);
      setMessage('Failed to set premium status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Log In</h1>
          <p className="text-gray-300">You need to be logged in to set premium status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Set Premium Status</h1>
        
        <div className="mb-6 p-4 bg-gray-700 rounded">
          <p className="text-sm text-gray-300 mb-2">
            <strong>User ID:</strong> {user.id}
          </p>
          <p className="text-sm text-gray-300 mb-2">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-sm text-gray-300">
            <strong>Current Premium Status:</strong> {user.user_metadata?.isPremium ? 'Yes' : 'No'}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setPremiumStatus(true)}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting...' : 'Set Premium Status to YES'}
          </button>
          
          <button
            onClick={() => setPremiumStatus(false)}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting...' : 'Set Premium Status to NO'}
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded text-sm ${
            message.includes('Success') ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/events/create" className="text-blue-400 hover:text-blue-300">
            Go to Event Creation Page
          </a>
        </div>
      </div>
    </div>
  );
}
