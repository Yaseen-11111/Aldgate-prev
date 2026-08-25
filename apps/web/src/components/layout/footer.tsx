import { Link } from 'wouter';
import { useQuoteStore } from '@/store';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { useSiteSettings } from '@/hooks/use-site-settings';

export function Footer() {
  const items = useQuoteStore((state) => state.items);
  const { data: settings } = useSiteSettings();

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <span className="font-serif text-3xl mb-6 block ">Pure Shade Blinds</span>
            <p className="text-primary-foreground/70 max-w-md font-light leading-relaxed">
              {settings.footerDescription}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium tracking-wider text-sm mb-6 uppercase text-primary-foreground/50">Collection</h4>
            <ul className="space-y-4 font-light text-primary-foreground/80">
              <li><Link href="/catalog?category=roller" className="hover:text-white transition-colors">Roller Blinds</Link></li>
              <li><Link href="/catalog?category=venetian" className="hover:text-white transition-colors">Venetian Blinds</Link></li>
              <li><Link href="/catalog?category=roman" className="hover:text-white transition-colors">Roman Blinds</Link></li>
              <li><Link href="/catalog?category=shutter" className="hover:text-white transition-colors">Plantation Shutters</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium tracking-wider text-sm mb-6 uppercase text-primary-foreground/50">Service</h4>
            <ul className="space-y-4 font-light text-primary-foreground/80">
              <li><Link href="/quote" className="hover:text-white transition-colors">Book Consultation</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Our Process</Link></li>
              <li>
                <a
                  href={buildWhatsAppUrl(items, settings.whatsAppNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Us ({settings.phoneDisplay})
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-primary-foreground/40">
          <p>&copy; {new Date().getFullYear()} Pure Shade Blinds. All rights reserved. Created by Yaseen R</p>
          <div className="flex items-center gap-6">
            {settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground/80">Instagram</a>}
            {settings.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground/80">Facebook</a>}
            <a href="https://admin.pureshadeblinds.co.uk/admin" className="hover:text-primary-foreground/80 transition-colors">Admin Portal</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
