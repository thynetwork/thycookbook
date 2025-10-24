'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  checkPasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from '@/lib/passwordStrength';

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // Password strength checking
  const passwordStrength = checkPasswordStrength(newPassword);

  useEffect(() => {
    if (confirmNewPassword.length > 0) {
      setPasswordMismatch(newPassword !== confirmNewPassword);
    } else {
      setPasswordMismatch(false);
    }
  }, [newPassword, confirmNewPassword]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please log in to edit your profile');
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchUserProfile();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setName(data.name || '');
        setEmail(data.email || '');
        setUsername(data.username || '');
        setBio(data.bio || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Updating profile...');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          username: username.trim() || null,
          bio: bio.trim() || null,
        }),
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (!response.ok) {
        toast.error(data.message || 'Failed to update profile');
        return;
      }

      // Update session with new name
      await update({
        ...session,
        user: {
          ...session?.user,
          name: name.trim(),
          email: email.trim(),
        },
      });

      toast.success('Profile updated successfully! ✓');
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error updating profile:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!passwordStrength.isStrong) {
      toast.error('Please create a stronger password');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsChangingPassword(true);
    const loadingToast = toast.loading('Updating password...');

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (!response.ok) {
        toast.error(data.message || 'Failed to update password');
        return;
      }

      toast.success('Password updated successfully! ✓');
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error updating password:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitial = () => {
    if (name) return name.charAt(0).toUpperCase();
    if (session?.user?.name) return session.user.name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  if (status === 'loading' || isFetching) {
    return (
      <main className="flex flex-col min-h-screen">
        <Header />
        <Loading text="Loading profile..." />
        <Footer />
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 bg-gradient-to-b from-[#0fb36a]/5 to-transparent py-12 max-sm:py-6">
        <div className="container-custom max-w-2xl">
          {/* Back Button */}
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 mb-6 text-ink font-semibold px-4 py-2.5 rounded-[10px] bg-card border border-black/[0.08] hover:bg-white hover:shadow-brand transition-all group no-underline max-sm:mb-4 max-sm:text-sm"
          >
            <svg 
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform max-sm:w-4 max-sm:h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>

          {/* Page Header */}
          <div className="text-center mb-8 max-sm:mb-6">
            <h1 className="text-3xl font-bold text-ink mb-2 max-sm:text-2xl">Edit Profile</h1>
            <p className="text-muted max-sm:text-sm">Update your personal information</p>
          </div>

          {/* Edit Form Card */}
          <div className="bg-card rounded-brand shadow-brand border border-black/[0.06] p-8 max-sm:p-5">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0fb36a] to-[#0a8c52] text-white font-bold text-4xl flex items-center justify-center border-4 border-white shadow-lg mb-4">
                {getInitial()}
              </div>
              <p className="text-sm text-muted">Profile Picture</p>
              <button
                type="button"
                onClick={() => toast('Image upload coming soon! 🚀', { icon: '📸' })}
                className="mt-2 text-sm text-[#0fb36a] hover:underline font-semibold"
              >
                Change Picture
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 max-sm:space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-ink mb-2">
                  Full Name <span className="text-[#e91e63]">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all max-sm:text-sm"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-ink mb-2">
                  Email Address <span className="text-[#e91e63]">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                  placeholder="your@email.com"
                  required
                />
                <p className="mt-1 text-xs text-muted">
                  ⚠️ Changing your email may require verification
                </p>
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-ink mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                  placeholder="username"
                  maxLength={30}
                />
                <p className="mt-1 text-xs text-muted">
                  Optional: Unique username for your profile URL
                </p>
              </div>

              {/* Bio Field */}
              <div>
                <label htmlFor="bio" className="block text-sm font-semibold text-ink mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all resize-vertical"
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={500}
                />
                <p className="mt-1 text-xs text-muted text-right">
                  {bio.length}/500 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 max-sm:flex-col max-sm:gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-[#0fb36a] text-white font-bold rounded-[10px] hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 max-sm:text-sm"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <Link
                  href="/profile"
                  className="flex-1 px-6 py-3 bg-bg hover:bg-white border border-black/[0.08] text-ink font-semibold rounded-[10px] hover:shadow-brand transition-all text-center no-underline max-sm:text-sm"
                >
                  Cancel
                </Link>
              </div>
            </form>

            {/* Password Change Section */}
            <div className="mt-8 pt-8 border-t border-black/[0.06] max-sm:mt-6 max-sm:pt-6">
              <h3 className="text-lg font-bold text-ink mb-6 max-sm:text-base max-sm:mb-4">Change Password</h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-6 max-sm:space-y-4">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-semibold text-ink mb-2">
                    Current Password <span className="text-[#e91e63]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                    >
                      {showCurrentPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-ink mb-2">
                    New Password <span className="text-[#e91e63]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                    >
                      {showNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-muted">Password Strength</span>
                        <span
                          className="text-xs font-bold"
                          style={{ color: getPasswordStrengthColor(passwordStrength.score) }}
                        >
                          {getPasswordStrengthLabel(passwordStrength.score)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${(passwordStrength.score / 4) * 100}%`,
                            backgroundColor: getPasswordStrengthColor(passwordStrength.score),
                          }}
                        ></div>
                      </div>
                      {!passwordStrength.isStrong && (
                        <div className="mt-2 space-y-1">
                          {passwordStrength.feedback.map((feedback, index) => (
                            <p key={index} className="text-xs text-muted flex items-start gap-1">
                              <span className="text-[#e91e63] mt-0.5">•</span>
                              {feedback}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                {passwordStrength.isStrong && (
                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-semibold text-ink mb-2">
                      Confirm New Password <span className="text-[#e91e63]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirmNewPassword"
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                      >
                        {showConfirmNewPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Password Mismatch Warning */}
                    {passwordMismatch && confirmNewPassword.length > 0 && (
                      <p className="mt-2 text-sm text-[#e91e63] font-semibold flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        Passwords do not match
                      </p>
                    )}

                    {/* Password Match Success */}
                    {!passwordMismatch && confirmNewPassword.length > 0 && newPassword === confirmNewPassword && (
                      <p className="mt-2 text-sm text-[#0fb36a] font-semibold flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        Passwords match!
                      </p>
                    )}
                  </div>
                )}

                {/* Update Password Button */}
                <button
                  type="submit"
                  disabled={isChangingPassword || !passwordStrength.isStrong || passwordMismatch || !currentPassword}
                  className="w-full px-6 py-3 bg-[#3f51b5] text-white font-bold rounded-[10px] hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 max-sm:text-sm"
                >
                  {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="mt-8 pt-8 border-t border-black/[0.06] max-sm:mt-6 max-sm:pt-6">
              <h3 className="text-sm font-bold text-[#e91e63] mb-4 max-sm:text-xs">Danger Zone</h3>
              <div className="flex items-center justify-between p-4 bg-[#e91e63]/5 rounded-[10px] border border-[#e91e63]/20 max-sm:flex-col max-sm:items-start max-sm:gap-3 max-sm:p-3">
                <div>
                  <p className="font-semibold text-ink text-sm max-sm:text-xs">Delete Account</p>
                  <p className="text-xs text-muted max-sm:text-[10px]">Permanently delete your account and all data</p>
                </div>
                <button
                  type="button"
                  onClick={() => toast('Account deletion coming soon', { icon: '⚠️' })}
                  className="px-4 py-2 bg-[#e91e63] text-white font-semibold text-sm rounded-[10px] hover:-translate-y-px transition-all max-sm:w-full max-sm:text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
