import { useQuery } from '@tanstack/react-query';

export type SiteSettings = { phoneDisplay: string; whatsAppNumber: string; instagramUrl: string; facebookUrl: string; heroTitle: string; heroDescription: string; heroPrimaryLabel: string; heroBookingLabel: string; footerDescription: string; processHeading: string; processDescription: string; collectionHeading: string; collectionDescription: string; galleryHeading: string; galleryDescription: string; processPageHeading: string; processPageDescription: string };
export const defaultSiteSettings: SiteSettings = { phoneDisplay: '07545 953546', whatsAppNumber: '447545953546', instagramUrl: '', facebookUrl: '', heroTitle: 'Light, measured.', heroDescription: 'We treat window dressings like architecture. Our advisors measure, craft, and fit every shade exactly to your space.', heroPrimaryLabel: 'Explore the Collection', heroBookingLabel: 'Book a Free Consultation', footerDescription: 'Made-to-measure window dressings crafted with an architectural sensibility. We bring the showroom to your home and ensure flawless execution.', processHeading: 'The Pure Shade Blinds Standard', processDescription: "We believe precision requires presence. That's why we never sell directly online.", collectionHeading: 'The Collection', collectionDescription: 'Explore our curated range of materials and styles. Add your inspirations to your shortlist to discuss during your home consultation.', galleryHeading: 'Our Work', galleryDescription: 'A selection of blinds and shutters we have fitted in homes across the area.', processPageHeading: 'Our Process', processPageDescription: 'We treat window dressings like architecture — measured, crafted, and fitted by hand. Scroll to see how a single window goes from bare glass to a finished, made-to-measure blind.' };

export function useSiteSettings() {
  return useQuery({ queryKey: ['site-settings'], queryFn: async () => {
    const response = await fetch('/api/site-settings');
    if (!response.ok) return defaultSiteSettings;
    return { ...defaultSiteSettings, ...await response.json() } as SiteSettings;
  }, initialData: defaultSiteSettings });
}
