'use client';

import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get first letter for avatar
  const getInitial = () => {
    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSavedRecipesClick = () => {
    setIsOpen(false);
    
    // If already on profile page, trigger tab change via custom event
    if (pathname === '/profile') {
      window.dispatchEvent(new CustomEvent('changeSavedTab'));
    } else {
      // Navigate to profile page with saved tab
      router.push('/profile?tab=saved');
    }
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    const loadingToast = toast.loading('Signing out...');
    
    try {
      await signOut({ callbackUrl: '/' });
      toast.dismiss(loadingToast);
      toast.success('Logged out successfully! 👋');
    } catch {
      toast.dismiss(loadingToast);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#0fb36a] to-[#0a8c52] text-white font-bold text-lg hover:shadow-lg hover:scale-105 transition-all cursor-pointer border-2 border-white/20"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {getInitial()}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-brand shadow-[0_8px_16px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden z-50 animate-slideDown">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-black/[0.06] bg-bg">
            <p className="text-sm font-semibold text-ink truncate">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-muted truncate">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2 bg-white">
            {/* Profile Link */}
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/profile');
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-ink hover:bg-bg transition-colors flex items-center gap-2"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
              My Profile
            </button>

            {/* Saved Recipes */}
            <button
              onClick={handleSavedRecipesClick}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-ink hover:bg-bg transition-colors flex items-center gap-2"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                />
              </svg>
              Saved Recipes
            </button>

            {/* Divider */}
            <div className="border-t border-black/[0.06] my-2"></div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#e91e63] hover:bg-[#e91e63]/5 transition-colors flex items-center gap-2"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
