import toast from 'react-hot-toast';

/**
 * Centralized toast notification utilities
 * Use these functions for consistent toast messages across the app
 */

export const showToast = {
  // Success messages
  success: (message: string) => toast.success(message),
  
  // Error messages
  error: (message: string) => toast.error(message),
  
  // Loading messages (returns toast ID for dismissal)
  loading: (message: string) => toast.loading(message),
  
  // Dismiss a specific toast
  dismiss: (toastId: string) => toast.dismiss(toastId),
  
  // Authentication toasts
  auth: {
    loginSuccess: () => toast.success('Welcome back! 👋'),
    loginError: () => toast.error('Invalid email or password'),
    signupSuccess: () => toast.success('Account created successfully! 🎉'),
    signupError: (message?: string) => toast.error(message || 'Failed to create account'),
    logoutSuccess: () => toast.success('Logged out successfully'),
    unauthorized: () => toast.error('Please log in to continue'),
  },
  
  // Recipe interaction toasts
  recipe: {
    liked: () => toast.success('Recipe liked! ❤️'),
    unliked: () => toast.success('Recipe unliked'),
    saved: () => toast.success('Recipe saved to your collection! 📚'),
    unsaved: () => toast.success('Recipe removed from collection'),
    commentAdded: () => toast.success('Comment added! 💬'),
    commentDeleted: () => toast.success('Comment deleted'),
    viewsUpdated: () => toast.success('Thank you for watching! 👀'),
  },
  
  // General action toasts
  action: {
    updateSuccess: () => toast.success('Updated successfully! ✓'),
    updateError: () => toast.error('Failed to update'),
    deleteSuccess: () => toast.success('Deleted successfully'),
    deleteError: () => toast.error('Failed to delete'),
    copySuccess: () => toast.success('Copied to clipboard! 📋'),
    saveSuccess: () => toast.success('Saved successfully! ✓'),
    saveError: () => toast.error('Failed to save'),
  },
  
  // Network/API toasts
  network: {
    offline: () => toast.error('No internet connection'),
    timeout: () => toast.error('Request timed out. Please try again.'),
    serverError: () => toast.error('Server error. Please try again later.'),
    unknownError: () => toast.error('Something went wrong. Please try again.'),
  },
};

// Custom toast with duration
export const showCustomToast = (
  message: string,
  type: 'success' | 'error' | 'loading' = 'success',
  duration = 4000
) => {
  return toast[type](message, { duration });
};
