import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  dismiss: () => toast.dismiss(),
  
  // Auth related toasts
  loginRequired: () => toast.error('Please login first to access this feature'),
  loginSuccess: () => toast.success('Login successful!'),
  logoutSuccess: () => toast.success('Logged out successfully'),
  
  // Premium feature toasts
  premiumRequired: () => toast.error('This feature requires a premium subscription'),
  premiumSuccess: () => toast.success('Premium subscription activated!'),
  paymentProcessing: () => toast.loading('Processing payment...'),
  paymentSuccess: () => toast.success('Payment successful!'),
  paymentFailed: () => toast.error('Payment failed. Please try again.'),
  
  // Event related toasts
  eventCreated: () => toast.success('Event created successfully!'),
  eventUpdated: () => toast.success('Event updated successfully!'),
  eventDeleted: () => toast.success('Event deleted successfully!'),
  eventJoinSuccess: () => toast.success('Successfully joined the event!'),
  eventLeaveSuccess: () => toast.success('Successfully left the event'),
  
  // General action toasts
  saved: () => toast.success('Changes saved successfully!'),
  deleted: () => toast.success('Item deleted successfully!'),
  copied: () => toast.success('Copied to clipboard!'),
  networkError: () => toast.error('Network error. Please check your connection.'),
  genericError: (error?: string) => toast.error(error || 'Something went wrong. Please try again.'),
};
