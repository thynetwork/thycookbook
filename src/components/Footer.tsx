import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#111] text-[#ddd] mt-10 py-[26px]">
      {/* AD SLOT #3: Footer */}
      <div
        className="container-custom mb-4 border-2 border-dashed border-white/[0.12] bg-[#222] rounded-[12px] shadow-[0_6px_20px_rgba(0,0,0,0.3)] grid place-items-center min-h-[120px]"
        aria-label="Sponsored"
      >
        <div className="font-extrabold text-[#999] p-[18px] text-center">
          Ad Space — 970×250 / 728×90
        </div>
      </div>

      <div className="container-custom grid grid-cols-[1.2fr_1fr_1fr] gap-[18px] items-start max-[760px]:grid-cols-1">
        {/* Brand */}
        <div className="foot-brand">
          <Link href="/" className="text-white no-underline font-extrabold text-[1.35rem]">
            ThyCookbook<span className="text-[#ff8a00]">.com</span>
          </Link>
          <p className="text-[#9adbbf] mt-2 mb-0">One World, Many Flavors.</p>
        </div>

        {/* Links */}
        <div className="flex gap-3.5 flex-wrap">
          <a href="#top" className="text-[#eee] no-underline font-semibold hover:text-white hover:underline">
            Home
          </a>
          <a href="thycook.html" className="text-[#eee] no-underline font-semibold hover:text-white hover:underline">
            ThyCook.com
          </a>
          <a href="#" className="text-[#eee] no-underline font-semibold hover:text-white hover:underline">
            Terms
          </a>
          <a href="#" className="text-[#eee] no-underline font-semibold hover:text-white hover:underline">
            Privacy
          </a>
          <a href="#" className="text-[#eee] no-underline font-semibold hover:text-white hover:underline">
            Contact
          </a>
        </div>

        {/* Social */}
        <div className="flex gap-3.5 flex-wrap">
          <a href="#" aria-label="YouTube" className="text-[#eee] no-underline font-semibold hover:text-white hover:underline">
            YouTube
          </a>
          <a href="#" aria-label="Instagram" className="text-[#eee] no-underline font-semibold hover:text-white hover:underline">
            Instagram
          </a>
          <a href="#" aria-label="X" className="text-[#eee] no-underline font-semibold hover:text-white hover:underline">
            X
          </a>
        </div>
      </div>
    </footer>
  );
}