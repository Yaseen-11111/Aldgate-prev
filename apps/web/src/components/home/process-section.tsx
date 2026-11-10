import { EditableText } from '@/components/inline-editor';

/** Three-step "how it works" summary on the homepage. */
export function ProcessSection() {
  const { data: settings } = useSiteSettings();
  const steps = [1, 2, 3].map(number => ({
    number: String(number).padStart(2, '0'),
    titleKey: `homeStep${number}Title` as 'homeStep1Title' | 'homeStep2Title' | 'homeStep3Title',
    descriptionKey: `homeStep${number}Description` as 'homeStep1Description' | 'homeStep2Description' | 'homeStep3Description',
  }));
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif mb-4"><EditableText field="processHeading" label="homepage process heading" value={settings.processHeading} /></h2>
          <p className="text-foreground/70 font-light"><EditableText field="processDescription" label="homepage process description" value={settings.processDescription} multiline /></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.number} className="group">
              <span className="text-5xl font-serif text-accent/20 mb-4 block group-hover:text-accent transition-colors duration-500">{step.number}</span>
              <h3 className="text-xl font-medium mb-3"><EditableText field={step.titleKey} label={`step ${step.number} heading`} value={settings[step.titleKey]} /></h3>
              <p className="text-foreground/70 font-light leading-relaxed"><EditableText field={step.descriptionKey} label={`step ${step.number} description`} value={settings[step.descriptionKey]} multiline /></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import { useSiteSettings } from '@/hooks/use-site-settings';
