'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: '#fff',
          color: '#333',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          fontSize: '14px',
          fontWeight: '500',
        },
        // Success toast
        success: {
          duration: 3000,
          style: {
            background: '#0fb36a',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#0fb36a',
          },
        },
        // Error toast
        error: {
          duration: 4000,
          style: {
            background: '#e91e63',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#e91e63',
          },
        },
        // Loading toast
        loading: {
          style: {
            background: '#3f51b5',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#3f51b5',
          },
        },
      }}
    />
  );
}
