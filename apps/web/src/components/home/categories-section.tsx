import { useSiteSettings, type SiteSettings } from '@/hooks/use-site-settings';
import { EditableText } from '@/components/inline-editor';
import { InlineRecordEditor } from '@/components/inline-record-editor';
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
  const { data: settings } = useSiteSettings();
  const categories = CATEGORIES.map(category => {
    const prefix = `category${category.slug[0].toUpperCase()}${category.slug.slice(1)}`;
    const labelKey = `${prefix}Label` as keyof SiteSettings;
    const imageKey = `${prefix}Image` as keyof SiteSettings;
    return { ...category, labelKey, imageKey, label: settings[labelKey], image: settings[imageKey] || category.image };
  });
  return (
    <section className="py-24 pt-0">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end gap-4 mb-16">
          <h2 className="min-w-0 text-4xl md:text-5xl font-serif"><EditableText field="categoriesHeading" label="categories heading" value={settings.categoriesHeading} /></h2>
          <Link href="/about" className="inline-flex items-center gap-2 text-sm font-medium tracking-wide hover:text-accent transition-colors">
            Explore the process <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/catalog" className="hidden md:flex items-center gap-2 text-sm font-medium tracking-wide hover:text-accent transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <div key={category.slug} className="relative"><Link
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
            </Link><div className="absolute top-4 right-4 z-20"><InlineRecordEditor label={`${category.label} category card`} endpoint="/api/admin/site-settings" fields={[{ key: category.labelKey, label: 'Card title', value: category.label }, { key: category.imageKey, label: 'Card image', value: category.image, image: true }]} /></div></div>
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
