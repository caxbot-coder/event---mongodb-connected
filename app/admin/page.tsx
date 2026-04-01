'use client';

import { useState, useEffect } from 'react';
import { Shield, Check, Trash2, Calendar, Clock, MapPin, Users, Bell, Plus, X, Edit } from 'lucide-react';
import AdminLogin from '@/components/AdminLogin';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizerName: string;
  status: 'pending' | 'upcoming' | 'completed' | 'cancelled';
  imageUrl?: string;
  attendees?: number | string[] | string;
  attendeeCount?: number;
}

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  useEffect(() => {
    // Check authentication on mount
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (!isLoggedIn || !loginTime) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    
    // Check if session is older than 24 hours
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      // Session expired
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('adminLoginTime');
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    
    setIsAuthenticated(true);
    // Fetch events after auth check
    fetchEvents();
    setTimeout(() => setLoading(false), 1000);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchEvents();
    setTimeout(() => setLoading(false), 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    setIsAuthenticated(false);
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    try {
      const response = await fetch('/api/admin/events/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action: 'approve' }),
      });

      if (response.ok) {
        fetchEvents();
      } else {
        alert('Failed to approve event');
      }
    } catch (error) {
      alert('Failed to approve event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', eventId }),
      });

      if (response.ok) {
        fetchEvents();
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      alert('Failed to delete event');
    }
  };

  const pendingEvents = events.filter(event => event.status === 'pending');
  const approvedEvents = events.filter(event => event.status !== 'pending');

  const getAttendeeCount = (event: Event): number => {
    if (typeof event.attendees === 'number') {
      return event.attendees;
    } else if (Array.isArray(event.attendees)) {
      return event.attendees.length;
    } else if (typeof event.attendees === 'string') {
      try {
        const parsed = JSON.parse(event.attendees);
        return Array.isArray(parsed) ? parsed.length : 0;
      } catch {
        return event.attendees.split(',').filter(Boolean).length;
      }
    } else if (typeof event.attendeeCount === 'number') {
      return event.attendeeCount;
    }
    return 0;
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row">
      {/* Sidebar - Mobile: Top bar, Desktop: Left sidebar */}
      <div className="w-full md:w-64 bg-gray-800 border-b md:border-r md:border-b-0 border-gray-700">
        <div className="p-4 md:p-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
            <h1 className="text-lg md:text-xl font-bold text-white">Admin Panel</h1>
          </div>
        </div>
        
        <nav className="px-2 md:px-0 md:mt-6">
          <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 md:w-full text-left px-3 md:px-6 py-2 md:py-3 hover:bg-gray-700 transition-colors whitespace-nowrap ${
                activeTab === 'pending' ? 'bg-blue-600 border-l-4 border-blue-500 text-white' : 'text-gray-300'
              }`}
            >
              <span className="text-sm md:text-base">Pending ({pendingEvents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 md:w-full text-left px-3 md:px-6 py-2 md:py-3 hover:bg-gray-700 transition-colors whitespace-nowrap ${
                activeTab === 'approved' ? 'bg-blue-600 border-l-4 border-blue-500 text-white' : 'text-gray-300'
              }`}
            >
              <span className="text-sm md:text-base">Approved ({approvedEvents.length})</span>
            </button>
          </div>
          
          {/* Logout Button */}
          <div className="hidden md:block mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full text-left px-6 py-3 hover:bg-red-600/20 transition-colors text-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="px-4 md:px-8 py-4 md:py-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                {activeTab === 'pending' ? 'Pending Events' : 'Approved Events'}
              </h2>
              <p className="text-gray-400 mt-1 text-sm md:text-base">
                {activeTab === 'pending' 
                  ? 'Review and approve event submissions' 
                  : 'Manage approved events'
                }
              </p>
            </div>
            
            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="md:hidden px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 rounded-lg transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingEvents.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-sm md:text-base">No pending events to review.</p>
                </div>
              ) : (
                pendingEvents.map((event) => (
                  <div key={event.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-4 md:space-y-0">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                        <p className="text-gray-400 mb-4 text-sm md:text-base">{event.description}</p>
                        
                        {event.imageUrl && (
                          <div className="mb-4">
                            <img 
                              src={event.imageUrl} 
                              alt={event.title} 
                              className="w-full h-32 md:h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-400 flex-shrink-0" />
                            <span className="truncate">{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-blue-400 flex-shrink-0" />
                            <span className="truncate">{event.time}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-blue-400 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-blue-400 flex-shrink-0" />
                            <span className="truncate">{event.organizerName}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 ml-0 md:ml-4">
                        <button
                          onClick={() => handleApproveEvent(event.id)}
                          className="flex-1 md:flex-initial flex items-center justify-center px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Check className="h-4 w-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">Approve</span>
                          <span className="sm:hidden">✓</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="flex-1 md:flex-initial flex items-center justify-center px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <Trash2 className="h-4 w-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">Delete</span>
                          <span className="sm:hidden">🗑</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'approved' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {approvedEvents.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-12">
                  <p className="text-sm md:text-base">No approved events yet.</p>
                </div>
              ) : (
                approvedEvents.map((event) => (
                  <div key={event.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                    {event.imageUrl ? (
                      <div className="h-32 md:h-48">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 md:h-48 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <Calendar className="h-8 w-8 md:h-12 md:w-12 text-white/50" />
                      </div>
                    )}
                    
                    <div className="p-3 md:p-4">
                      <h3 className="text-base md:text-lg font-semibold text-white mb-2">{event.title}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{event.description}</p>
                      
                      <div className="space-y-2 text-sm text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-400 flex-shrink-0" />
                          <span className="truncate">Attendees: {getAttendeeCount(event)}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="w-full flex items-center justify-center px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
