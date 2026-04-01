'use client';

import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, FileText, Send, CheckCircle } from 'lucide-react';

interface Event {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxAttendees: string;
  organizerName: string;
  organizerEmail: string;
  category: string;
}

export default function CreateEventPage() {
  const [event, setEvent] = useState<Event>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: '',
    organizerName: '',
    organizerEmail: '',
    category: 'conference'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...event,
        id: 'event_' + Date.now(),
        attendees: 0,
        status: 'upcoming' as const,
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEvent({
      ...event,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Created Successfully!</h2>
          <p className="text-gray-600 mb-6">Your event "{event.title}" has been submitted and will be reviewed.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setEvent({
                title: '',
                description: '',
                date: '',
                time: '',
                location: '',
                maxAttendees: '',
                organizerName: '',
                organizerEmail: '',
                category: 'conference'
              });
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Another Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Event</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your event with the community. Fill in the details below to get started.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Event Details */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-blue-600" />
                Event Details
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={event.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your event title"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={event.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your event in detail..."
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={event.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="meetup">Meetup</option>
                    <option value="webinar">Webinar</option>
                    <option value="social">Social</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-blue-600" />
                Date & Time
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={event.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={event.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Location & Capacity */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="h-6 w-6 mr-2 text-blue-600" />
                Location & Capacity
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={event.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Event venue or address"
                  />
                </div>

                <div>
                  <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Attendees
                  </label>
                  <input
                    type="number"
                    id="maxAttendees"
                    name="maxAttendees"
                    value={event.maxAttendees}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>
            </div>

            {/* Organizer Information */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                Organizer Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="organizerName" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="organizerName"
                    name="organizerName"
                    value={event.organizerName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="organizerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="organizerEmail"
                    name="organizerEmail"
                    value={event.organizerEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                {loading ? 'Creating Event...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
