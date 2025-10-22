'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const navLinks = [
    { href: '#top', label: 'Home' },
    { href: '#breakfast', label: 'Breakfast' },
    { href: '#brunch', label: 'Brunch' },
    { href: '#lunch', label: 'Lunch' },
    { href: '#dinner', label: 'Dinner' },
    { href: '#quick-meals', label: 'Quick Meals' },
    { href: '#appetizers', label: 'Appetizers' },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-[6px] backdrop-saturate-[1.4] bg-bg/85 border-b border-black/[0.06]">
      <nav className="container-custom" aria-label="Primary">
        <div className="grid grid-cols-[1fr_auto_1fr] lg:grid-cols-[1fr_auto_1fr] items-center gap-4 py-3.5 max-[880px]:grid-cols-[1fr_auto]">
          {/* Brand */}
          <div className="nav-left">
            <Link href="/" className="text-ink no-underline font-extrabold text-[1.35rem]">
              ThyCookbook<span className="text-[#ff8a00]">.com</span>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="hidden max-[880px]:inline-block justify-self-end bg-card border border-black/[0.08] px-2.5 py-2 rounded-[10px] shadow-brand cursor-pointer"
            aria-expanded={isMenuOpen}
            aria-controls="navMenu"
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>

          {/* Nav Menu */}
          <div
            id="navMenu"
            className={`justify-self-end max-[880px]:col-span-2 max-[880px]:justify-self-stretch ${
              isMenuOpen ? 'block' : 'max-[880px]:hidden'
            }`}
          >
            <ul className="list-none flex gap-3.5 m-0 p-0 items-center max-[880px]:flex-col max-[880px]:bg-card max-[880px]:p-3 max-[880px]:rounded-brand max-[880px]:shadow-brand">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="no-underline text-ink font-semibold px-2.5 py-2 rounded-[10px] hover:bg-white hover:shadow-brand transition-all"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                {session ? (
                  <div className="flex items-center gap-2 max-[880px]:flex-col max-[880px]:w-full">
                    <span className="text-muted text-sm font-semibold">
                      {session.user?.name || session.user?.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="inline-block no-underline font-extrabold px-4 py-3 rounded-[10px] bg-[#e91e63] text-white hover:-translate-y-px transition-transform"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="inline-block no-underline font-extrabold px-4 py-3 rounded-[10px] bg-[#0fb36a] text-white hover:-translate-y-px transition-transform"
                  >
                    Log In/SignUp
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}