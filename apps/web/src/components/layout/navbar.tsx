import { Link, useLocation } from 'wouter';
import { useQuoteStore } from '@/store';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const adminHost = 'admin.pureshadeblinds.co.uk';

export function Navbar() {
  const [location] = useLocation();
  const items = useQuoteStore((state) => state.items);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (window.location.hostname !== adminHost) return;

    void fetch('/api/admin/me', { credentials: 'same-origin' })
      .then((response) => setIsAdmin(response.ok))
      .catch(() => setIsAdmin(false));
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 lg:gap-6">
            <Link href="/" onClick={closeMenu} className="group">
              <span className="font-serif text-xl sm:text-2xl whitespace-nowrap tracking-wide group-hover:text-accent transition-colors">
                Pure Shade Blinds
              </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-4 xl:gap-8 ml-4 xl:ml-8">
              <Link href="/catalog" className={`text-sm font-medium tracking-wide hover:text-accent transition-colors ${location.startsWith('/catalog') ? 'text-accent' : 'text-foreground/80'}`}>
                Collection
              </Link>
              <Link href="/about" className={`text-sm font-medium tracking-wide hover:text-accent transition-colors ${location === '/about' ? 'text-accent' : 'text-foreground/80'}`}>
                Our Process
              </Link>
              <Link href="/gallery" className={`text-sm font-medium tracking-wide hover:text-accent transition-colors ${location === '/gallery' ? 'text-accent' : 'text-foreground/80'}`}>
                Gallery
              </Link>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {isAdmin && (
              <Link href="/admin" className="hidden lg:inline-flex text-sm font-medium tracking-wide text-foreground/80 hover:text-accent transition-colors" onClick={closeMenu}>
                Dashboard
              </Link>
            )}
            <Link href="/checkout" className="hidden lg:inline-flex h-11 items-center  px-4 text-sm font-medium tracking-wide text-primary-foreground bg-[#B46A3C] hover:bg-[#B87A3E] transition-colors" onClick={closeMenu}>
              Book a consultation
            </Link>
            <Link href="/quote" className="group flex items-center gap-2" onClick={closeMenu}>
              <span className="text-sm font-medium tracking-wide hidden xl:inline-block group-hover:text-accent transition-colors">
                Consultation
              </span>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full border border-border group-hover:border-accent group-hover:bg-accent/5 transition-all">
                <span className="text-xs font-medium">{items.length}</span>
              </div>
            </Link>

            <button 
              className="lg:hidden p-2 -mr-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-40 bg-background transition-transform duration-500 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="pt-24 px-6 pb-8 flex flex-col h-full overflow-y-auto">
          <nav className="flex flex-col gap-6 text-2xl font-serif mt-8">
            <Link href="/" className="flex items-center justify-between border-b border-border pb-4" onClick={closeMenu}>
              Home <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link href="/catalog" className="flex items-center justify-between border-b border-border pb-4" onClick={closeMenu}>
              Collection <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link href="/about" className="flex items-center justify-between border-b border-border pb-4" onClick={closeMenu}>
              Our Process <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link href="/gallery" className="flex items-center justify-between border-b border-border pb-4" onClick={closeMenu}>
              Gallery <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link href="/quote" className="flex items-center justify-between border-b border-border pb-4" onClick={closeMenu}>
              Your Consultation ({items.length}) <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            {isAdmin && (
              <Link href="/admin" className="flex items-center justify-between border-b border-border pb-4" onClick={closeMenu}>
                Dashboard <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            )}
          </nav>
          <Link href="/checkout" className="mt-8 h-14 bg-[#B46A3C] hover:bg-[#B87A3E]  text-primary-foreground flex items-center justify-center font-medium tracking-wide" onClick={closeMenu}>Book a free consultation</Link>
        </div>
      </div>
    </>
  );
}
