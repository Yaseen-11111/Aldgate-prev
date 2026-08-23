import type { QuoteItem } from "@workspace/api-client-react";

// UK number 07850 597079 in international format for wa.me links.
export const CONTACT_PHONE_DISPLAY = "07850 597079";
export const CONTACT_WHATSAPP_NUMBER = "447850597079";

const CATEGORY_LABELS: Record<string, string> = {
  roller: "Roller Blind",
  venetian: "Venetian Blind",
  roman: "Roman Blind",
  shutter: "Shutter",
};

export function buildWhatsAppUrl(items: QuoteItem[] = []): string {
  const greeting = "Hi Aldergate, I'd like to enquire about a free home measure & quote.";

  const message =
    items.length > 0
      ? `${greeting}\n\nMy shortlist:\n${items
          .map(
            (item) =>
              `- ${item.productName} (${CATEGORY_LABELS[item.category] ?? item.category})`,
          )
          .join("\n")}`
      : greeting;

  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${CONTACT_WHATSAPP_NUMBER}?${params.toString()}`;
}
