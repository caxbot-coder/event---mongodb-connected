'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Calendar, MapPin, Clock, Users, DollarSign, Tag, FileText, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { readResponseJson } from '@/lib/read-response-json';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  maxAttendees: number;
  category: string;
  isPremium: boolean;
  imageUrl: string;
}

export default function CreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: 0,
    maxAttendees: 50,
    category: 'technology',
    isPremium: true,
    imageUrl: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'networking', label: 'Networking' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll create a local preview URL
      // In production, you'd upload to a service like Cloudinary, AWS S3, etc.
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('You need to sign in to create events.');
      return;
    }

    // Check if user is premium (check both variations)
    const isPremium = user?.user_metadata?.isPremium || user?.user_metadata?.is_premium || false;
    
    if (!isPremium) {
      alert('You need a premium membership to create events. Upgrade to premium to start creating events!');
      return;
    }

    setLoading(true);

    try {
      // Prepare event data
      const eventData = {
        ...formData,
        organizerName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        organizerId: user.id // Add the owner's user ID
      };

      // Call the API to create the event
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const result = await readResponseJson<{ success?: boolean; error?: string }>(response);

      if (response.ok && result.success) {
        alert('Event submitted for approval! It will be visible once approved by an admin.');
        router.push('/events');
      } else {
        throw new Error(result.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error instanceof Error ? error.message : 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is premium (check both variations)
  const isPremium = user?.user_metadata?.isPremium || user?.user_metadata?.is_premium || false;

  if (!user) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-blue-900/50 border border-blue-600/50 rounded-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-blue-200 mb-4">Sign In Required</h2>
            <p className="text-blue-300 mb-6">
              You need to sign in to create events.
            </p>
            <button
              onClick={() => router.push('/#pricing')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In to Create Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-900/50 border border-yellow-600/50 rounded-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-yellow-200 mb-4">Premium Required</h2>
            <p className="text-yellow-300 mb-6">
              You need a premium membership to create events.
            </p>
            <button
              onClick={() => router.push('/#pricing')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-26 pb-16">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create New Event</h1>
            <p className="text-gray-300">Fill in the details below to create your premium event</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <FileText className="h-4 w-4 mr-2" />
                Event Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <FileText className="h-4 w-4 mr-2" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your event"
              />
            </div>

            {/* Event Image */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <ImageIcon className="h-4 w-4 mr-2" />
                Event Image (16:9 ratio recommended)
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4">
                  <div className="relative w-full h-0 pb-[56.25%] rounded-lg overflow-hidden bg-gray-800">
                    <img 
                      src={imagePreview} 
                      alt="Event preview" 
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData(prev => ({ ...prev, imageUrl: '' }));
                    }}
                    className="mt-2 text-sm text-red-400 hover:text-red-300"
                  >
                    Remove image
                  </button>
                </div>
              )}
              
              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="imageUpload"
                  className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors bg-gray-800/50"
                >
                  <Upload className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-gray-300">
                    {imagePreview ? 'Change image' : 'Upload event image'}
                  </span>
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Recommended: 1920x1080px (16:9 ratio). Max size: 5MB.
              </p>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Event location"
              />
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <Tag className="h-4 w-4 mr-2" />
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price and Max Attendees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <Users className="h-4 w-4 mr-2" />
                  Max Attendees
                </label>
                <input
                  type="number"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="50"
                />
              </div>
            </div>

            {/* Premium Event Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPremium"
                id="isPremium"
                checked={formData.isPremium}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPremium" className="ml-2 text-sm text-gray-400">
                This is a premium event (only premium members can join)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => router.push('/events')}
                className="flex items-center px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
