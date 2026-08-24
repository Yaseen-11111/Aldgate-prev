import { Link } from 'wouter';
import { CheckCircle2 } from 'lucide-react';

/** Final "appointment confirmed" screen shown after a successful submission. */
export function Confirmation() {
  return (
    <div className="container mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center max-w-2xl min-h-[70vh] justify-center">
      <div className="w-20 h-20 bg-secondary flex items-center justify-center rounded-full mb-8 text-accent animate-in zoom-in duration-500">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h1 className="text-4xl md:text-5xl font-serif mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">Appointment Confirmed</h1>
      <p className="text-lg text-foreground/70 font-light mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
        Thank you for choosing Pure Shade Blinds. Your consultation request has been received.
        One of our expert advisors will contact you shortly to confirm your exact appointment time.
      </p>
      <Link href="/" className="inline-flex items-center justify-center h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors tracking-wide font-medium animate-in fade-in duration-700 delay-500 fill-mode-both">
        Return to Homepage
      </Link>
    </div>
  );
}
