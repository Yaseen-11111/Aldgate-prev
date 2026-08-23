import { HeroSection } from '@/components/home/hero-section';
import { ProcessSection } from '@/components/home/process-section';
import { CategoriesSection } from '@/components/home/categories-section';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <ProcessSection />
      <CategoriesSection />
    </div>
  );
}
