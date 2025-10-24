'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const navLinks = [
    { href: '/#top', label: 'Home' },
    { href: '/#breakfast', label: 'Breakfast' },
    { href: '/#brunch', label: 'Brunch' },
    { href: '/#lunch', label: 'Lunch' },
    { href: '/#dinner', label: 'Dinner' },
    { href: '/#quick-meals', label: 'Quick Meals' },
    { href: '/#appetizers', label: 'Appetizers' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-[6px] backdrop-saturate-[1.4] bg-bg/85 border-b border-black/[0.06]">
      <nav className="container-custom" aria-label="Primary">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3.5">
          {/* Brand - Left */}
          <div className="nav-left">
            <Link href="/" className="text-ink no-underline font-extrabold text-[1.35rem] max-sm:text-[1.1rem]">
              ThyCookbook<span className="text-[#ff8a00]">.com</span>
            </Link>
          </div>

          {/* Navigation - Center */}
          <div className="flex items-center justify-center relative">
            {/* Mobile Toggle */}
            <button
              className="hidden max-[880px]:flex absolute right-0 bg-card border border-black/[0.08] px-3 py-2 rounded-[10px] shadow-brand cursor-pointer items-center justify-center text-xl"
              aria-expanded={isMenuOpen}
              aria-controls="navMenu"
              aria-label="Toggle menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>

            {/* Nav Menu */}
            <div
              id="navMenu"
              className={`max-[880px]:absolute max-[880px]:left-1/2 max-[880px]:-translate-x-1/2 max-[880px]:top-full max-[880px]:mt-2 max-[880px]:w-[calc(100vw-2rem)] max-[880px]:max-w-md ${
                isMenuOpen ? 'block' : 'max-[880px]:hidden'
              }`}
            >
              <ul className="list-none flex gap-3.5 m-0 p-0 items-center max-[880px]:flex-col max-[880px]:bg-card max-[880px]:p-4 max-[880px]:rounded-brand max-[880px]:shadow-brand max-[880px]:border max-[880px]:border-black/[0.08]">
                {navLinks.map((link) => (
                  <li key={link.href} className="max-[880px]:w-full">
                    {isHomePage ? (
                      <a
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="no-underline text-ink font-semibold px-2.5 py-2 rounded-[10px] hover:bg-white hover:shadow-brand transition-all block max-[880px]:text-center"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="no-underline text-ink font-semibold px-2.5 py-2 rounded-[10px] hover:bg-white hover:shadow-brand transition-all block max-[880px]:text-center"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* User Menu / Login Button - Right */}
          <div className="flex items-center justify-end">
            {session ? (
              <UserMenu 
                user={{
                  name: session.user?.name,
                  email: session.user?.email,
                  image: session.user?.image,
                }}
              />
            ) : (
              <Link
                href="/login"
                className="inline-block no-underline font-extrabold px-4 py-3 rounded-[10px] bg-[#0fb36a] text-white hover:-translate-y-px transition-transform whitespace-nowrap text-sm sm:text-base max-sm:px-3 max-sm:py-2"
              >
                Log In/SignUp
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}