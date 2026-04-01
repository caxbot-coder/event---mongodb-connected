'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3Icon, 
  CalendarIcon, 
  UsersIcon, 
  DollarSignIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  HomeIcon,
  SettingsIcon,
  TrendingUpIcon
} from 'lucide-react';

interface DashboardStats {
  totalEvents: number;
  totalUsers: number;
  totalRevenue: number;
  pendingEvents: number;
}

interface RecentEvent {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  attendees: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingEvents: 0
  });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
      if (!isAuthenticated) {
        router.push('/admin/login');
        return;
      }
      setIsAuthenticated(true);
      fetchDashboardData();
    };

    checkAuth();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch events data
      const eventsResponse = await fetch('/api/admin/events');
      if (eventsResponse.ok) {
        const response = await eventsResponse.json();
        const events = Array.isArray(response.events) ? response.events : Array.isArray(response) ? response : [];
        
        // Calculate stats
        const totalEvents = events.length;
        const pendingEvents = events.filter((e: any) => e.status === 'pending').length;
        const totalRevenue = events.reduce((sum: number, e: any) => sum + (e.revenue || 0), 0);
        
        // Mock user count (you can replace with actual user API)
        const totalUsers = Math.floor(Math.random() * 1000) + 500;
        
        setStats({
          totalEvents,
          totalUsers,
          totalRevenue,
          pendingEvents
        });

        // Get recent events
        const recent = events.slice(0, 5).map((e: any) => {
          let attendeeCount = 0;
          if (Array.isArray(e.attendees)) {
            attendeeCount = e.attendees.length;
          } else if (typeof e.attendees === 'number') {
            attendeeCount = e.attendees;
          } else if (typeof e.attendeeCount === 'number') {
            attendeeCount = e.attendeeCount;
          }

          return {
            id: e.id,
            title: e.title,
            date: new Date(e.date).toLocaleDateString(),
            status: e.status || 'pending',
            attendees: attendeeCount,
            revenue: e.revenue || Math.floor(Math.random() * 10000)
          };
        });
        
        setRecentEvents(recent);
      } else {
        console.error('Failed to fetch events:', eventsResponse.status);
        // Set default values on error
        setStats({
          totalEvents: 0,
          totalUsers: 0,
          totalRevenue: 0,
          pendingEvents: 0
        });
        setRecentEvents([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminLoginTime');
    router.push('/admin/login');
  };

  const menuItems = [
    { icon: HomeIcon, label: 'Dashboard', href: '/admin/dashboard', active: true },
    { icon: CalendarIcon, label: 'Events', href: '/admin/events' },
    { icon: UsersIcon, label: 'Users', href: '/admin/users' },
    { icon: DollarSignIcon, label: 'Revenue', href: '/admin/revenue' },
    { icon: BarChart3Icon, label: 'Analytics', href: '/admin/analytics' },
    { icon: SettingsIcon, label: 'Settings', href: '/admin/settings' },
  ];

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">Event King</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${item.active 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              <LogOutIcon className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-white"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-white">Dashboard</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-gray-800 border-b border-gray-700 p-6">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your events and monitor performance</p>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white">Loading dashboard data...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Events</p>
                      <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{stats.totalEvents}</p>
                    </div>
                    <div className="bg-purple-600/20 p-3 rounded-lg">
                      <CalendarIcon className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-blue-600/20 p-3 rounded-lg">
                      <UsersIcon className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Revenue</p>
                      <p className="text-2xl lg:text-3xl font-bold text-white mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-600/20 p-3 rounded-lg">
                      <DollarSignIcon className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Pending Events</p>
                      <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{stats.pendingEvents}</p>
                    </div>
                    <div className="bg-yellow-600/20 p-3 rounded-lg">
                      <TrendingUpIcon className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Events Table */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-gray-700">
                  <h2 className="text-lg lg:text-xl font-semibold text-white">Recent Events</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">Attendees</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {recentEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-700/50">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{event.title}</div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{event.date}</div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <span className={`
                              px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${event.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}
                            `}>
                              {event.status}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-300">{event.attendees}</div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <div className="text-sm text-gray-300">₹{event.revenue.toLocaleString()}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
