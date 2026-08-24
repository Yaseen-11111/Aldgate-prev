import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export interface QuoteItemJson {
  productId: number;
  productName: string;
  category: string;
}

export const quoteRequestsTable = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  items: jsonb("items").$type<QuoteItemJson[]>().notNull(),
  widthCm: integer("width_cm"),
  dropCm: integer("drop_cm"),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  postcode: text("postcode").notNull(),
  preferredDate: date("preferred_date", { mode: "string" }).notNull(),
  preferredTimeWindow: text("preferred_time_window").notNull(),
  status: text("status").notNull().default("pending"), // pending | contacted | confirmed | measured | completed | cancelled
  adminNotes: text("admin_notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertQuoteRequestSchema = createInsertSchema(
  quoteRequestsTable,
).omit({
  id: true,
  createdAt: true,
  status: true,
});
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type QuoteRequestRow = typeof quoteRequestsTable.$inferSelect;
