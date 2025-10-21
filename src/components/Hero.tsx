export default function Hero() {
  return (
    <section className="container-custom">
      <div className="grid grid-cols-[1.2fr_0.8fr] gap-8 py-[46px] pb-[30px] max-[760px]:grid-cols-1">
        {/* Hero Content */}
        <div className="hero-content">
          <h1 className="text-[clamp(2rem,3.6vw,3.2rem)] leading-[1.08] m-0 mb-3 tracking-[-0.5px]">
            A Celebration of World Cuisine
          </h1>
          <p className="text-muted max-w-[60ch]">
            Welcome to <strong>ThyCookbook</strong> — where the world comes together one plate at a time.
            Explore recipes, stories, and videos from food creators across the globe.
          </p>
          <div className="flex gap-3 mt-[18px] flex-wrap">
            <a
              href="#breakfast"
              className="inline-block no-underline font-extrabold px-4 py-3 rounded-[12px] border-2 border-transparent bg-[#0fb36a] text-white hover:-translate-y-px hover:shadow-brand transition-all"
            >
              Explore Sections
            </a>
            <a
              href="#about"
              className="inline-block no-underline font-extrabold px-4 py-3 rounded-[12px] border-2 border-[#0fb36a] text-[#0fb36a] bg-transparent hover:-translate-y-px hover:shadow-brand transition-all"
            >
              What is ThyCookbook?
            </a>
          </div>
        </div>

        {/* Hero Mosaic */}
        <div className="grid grid-cols-4 gap-2.5" aria-hidden="true">
          <div className="aspect-square rounded-brand bg-gradient-to-br from-accent to-accent-2 shadow-brand"></div>
          <div className="aspect-square rounded-brand bg-gradient-to-br from-brand to-accent shadow-brand"></div>
          <div className="aspect-square rounded-brand bg-gradient-to-br from-accent-3 to-accent-2 shadow-brand"></div>
          <div className="aspect-square rounded-brand bg-gradient-to-br from-accent to-accent-2 shadow-brand"></div>
          <div className="aspect-square rounded-brand bg-gradient-to-br from-brand to-accent shadow-brand"></div>
          <div className="aspect-square rounded-brand bg-gradient-to-br from-accent-3 to-accent-2 shadow-brand"></div>
          <div className="aspect-square rounded-brand bg-gradient-to-br from-accent to-accent-2 shadow-brand"></div>
          <div className="aspect-square rounded-brand bg-gradient-to-br from-brand to-accent shadow-brand"></div>
        </div>
      </div>
    </section>
  );
}