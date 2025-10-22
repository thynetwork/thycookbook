'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  checkPasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from '@/lib/passwordStrength';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password strength checking
  const passwordStrength = checkPasswordStrength(password);
  const showConfirmField = passwordStrength.isStrong;

  // Password mismatch checking
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  useEffect(() => {
    if (confirmPassword.length > 0) {
      setPasswordMismatch(password !== confirmPassword);
    } else {
      setPasswordMismatch(false);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validate password strength
    if (!passwordStrength.isStrong) {
      setError('Please create a stronger password');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Something went wrong');
        return;
      }

      // Redirect to login page on success
      router.push('/login?signup=success');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-ink no-underline font-extrabold text-[2rem]">
            ThyCookbook<span className="text-[#ff8a00]">.com</span>
          </Link>
          <h2 className="mt-6 text-[2rem] font-extrabold text-ink">Create Account</h2>
          <p className="mt-2 text-muted">Join our community of food lovers</p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-brand shadow-brand border border-black/[0.06] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-[#e91e63]/10 border border-[#e91e63] text-[#e91e63] px-4 py-3 rounded-[10px]">
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-ink mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                placeholder="John Doe"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ink mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ink mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-black/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${(passwordStrength.score / 4) * 100}%`,
                          backgroundColor: getPasswordStrengthColor(passwordStrength.score),
                        }}
                      />
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: getPasswordStrengthColor(passwordStrength.score) }}
                    >
                      {getPasswordStrengthLabel(passwordStrength.score)}
                    </span>
                  </div>

                  {/* Password Requirements */}
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-muted space-y-1 mt-2">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-[#e91e63] mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Field - Only shown if password is strong */}
            {showConfirmField && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-ink mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-[10px] focus:outline-none focus:ring-2 transition-all ${
                      passwordMismatch
                        ? 'border-[#e91e63] focus:ring-[#e91e63]/25 focus:border-[#e91e63]'
                        : 'border-black/[0.12] focus:ring-[#0fb36a]/25 focus:border-[#0fb36a]'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Mismatch Warning */}
                {passwordMismatch && confirmPassword.length > 0 && (
                  <p className="mt-2 text-sm text-[#e91e63] font-semibold">
                    ⚠ Passwords do not match
                  </p>
                )}

                {/* Password Match Success */}
                {!passwordMismatch && confirmPassword.length > 0 && password === confirmPassword && (
                  <p className="mt-2 text-sm text-[#0fb36a] font-semibold flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Passwords match!
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !passwordStrength.isStrong || passwordMismatch}
              className="w-full bg-[#0fb36a] text-white font-extrabold py-3 px-4 rounded-[12px] hover:-translate-y-px hover:shadow-brand transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/[0.06]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted">Already have an account?</span>
              </div>
            </div>

            {/* Sign In Link */}
            <Link
              href="/login"
              className="block w-full text-center bg-transparent text-[#0fb36a] font-extrabold py-3 px-4 rounded-[12px] border-2 border-[#0fb36a] hover:-translate-y-px hover:shadow-brand transition-all no-underline"
            >
              Sign In
            </Link>
          </form>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-[#3f51b5] font-semibold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
