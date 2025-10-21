import VideoCard from './VideoCard';
import { Recipe, CategorySection as CategorySectionType } from '@/data/mockData';

interface CategorySectionProps {
  category: CategorySectionType;
  recipes: Recipe[];
  showAd?: boolean;
}

export default function CategorySection({ category, recipes, showAd = false }: CategorySectionProps) {
  return (
    <>
      <section id={category.id} className="container-custom py-[46px] border-t border-dashed border-black/[0.06]">
        <div className="mb-3">
          <h2 className="m-0 mb-3 text-[clamp(1.6rem,2.2vw,2.2rem)] font-bold">{category.title}</h2>
        </div>

        <div className="grid gap-4">
          {/* Video Grid - Two side-by-side videos */}
          <div className="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
            {recipes.map((recipe) => (
              <VideoCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {/* Section Footer */}
          <div className="grid gap-1.5">
            <p className="m-0">{category.description}</p>
            <a
              href={`#${category.id}`}
              className="text-accent-3 font-bold no-underline hover:underline"
            >
              {category.linkText}
            </a>
          </div>
        </div>
      </section>

      {/* Ad Section - Between Brunch and Lunch */}
      {showAd && (
        <section className="container-custom p-0" aria-label="Sponsored">
          <div className="my-6 border-2 border-dashed border-black/[0.12] bg-white rounded-[12px] shadow-[0_6px_20px_rgba(0,0,0,0.05)] grid place-items-center min-h-[120px]">
            <div className="font-extrabold text-[#777] p-[18px] text-center">
              Ad Space — 728×90 / 970×90
            </div>
          </div>
        </section>
      )}
    </>
  );
}