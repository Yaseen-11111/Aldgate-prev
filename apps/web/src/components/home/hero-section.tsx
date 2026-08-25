import { Link } from 'wouter';
import rollerImage from '@assets/generated_images/roller-blinds.jpg';
import { useSiteSettings } from '@/hooks/use-site-settings';

/** Full-bleed homepage hero with the two primary calls to action. */
export function HeroSection() {
  const { data: settings } = useSiteSettings();
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={rollerImage}
          alt="Premium Pure Shade Blinds"
          className="w-full h-full object-cover object-center opacity-40 mix-blend-multiply"
        />
        <div
            className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
      </div>

      <div
          className="container mx-auto px-4 md:px-6 relative z-10 pt-20">
        <div
            className="max-w-3xl">
          <h1
              className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {settings.heroTitle}
          </h1>
          <p
              className="text-lg md:text-xl font-light text-foreground/80 mb-10 max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            {settings.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link
                href="/catalog"
                className="inline-flex items-center justify-center h-14 px-8
                bg-primary text-primary-foreground hover:bg-primary/90 transition-colors tracking-wide font-medium">
              {settings.heroPrimaryLabel}
            </Link>
            <Link
                href="/checkout"
                className="inline-flex items-center justify-center h-14 px-8
                bg-[#B46A3C] hover:bg-[#9E5B32] text-white border border-[#B46A3C] transition-colors tracking-wide font-medium"
            >
              {settings.heroBookingLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
