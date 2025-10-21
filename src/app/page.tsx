import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import CategorySection from '@/components/CategorySection';
import Footer from '@/components/Footer';
import { categorySections, getRecipesByCategory } from '@/data/mockData';

export default function Home() {
  return (
    <main id="top">
      <Header />
      <Hero />
      <AboutSection />

      {categorySections.map((category, index) => (
        <CategorySection
          key={category.id}
          category={category}
          recipes={getRecipesByCategory(category.id)}
          showAd={index === 1} // Show ad after Brunch section
        />
      ))}

      <Footer />

      {/* Simple Log anchor target */}
      <div id="log" className="sr-only" aria-hidden="true"></div>
    </main>
  );
}