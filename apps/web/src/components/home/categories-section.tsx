import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import rollerImage from '@assets/generated_images/roller-blinds.jpg';
import venetianImage from '@assets/generated_images/venetian-blinds.jpg';
import romanImage from '@assets/generated_images/roman-blinds.jpg';
import shutterImage from '@assets/generated_images/shutters.jpg';

const CATEGORIES = [
  { slug: 'roller', label: 'Roller Blinds', image: rollerImage },
  { slug: 'venetian', label: 'Venetian Blinds', image: venetianImage },
  { slug: 'roman', label: 'Roman Blinds', image: romanImage },
  { slug: 'shutter', label: 'Plantation Shutters', image: shutterImage },
];

/** Homepage category tiles linking into the filtered catalog. */
export function CategoriesSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl md:text-5xl font-serif">Categories</h2>
          <Link href="/catalog" className="hidden md:flex items-center gap-2 text-sm font-medium tracking-wide hover:text-accent transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/catalog?category=${category.slug}`}
              className="group relative h-[60vh] overflow-hidden bg-muted flex items-end"
            >
              <img src={category.image} alt={category.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="relative z-10 p-8 md:p-12 w-full flex justify-between items-center">
                <h3 className="text-3xl font-serif text-white">{category.label}</h3>
                <span className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white backdrop-blur-sm group-hover:bg-white group-hover:text-primary transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-medium tracking-wide hover:text-accent transition-colors">
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
