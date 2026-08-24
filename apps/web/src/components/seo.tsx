import { useEffect } from 'react';
import { useLocation } from 'wouter';

const siteUrl = 'https://pureshadeblinds.co.uk';

const pageMetadata: Array<{ matches: (path: string) => boolean; title: string; description: string }> = [
  { matches: (path) => path === '/', title: 'Pure Shade Blinds | Made-to-measure blinds and shutters', description: 'Made-to-measure blinds and shutters with a free home consultation from Pure Shade Blinds.' },
  { matches: (path) => path === '/catalog' || path.startsWith('/catalog/'), title: 'Blinds & Shutters Collection | Pure Shade Blinds', description: 'Explore made-to-measure roller, venetian and roman blinds, plus plantation shutters.' },
  { matches: (path) => path === '/gallery', title: 'Our Work Gallery | Pure Shade Blinds', description: 'See recent made-to-measure blinds and shutters completed by Pure Shade Blinds.' },
  { matches: (path) => path === '/about', title: 'Our Process | Pure Shade Blinds', description: 'From home consultation to professional fitting, discover the Pure Shade Blinds process.' },
  { matches: (path) => path === '/quote' || path === '/checkout', title: 'Book a Free Consultation | Pure Shade Blinds', description: 'Book a free home consultation for made-to-measure blinds and shutters.' },
];

export function Seo() {
  const [path] = useLocation();
  const metadata = pageMetadata.find((page) => page.matches(path)) ?? pageMetadata[0];
  const canonical = `${siteUrl}${path === '/' ? '/' : path}`;

  useEffect(() => {
    document.title = metadata.title;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', metadata.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
  }, [canonical, metadata]);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: 'Pure Shade Blinds',
    url: siteUrl,
    description: 'Made-to-measure blinds and shutters with home consultations.',
    areaServed: 'United Kingdom',
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
