import VideoCard from './VideoCard';
import AdSpace from './AdSpace';

interface Category {
  id: string;
  slug: string;
  title: string;
  description: string;
  linkText: string;
}

interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  videoUrl: string | null;
  videoEmbedId: string | null;
  user: {
    name: string | null;
    username: string | null;
  };
}

interface CategorySectionProps {
  category: Category;
  recipes: Recipe[];
  showAd?: boolean;
}

export default function CategorySection({ category, recipes, showAd = false }: CategorySectionProps) {
  return (
    <>
      <section id={category.id} className="container-custom py-[46px] border-t border-dashed border-black/[0.06] max-sm:py-8">
        <div className="mb-3">
          <h2 className="m-0 mb-3 text-[clamp(1.4rem,2.2vw,2.2rem)] font-bold">{category.title}</h2>
        </div>

        <div className="grid gap-4">
          {/* Video Grid - Two side-by-side videos on desktop, single column on mobile */}
          <div className="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
            {recipes.map((recipe) => (
              <VideoCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {/* Section Footer */}
          <div className="grid gap-1.5">
            <p className="m-0 text-sm sm:text-base">{category.description}</p>
            <a
              href={`/category/${category.slug}`}
              className="text-accent-3 font-bold no-underline hover:underline text-sm sm:text-base inline-flex items-center gap-1"
            >
              {category.linkText}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2.5} 
                stroke="currentColor" 
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Ad Section - Between Brunch and Lunch */}
      {showAd && (
        <div className="container-custom my-8 max-sm:my-4">
          <AdSpace location="INLINE_BANNER" />
        </div>
      )}
    </>
  );
}