import Link from 'next/link';
import AdSpace from './AdSpace';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#0a0a0a] to-[#000] text-gray-300 mt-auto border-t border-white/5">
      {/* AD SLOT #3: Footer Banner */}
      <div className="container-custom py-8 max-sm:py-6">
        <AdSpace location="FOOTER_BANNER" />
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-12 max-sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-sm:gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link 
              href="/" 
              className="inline-block text-white no-underline font-extrabold text-2xl mb-3 hover:opacity-80 transition-opacity"
            >
              ThyCookbook<span className="text-[#0fb36a]">.com</span>
            </Link>
            <p className="text-[#0fb36a] font-semibold mb-4 text-lg">
              One World, Many Flavors.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover authentic recipes from around the globe. Join our community of food lovers sharing their cultural heritage through cooking.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a 
                  href="#top" 
                  className="text-gray-400 hover:text-[#0fb36a] transition-colors text-sm no-underline inline-block"
                >
                  Home
                </a>
              </li>
              <li>
                <Link 
                  href="/profile" 
                  className="text-gray-400 hover:text-[#0fb36a] transition-colors text-sm no-underline inline-block"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link 
                  href="/profile/recipes/new" 
                  className="text-gray-400 hover:text-[#0fb36a] transition-colors text-sm no-underline inline-block"
                >
                  Share Recipe
                </Link>
              </li>
              <li>
                <a 
                  href="thycook.html" 
                  className="text-gray-400 hover:text-[#0fb36a] transition-colors text-sm no-underline inline-block"
                >
                  ThyCook.com
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link 
                  href="/category/breakfast" 
                  className="text-gray-400 hover:text-[#0fb36a] transition-colors text-sm no-underline inline-block"
                >
                  🌅 Breakfast
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/lunch" 
                  className="text-gray-400 hover:text-[#0fb36a] transition-colors text-sm no-underline inline-block"
                >
                  🍱 Lunch
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/dinner" 
                  className="text-gray-400 hover:text-[#0fb36a] transition-colors text-sm no-underline inline-block"
                >
                  🍽️ Dinner
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/quick-meals" 
                  className="text-gray-400 hover:text-[#0fb36a] transition-colors text-sm no-underline inline-block"
                >
                  ⚡ Quick Meals
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Connect With Us
            </h3>
            <div className="flex flex-wrap gap-3 mb-6">
              <a 
                href="#" 
                aria-label="YouTube"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#0fb36a] text-gray-400 hover:text-white transition-all duration-300 no-underline"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a 
                href="#" 
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#0fb36a] text-gray-400 hover:text-white transition-all duration-300 no-underline"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="#" 
                aria-label="X (Twitter)"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#0fb36a] text-gray-400 hover:text-white transition-all duration-300 no-underline"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="#" 
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#0fb36a] text-gray-400 hover:text-white transition-all duration-300 no-underline"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
            <div className="space-y-2.5">
              <a 
                href="#" 
                className="text-gray-400 hover:text-[#0fb36a] transition-colors text-sm no-underline inline-block"
              >
                Terms of Service
              </a>
              <br />
              <a 
                href="#" 
                className="text-gray-400 hover:text-[#0fb36a] transition-colors text-sm no-underline inline-block"
              >
                Privacy Policy
              </a>
              <br />
              <a 
                href="#" 
                className="text-gray-400 hover:text-[#0fb36a] transition-colors text-sm no-underline inline-block"
              >
                Contact Us
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container-custom py-6 max-sm:py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p className="m-0 text-center md:text-left">
              © {currentYear} ThyCookbook.com. All rights reserved.
            </p>
            <p className="m-0 text-center md:text-right">
              Made with <span className="text-red-500">❤️</span> for food lovers worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}