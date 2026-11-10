import { useSiteSettings } from '@/hooks/use-site-settings';
import { EditableText } from '@/components/inline-editor';

/** Intro copy above the scroll-driven sequence. */
export function ProcessHero() {
  const { data: settings } = useSiteSettings();
  return (
    <div className="container mx-auto px-4 md:px-6 pt-16 pb-12 md:pt-24 md:pb-20 text-center max-w-3xl">
      <span className="text-xs uppercase tracking-[0.2em] text-accent font-medium">How It Works</span>
      <h1 className="text-4xl md:text-6xl font-serif mt-4 mb-6"><EditableText field="processPageHeading" label="process page heading" value={settings.processPageHeading} /></h1>
      <p className="text-lg font-light text-foreground/70 leading-relaxed">
        <EditableText field="processPageDescription" label="process page introduction" value={settings.processPageDescription} multiline />
      </p>
    </div>
  );
}
