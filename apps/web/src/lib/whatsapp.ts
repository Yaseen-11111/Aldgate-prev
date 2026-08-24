import type { QuoteItem } from "@workspace/api-client-react";

// The default WhatsApp number can be changed by an administrator in Website settings.

const CATEGORY_LABELS: Record<string, string> = {
  roller: "Roller Blind",
  venetian: "Venetian Blind",
  roman: "Roman Blind",
  shutter: "Shutter",
};

export function buildWhatsAppUrl(items: QuoteItem[] = [], phoneNumber = "447545953546"): string {
  const greeting = "Hi Pure Shade Blinds, I'd like to enquire about a free home measure & quote.";

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
  return `https://wa.me/${phoneNumber.replace(/\D/g, '')}?${params.toString()}`;
}
