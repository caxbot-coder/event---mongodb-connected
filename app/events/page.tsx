'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useHotToast } from '@/components/HotToastContext';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxAttendees?: string;
  organizerName: string;
  organizerId?: string; // Add owner's user ID
  category: string;
  attendees: number | string[] | string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
  imageUrl?: string;
  price?: number;
  attendeeCount?: number;
  slots?: Record<string, string>;
  winnerUserId?: string | null;
  winnerSlot?: number | null;
  winnerSelectedAt?: string | null;
}

export default function EventsPage() {
  const { user } = useAuth();
  const { showHotToast } = useHotToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set());
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);
  const [joinModalEvent, setJoinModalEvent] = useState<Event | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showSuccessPass, setShowSuccessPass] = useState(false);
  const [successData, setSuccessData] = useState<{
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    slotNumber: number | null;
  } | null>(null);
  const [ownerDetailsEvent, setOwnerDetailsEvent] = useState<Event | null>(null);
  const [ownerDetailsLoading, setOwnerDetailsLoading] = useState(false);
  const [ownerDetailsError, setOwnerDetailsError] = useState<string | null>(null);
  const [ownerDetails, setOwnerDetails] = useState<
    { userId: string; email: string; slots: number[] }[]
  >([]);
  const [isSavingWinner, setIsSavingWinner] = useState(false);

  const handleSelectWinner = async (detail: { userId: string; email: string; slots: number[] }) => {
    if (!user || !ownerDetailsEvent || isSavingWinner) return;

    const primarySlot = detail.slots[0] ?? null;
    if (!primarySlot) {
      showHotToast('This attendee does not have a valid slot.', 'error');
      return;
    }

    try {
      setIsSavingWinner(true);
      const response = await fetch('/api/events/winner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: ownerDetailsEvent.id,
          ownerId: user.id,
          winnerUserId: detail.userId,
          winnerSlot: primarySlot,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        showHotToast(result.error || 'Failed to select winner.', 'error');
        return;
      }

      const updatedEvent: Event = result.event;

      setEvents((prev) =>
        prev.map((evt) => (evt.id === updatedEvent.id ? updatedEvent : evt))
      );
      setOwnerDetailsEvent(updatedEvent);

      showHotToast('Winner selected successfully!', 'success');
    } catch (error) {
      console.error('Failed to select winner:', error);
      showHotToast('Failed to select winner. Please try again.', 'error');
    } finally {
      setIsSavingWinner(false);
    }
  };

  useEffect(() => {
    // Always fetch events once on mount and again when user changes
    // so we can correctly mark already joined events after login.
    if (user) {
      const savedJoinedEvents = localStorage.getItem(`joinedEvents_${user.id}`);
      if (savedJoinedEvents) {
        try {
          const parsedJoinedEvents = JSON.parse(savedJoinedEvents);
          setJoinedEvents(new Set(parsedJoinedEvents));
          console.log('Loaded joined events from localStorage:', parsedJoinedEvents);
        } catch (error) {
          console.error('Error parsing joined events from localStorage:', error);
        }
      }
    }

    fetchEvents();
  }, [user?.id]);

  // Update localStorage whenever joinedEvents changes
  useEffect(() => {
    if (user && joinedEvents.size > 0) {
      localStorage.setItem(`joinedEvents_${user.id}`, JSON.stringify(Array.from(joinedEvents)));
      console.log('Saved joined events to localStorage:', Array.from(joinedEvents));
    }
  }, [joinedEvents, user]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        const eventsData = data.events || [];
        console.log('Fetched events:', eventsData); // Debug log
        setEvents(eventsData);

        // Check which events the user has already joined (merge with existing state)
        if (user) {
          const joined = new Set<string>(joinedEvents); // Start with existing joined events
          eventsData.forEach((event: Event) => {
            console.log(`Event ${event.id} attendees:`, event.attendees); // Debug log

            // Check if the event has attendees array and if user is in it
            if (Array.isArray(event.attendees) && event.attendees.includes(user.id)) {
              joined.add(event.id);
              console.log(`User already joined event ${event.id}`); // Debug log
            }
            // Check if attendees is a string representation of array or JSON string
            else if (typeof event.attendees === 'string' && event.attendees.length > 0) {
              try {
                // Try to parse as JSON array
                const parsedAttendees = JSON.parse(event.attendees);
                if (Array.isArray(parsedAttendees) && parsedAttendees.includes(user.id)) {
                  joined.add(event.id);
                  console.log(`User already joined event ${event.id} (parsed JSON)`); // Debug log
                }
                // Check if it's a comma-separated string or contains user ID
                else if (event.attendees.includes(user.id)) {
                  joined.add(event.id);
                  console.log(`User already joined event ${event.id} (string check)`); // Debug log
                }
              } catch (e) {
                // If parsing fails, just check if user ID is in the string
                if (event.attendees.includes(user.id)) {
                  joined.add(event.id);
                  console.log(`User already joined event ${event.id} (fallback string check)`); // Debug log
                }
              }
            }
            // Check if attendees is a number (count of attendees)
            else if (typeof event.attendees === 'number' && event.attendees > 0) {
              // For number type, we can't determine specific users, so skip
              console.log(`Event ${event.id} has ${event.attendees} attendees (number type)`);
            }
          });

          console.log('Final joined events after merging:', Array.from(joined));

          console.log('Final joined events:', Array.from(joined)); // Debug log
          setJoinedEvents(joined);
        }
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
    return 0;
  };

  const getMaxSlots = (event: Event | null): number => {
    if (!event) return 0;
    const raw = (event as any).maxAttendees;
    if (!raw) return 0;
    const max = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
    return Number.isFinite(max) && max > 0 ? max : 0;
  };

  const getUserSlotNumber = (event: Event, userId: string | undefined): number | null => {
    if (!userId || !event.slots) return null;
    for (const [slotKey, value] of Object.entries(event.slots)) {
      if (value === userId) {
        const parsed = parseInt(slotKey, 10);
        return Number.isFinite(parsed) ? parsed : null;
      }
    }
    return null;
  };

  const openOwnerDetails = async (event: Event) => {
    if (!user) return;
    setOwnerDetailsEvent(event);
    setOwnerDetailsLoading(true);
    setOwnerDetailsError(null);
    setOwnerDetails([]);

    try {
      const slotsMap = event.slots || {};
      const byUser: Record<string, number[]> = {};

      Object.entries(slotsMap).forEach(([slotKey, value]) => {
        const slotNum = parseInt(slotKey, 10);
        if (!Number.isFinite(slotNum)) return;
        if (!byUser[value]) {
          byUser[value] = [];
        }
        byUser[value].push(slotNum);
      });

      const userIds = Object.keys(byUser);
      if (userIds.length === 0) {
        setOwnerDetails([]);
        return;
      }

      const results = await Promise.all(
        userIds.map(async (userId) => {
          try {
            const res = await fetch(`/api/user/${userId}`);
            if (!res.ok) {
              throw new Error('Failed to fetch user');
            }
            const data = await res.json();
            const email: string =
              data?.user?.email || data?.email || 'unknown@example.com';
            return {
              userId,
              email,
              slots: byUser[userId].sort((a, b) => a - b),
            };
          } catch (err) {
            console.error('Failed to load user for ticket details', err);
            return {
              userId,
              email: 'unknown@example.com',
              slots: byUser[userId].sort((a, b) => a - b),
            };
          }
        })
      );

      setOwnerDetails(results);
    } catch (error) {
      console.error('Failed to load owner details', error);
      setOwnerDetailsError('Failed to load attendee details. Please try again.');
    } finally {
      setOwnerDetailsLoading(false);
    }
  };

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    setDeleteModalOpen(eventId);
  };

  const confirmDeleteEvent = async (eventId: string, eventTitle: string) => {
    try {
      // Make API call to delete the event
      const response = await fetch('/api/events', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        setDeleteModalOpen(null);
        // Refresh events to remove the deleted event from the list
        fetchEvents();
      } else {
        const error = await response.json();
        alert(`Failed to delete event: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleJoinEventClick = (event: Event) => {
    if (!user) {
      showHotToast('Please sign in to join events.', 'info');
      return;
    }

    const isPremium = user?.user_metadata?.isPremium || user?.user_metadata?.is_premium || false;

    if (!isPremium) {
      showHotToast('You need a premium membership to join events. Upgrade to premium to access all events!', 'error');
      return;
    }

    if (joinedEvents.has(event.id)) {
      showHotToast('You have already joined this event.', 'info');
      return;
    }

    const maxSlots = getMaxSlots(event);
    const takenSlots = event.slots ? Object.keys(event.slots).map((key) => parseInt(key, 10)) : [];
    let initialSlot: number | null = null;

    if (maxSlots > 0) {
      for (let i = 1; i <= maxSlots; i++) {
        if (!takenSlots.includes(i)) {
          initialSlot = i;
          break;
        }
      }
    }

    setJoinModalEvent(event);
    setSelectedSlot(initialSlot);
    setAcceptTerms(false);
    setShowSuccessPass(false);
    setSuccessData(null);
  };

  const confirmJoinEvent = async () => {
    if (!user || !joinModalEvent) return;
    if (!selectedSlot) {
      showHotToast('Please select a slot to join.', 'error');
      return;
    }
    if (!acceptTerms) {
      showHotToast('Please confirm the checkbox before joining.', 'error');
      return;
    }

    const eventId = joinModalEvent.id;

    if (joinedEvents.has(eventId)) {
      showHotToast('You have already joined this event.', 'info');
      setJoinModalEvent(null);
      return;
    }

    try {
      setIsJoining(true);
      // Close the slot selection popup immediately after clicking Join Now
      setJoinModalEvent(null);

      const response = await fetch('/api/events/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, userId: user.id, slot: selectedSlot }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showHotToast('Successfully joined the event!', 'success');

        setJoinedEvents(prev => new Set([...prev, eventId]));

        const currentJoined = localStorage.getItem(`joinedEvents_${user.id}`);
        const joinedArray = currentJoined ? JSON.parse(currentJoined) : [];
        if (!joinedArray.includes(eventId)) {
          joinedArray.push(eventId);
          localStorage.setItem(`joinedEvents_${user.id}`, JSON.stringify(joinedArray));
        }

        setEvents(prev => prev.map(event => {
          if (event.id === eventId) {
            const attendeeCount = typeof event.attendees === 'number'
              ? event.attendees + 1
              : getAttendeeCount(event) + 1;

            const updatedAttendees = Array.isArray(event.attendees)
              ? [...event.attendees, user.id]
              : [user.id];

            const updatedSlots = {
              ...(event.slots || {}),
              [String(selectedSlot)]: user.id,
            };

            return {
              ...event,
              attendees: updatedAttendees,
              attendeeCount,
              slots: updatedSlots,
            };
          }
          return event;
        }));

        setSuccessData({
          eventTitle: joinModalEvent.title,
          eventDate: new Date((joinModalEvent as any).date).toLocaleDateString(),
          eventTime: (joinModalEvent as any).time,
          eventLocation: (joinModalEvent as any).location,
          slotNumber: selectedSlot,
        });
        setShowSuccessPass(true);
      } else {
        if (result.error && typeof result.error === 'string' && result.error.toLowerCase().includes('already joined')) {
          showHotToast('You have already joined this event.', 'info');

          setJoinedEvents(prev => new Set([...prev, eventId]));

          const currentJoined = localStorage.getItem(`joinedEvents_${user.id}`);
          const joinedArray = currentJoined ? JSON.parse(currentJoined) : [];
          if (!joinedArray.includes(eventId)) {
            joinedArray.push(eventId);
            localStorage.setItem(`joinedEvents_${user.id}`, JSON.stringify(joinedArray));
          }
        } else {
          showHotToast(result.error || 'Failed to join event', 'error');
        }
      }
    } catch (error) {
      console.error('Error joining event:', error);
      showHotToast('Failed to join event. Please try again.', 'error');
    } finally {
      setIsJoining(false);
    }
  };

  const filteredEvents = selectedCategory === 'all'
    ? events
    : events.filter((event: any) => event.category === selectedCategory);

  if (loading) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <motion.div
          className="rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-blue-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const currentUserName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Guest';

  return (
    <div className="relative z-10 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-28 md:pt-32 pb-8 sm:pb-12 lg:pb-16">
        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-6">
          {filteredEvents.map((event: any, index: number) => (
            <motion.div
              key={event.id}
              ref={(el) => {
                refs.current[index] = el;
              }}
              initial={{ y: 150, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.1 + index * 0.1 }}
              onAnimationComplete={() => {
                const card = refs.current[index];
                if (card) {
                  card.classList.add("transition", "duration-500", "hover:scale-102");
                }
              }}
              className="relative p-6 rounded-lg border backdrop-blur bg-indigo-950/30 border-white/8 overflow-hidden hover:shadow-lg transition-shadow w-full"
            >
              <div className="relative mb-3">
                {event.imageUrl ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white/50" />
                  </div>
                )}
                <motion.div
                  className="absolute top-2 sm:top-4 right-2 sm:right-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 250, damping: 70, delay: 0.3 + index * 0.1 }}
                >
                  <span className="bg-indigo-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center backdrop-blur-sm">
                    <span className="hidden sm:inline">{event.category}</span>
                    <span className="sm:hidden">{event.category.slice(0, 1).toUpperCase()}</span>
                  </span>
                </motion.div>
              </div>

              <div className="space-y-4">
                <motion.h3
                  className="text-lg sm:text-xl font-bold text-white line-clamp-2 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  {(event as any).title}
                </motion.h3>
                <motion.p
                  className="text-gray-400 text-sm sm:text-base line-clamp-2 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {(event as any).description}
                </motion.p>

                {/* Attendee Progress Bar */}
                <motion.div
                  className="space-y-2 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (index as number) * 0.1 }}
                >
                  <div className="flex items-center justify-between text-sm sm:text-base text-gray-400">
                    <span>Attendees</span>
                    <span>{getAttendeeCount(event as any)} / {(event as any).maxAttendees || '∞'}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min((getAttendeeCount(event as any) / parseInt((event as any).maxAttendees || '100')) * 100, 100)}%` }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="space-y-2 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index as number) * 0.1 }}
                >
                  <div className="flex items-center text-gray-400 text-sm sm:text-base">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-400" />
                    <span className="truncate">{new Date((event as any).date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm sm:text-base">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-400" />
                    <span className="truncate">{(event as any).time}</span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm sm:text-base">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-400" />
                    <span className="truncate">{(event as any).location}</span>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center justify-between mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (index as number) * 0.1 }}
                >
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-2">Organized by {(event as any).organizerName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      (event as any).status === 'upcoming' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {(event as any).status}
                    </span>
                  </div>
                </motion.div>

                {(() => {
                  const isEventJoined = joinedEvents.has(event.id);
                  // Check if user is the event owner by comparing user ID with organizerId
                  const isEventOwner = user && (
                    (event.organizerId && event.organizerId === user.id) ||
                    // Fallback to name comparison for older events without organizerId
                    (!event.organizerId && event.organizerName === (user.user_metadata?.full_name || user.email?.split('@')[0]))
                  );

                  // If user has already joined, show Booked status
                  if (isEventJoined) {
                    return (
                      <motion.div
                        className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-green-600 text-white font-semibold text-sm sm:text-base text-center cursor-default"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + (index as any) * 0.1 }}
                      >
                        Booked
                      </motion.div>
                    );
                  }

                  // If user is the event owner, show owner controls
                  if (isEventOwner) {
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + (index as any) * 0.1 }}
                      >
                        <div className="flex flex-col sm:flex-row gap-2">
                          <motion.button
                            onClick={() => openOwnerDetails(event as any)}
                            className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            View Details
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteEvent(event.id, event.title)}
                            className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors text-sm sm:text-base"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Delete Event
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  }

                  // Regular users see the Book Now button
                  return (
                    <motion.button
                      onClick={() => handleJoinEventClick(event as any)}
                      disabled={!user}
                      className={`w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                        !user
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : (user?.user_metadata?.isPremium || user?.user_metadata?.is_premium)
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + (index as any) * 0.1 }}
                      whileHover={!user ? {} : (user?.user_metadata?.isPremium || user?.user_metadata?.is_premium) ? { scale: 1.02 } : {}}
                      whileTap={!user ? {} : (user?.user_metadata?.isPremium || user?.user_metadata?.is_premium) ? { scale: 0.98 } : {}}
                    >
                      {!user ? 'Sign In to Join' :
                        (user?.user_metadata?.isPremium || user?.user_metadata?.is_premium) ? 'Book Now' : 'Premium Required'}
                    </motion.button>
                  );
                })()}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <motion.div
            className="text-center py-8 sm:py-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 70 }}
          >
            <p className="text-gray-400 text-base sm:text-lg">No events found in this category.</p>
          </motion.div>
        )}
      </div>

      {/* Join Event Modal */}
      {joinModalEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => !isJoining && setJoinModalEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl p-6 sm:p-8 max-w-md mx-4 border border-white/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-white mb-2">Join Event</h3>
            <p className="text-gray-300 mb-4">
              {joinModalEvent.title}
            </p>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Select your slot</p>
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                {Array.from({
                  length: getMaxSlots(joinModalEvent) > 0 ? getMaxSlots(joinModalEvent) : 1,
                }).map((_, index) => {
                  const slotNumber = index + 1;
                  const takenSlots = joinModalEvent.slots
                    ? Object.keys(joinModalEvent.slots).map((key) => parseInt(key, 10))
                    : [];
                  const isTaken = takenSlots.includes(slotNumber);
                  const isSelected = selectedSlot === slotNumber;

                  return (
                    <button
                      key={slotNumber}
                      type="button"
                      disabled={isTaken}
                      onClick={() => !isTaken && setSelectedSlot(slotNumber)}
                      className={`h-9 rounded-lg text-sm font-semibold border transition-colors ${
                        isTaken
                          ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                          : isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-indigo-400'
                      }`}
                    >
                      {slotNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-xs sm:text-sm text-gray-300">
                I confirm my slot selection and agree to the event guidelines.
              </span>
            </label>

            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={() => setJoinModalEvent(null)}
                className="flex-1 px-4 py-2.5 bg-gray-800 text-gray-200 rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isJoining}
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                onClick={confirmJoinEvent}
                disabled={isJoining || !selectedSlot || !acceptTerms}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center"
                whileHover={isJoining || !selectedSlot || !acceptTerms ? {} : { scale: 1.02 }}
                whileTap={isJoining || !selectedSlot || !acceptTerms ? {} : { scale: 0.98 }}
              >
                {isJoining ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Joining...
                  </>
                ) : (
                  'Join Now'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Success Pass Modal */}
      {showSuccessPass && successData && user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowSuccessPass(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, damping: 25 }}
            className="fixed inset-0 z-[51] flex items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black/50 backdrop-blur-md border border-white/4 rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg overflow-hidden p-6 sm:p-8">
              <div className="relative z-10 mb-4 text-center">
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-indigo-100/70 mb-2">
                  Entry Ticket
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Your Event Pass
                </h3>
              </div>

              <div className="relative z-10 bg-black/40 rounded-2xl p-4 sm:p-5 border border-white/10 mb-4">
                <p className="text-[11px] sm:text-xs text-indigo-100/80 mb-1 tracking-wide">
                  ENTRY PASS • PREMIUM EVENT
                </p>
                <p className="text-lg sm:text-xl font-semibold text-white mb-2 line-clamp-2">
                  {successData.eventTitle}
                </p>
                <div className="space-y-1 text-xs sm:text-sm text-indigo-100/90">
                  <p>
                    <span className="font-medium">Date:</span> {successData.eventDate}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {successData.eventLocation}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {successData.eventTime}
                  </p>
                  <p>
                    <span className="font-medium">Slot:</span> {successData.slotNumber ?? '-'}
                  </p>
                  <p>
                    <span className="font-medium">User ID:</span>{' '}
                    <span className="font-mono break-all">{user.id}</span>
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between text-[11px] sm:text-xs text-indigo-100/80">
                <span>Show this pass at entry</span>
                <span className="font-mono opacity-80">
                  Slot #{successData.slotNumber ?? '-'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowSuccessPass(false)}
                className="relative z-10 mt-5 w-full py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setDeleteModalOpen(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-xl p-6 max-w-md mx-4 border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Delete Event</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{events.find((e) => e.id === deleteModalOpen)?.title}"?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <motion.button
                onClick={() => setDeleteModalOpen(null)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => {
                  const eventToDelete = events.find((e) => e.id === deleteModalOpen);
                  if (eventToDelete) {
                    confirmDeleteEvent(eventToDelete.id, eventToDelete.title);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Owner (Attendee) Details Modal */}
      {ownerDetailsEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => {
            setOwnerDetailsEvent(null);
            setOwnerDetails([]);
            setOwnerDetailsError(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-gray-900 rounded-2xl p-6 sm:p-8 max-w-lg w-full mx-4 border border-white/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Attendee Details
                </h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                  {ownerDetailsEvent.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOwnerDetailsEvent(null);
                  setOwnerDetails([]);
                  setOwnerDetailsError(null);
                }}
                className="text-gray-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            {ownerDetailsLoading && (
              <div className="py-6 text-center text-gray-300 text-sm">
                Loading attendee details...
              </div>
            )}

            {!ownerDetailsLoading && ownerDetailsError && (
              <div className="py-4 mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3">
                {ownerDetailsError}
              </div>
            )}

            {!ownerDetailsLoading && !ownerDetailsError && ownerDetails.length === 0 && (
              <div className="py-6 text-center text-gray-300 text-sm">
                No attendees found for this event yet.
              </div>
            )}

            {!ownerDetailsLoading && ownerDetails.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {ownerDetails.map((detail) => {
                  const isCurrentWinner =
                    ownerDetailsEvent?.winnerUserId === detail.userId;

                  return (
                    <div
                      key={detail.userId}
                      className={`flex items-center justify-between gap-3 bg-white/5 border rounded-lg px-3 py-2.5 text-xs sm:text-sm ${
                        isCurrentWinner
                          ? 'border-yellow-400/80 bg-yellow-500/10'
                          : 'border-white/10'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-mono break-all text-indigo-100/90">
                          {detail.userId}
                        </p>
                        <p className="font-mono text-[11px] text-indigo-200/80 mt-1">
                          Slots: {detail.slots.join(', ')}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isSavingWinner}
                        onClick={() => handleSelectWinner(detail)}
                        className={`ml-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap ${
                          isCurrentWinner
                            ? 'bg-yellow-400 text-black cursor-default'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed'
                        }`}
                      >
                        {isCurrentWinner ? 'Winner' : 'Select Winner'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

