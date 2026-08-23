import { useQuoteStore } from '@/store';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const items = useQuoteStore((state) => state.items);

  return (
    <a
      href={buildWhatsAppUrl(items)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
    >
      <MessageCircle className="w-6 h-6" fill="currentColor" />
    </a>
  );
}
