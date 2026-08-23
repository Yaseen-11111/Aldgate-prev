const STEPS = [
  {
    number: '01',
    title: 'Curate Your Shortlist',
    description:
      'Browse our collection of materials and styles. Add your inspirations to a quote request without worrying about prices or sizes.',
  },
  {
    number: '02',
    title: 'In-Home Measurement',
    description:
      'Our advisor visits your home, bringing fabric samples. We take exact measurements of every window frame.',
  },
  {
    number: '03',
    title: 'Craft & Install',
    description:
      'Your bespoke shades are crafted to the millimeter, then professionally installed by our team for a flawless finish.',
  },
];

/** Three-step "how it works" summary on the homepage. */
export function ProcessSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">The Aldergate Standard</h2>
          <p className="text-foreground/70 font-light">We believe precision requires presence. That's why we never sell directly online.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {STEPS.map((step) => (
            <div key={step.number} className="group">
              <span className="text-5xl font-serif text-accent/20 mb-4 block group-hover:text-accent transition-colors duration-500">{step.number}</span>
              <h3 className="text-xl font-medium mb-3">{step.title}</h3>
              <p className="text-foreground/70 font-light leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
