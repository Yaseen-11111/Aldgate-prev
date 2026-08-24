import {
  CreateProductBody,
  CreateProductResponse,
  CreateQuoteRequestBody,
  CreateQuoteRequestResponse,
  GetProductResponse,
  GetQuoteRequestResponse,
  GetQuoteRequestSummaryResponse,
  ListProductsQueryParams,
  ListProductsResponse,
  ListQuoteRequestsResponse,
  UpdateProductBody,
  UpdateProductResponse,
  UpdateQuoteRequestBody,
  UpdateQuoteRequestResponse,
} from "@workspace/api-zod";

type D1Meta = { changes?: number; last_row_id?: number | string };
type D1Result<Row> = { results?: Row[]; meta?: D1Meta };
type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  all<Row>(): Promise<D1Result<Row>>;
  first<Row>(): Promise<Row | null>;
  run(): Promise<D1Result<never>>;
};

type R2Object = {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
};

type R2Bucket = {
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<R2Object | null>;
  delete(keys: string | string[]): Promise<void>;
};

type Env = {
  DB: { prepare(query: string): D1Statement };
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** Gallery media object storage. Configure the GALLERY_MEDIA R2 binding in Cloudflare. */
  GALLERY_MEDIA?: R2Bucket;
  /** Server-only Cloudflare Turnstile secret used to verify consultation requests. */
  TURNSTILE_SECRET?: string;
  /** Server-only Resend API key for consultation notification emails. */
  RESEND_API_KEY?: string;
  /** Verified Resend sender, e.g. `Aldgate <enquiries@pureshadeblinds.co.uk>`. */
  RESEND_FROM?: string;
  /** Inbox which receives new consultation notifications. */
  BOOKING_NOTIFICATION_EMAIL?: string;
  /** Cloudflare Access team domain, for example `your-team.cloudflareaccess.com`. */
  CF_ACCESS_TEAM_DOMAIN?: string;
  /** Audience (AUD) copied from the Cloudflare Access application configuration. */
  CF_ACCESS_AUD?: string;
};

type ProductRow = {
  id: number;
  name: string;
  category: string;
  materials: string;
  fabric_options: string;
  description: string;
  images: string;
  created_at: string;
};

type QuoteRequestRow = {
  id: number;
  items: string;
  width_cm: number | null;
  drop_cm: number | null;
  name: string;
  phone: string;
  email: string;
  postcode: string;
  preferred_date: string;
  preferred_time_window: string;
  status: "pending" | "contacted" | "confirmed" | "measured" | "completed" | "cancelled";
  admin_notes: string;
  created_at: string;
};

type GalleryItemRow = {
  id: number;
  image_src: string;
  media: string;
  description: string;
  created_at: string;
};

type GalleryMedia = { src: string; type: "image" | "video" };

type AuditEventRow = {
  id: number;
  actor_email: string;
  action: string;
  target_type: string;
  target_id: number | null;
  created_at: string;
};

const appointmentTimeWindows = ["Morning (9am - 12pm)", "Afternoon (12pm - 4pm)", "Evening (4pm - 7pm)"] as const;
const maxGalleryUploadBytes = 25 * 1024 * 1024;
const galleryMediaPath = "/api/gallery-media/";
const galleryMediaTypes: Record<string, { type: GalleryMedia["type"]; extension: string }> = {
  "image/jpeg": { type: "image", extension: "jpg" },
  "image/png": { type: "image", extension: "png" },
  "image/webp": { type: "image", extension: "webp" },
  "image/gif": { type: "image", extension: "gif" },
  "video/mp4": { type: "video", extension: "mp4" },
  "video/webm": { type: "video", extension: "webm" },
  "video/quicktime": { type: "video", extension: "mov" },
};

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
};

const securityHeaders = {
  "content-security-policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; media-src 'self' blob:; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com; connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com; frame-src https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
};

type AccessIdentity = {
  email: string;
  subject: string;
  expiresAt: number;
};

type AccessJwtHeader = { alg?: string; kid?: string };
type AccessJwtClaims = {
  aud?: string | string[];
  email?: string;
  exp?: number;
  iss?: string;
  nbf?: number;
  sub?: string;
};

type AccessJwk = { alg?: string; kid?: string; kty?: string } & Record<string, unknown>;

type TurnstileVerification = {
  success?: boolean;
  action?: string;
  hostname?: string;
};

let accessJwkCache: { expiresAt: number; keys: AccessJwk[] } | null = null;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders });
}

function error(message: string, status: number): Response {
  return json({ error: message }, status);
}

function csvValue(value: unknown): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function productFromRow(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    materials: row.materials,
    fabricOptions: JSON.parse(row.fabric_options) as string[],
    description: row.description,
    images: JSON.parse(row.images) as string[],
    createdAt: new Date(row.created_at),
  };
}

function quoteRequestFromRow(row: QuoteRequestRow) {
  return {
    id: row.id,
    items: JSON.parse(row.items) as Array<{ productId: number; productName: string; category: string }>,
    widthCm: row.width_cm,
    dropCm: row.drop_cm,
    name: row.name,
    phone: row.phone,
    email: row.email,
    postcode: row.postcode,
    preferredDate: new Date(row.preferred_date),
    preferredTimeWindow: row.preferred_time_window,
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: new Date(row.created_at),
  };
}

function galleryItemFromRow(row: GalleryItemRow) {
  return {
    id: row.id,
    media: JSON.parse(row.media) as GalleryMedia[],
    description: row.description,
    createdAt: new Date(row.created_at),
  };
}

function isGalleryMedia(value: unknown): value is GalleryMedia[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) =>
    typeof item === "object" && item !== null &&
    typeof (item as GalleryMedia).src === "string" && (item as GalleryMedia).src.trim().length > 0 &&
    ((item as GalleryMedia).type === "image" || (item as GalleryMedia).type === "video"),
  );
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function r2GalleryKey(src: string): string | null {
  if (!src.startsWith(galleryMediaPath)) return null;
  const key = src.slice(galleryMediaPath.length);
  return /^gallery\/[a-f0-9-]{36}\.[a-z0-9]+$/.test(key) ? key : null;
}

async function deleteGalleryMedia(env: Env, media: GalleryMedia[]): Promise<void> {
  const keys = media.map((item) => r2GalleryKey(item.src)).filter((key): key is string => key !== null);
  if (keys.length === 0 || !env.GALLERY_MEDIA) return;
  try {
    await env.GALLERY_MEDIA.delete(keys);
  } catch (exception) {
    console.error("Could not remove gallery media from R2", exception);
  }
}

function toBufferSource(value: Uint8Array): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(value);
}

function parseJwtPart<T>(value: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlDecode(value))) as T;
  } catch {
    return null;
  }
}

function cookieValue(request: Request, name: string): string | null {
  const prefix = `${name}=`;
  for (const part of request.headers.get("cookie")?.split(";") ?? []) {
    const value = part.trim();
    if (value.startsWith(prefix)) return value.slice(prefix.length);
  }
  return null;
}

function accessTeamDomain(env: Env): string | null {
  const domain = env.CF_ACCESS_TEAM_DOMAIN?.trim().toLowerCase();
  return domain && /^[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain) ? domain : null;
}

async function accessJwks(env: Env): Promise<AccessJwk[] | null> {
  const domain = accessTeamDomain(env);
  if (!domain) return null;
  if (accessJwkCache && accessJwkCache.expiresAt > Date.now()) return accessJwkCache.keys;

  try {
    const response = await fetch(`https://${domain}/cdn-cgi/access/certs`);
    if (!response.ok) return null;
    const data = await response.json() as { keys?: AccessJwk[] };
    if (!Array.isArray(data.keys) || data.keys.length === 0) return null;
    accessJwkCache = { keys: data.keys, expiresAt: Date.now() + 60 * 60 * 1000 };
    return data.keys;
  } catch {
    return null;
  }
}

/** Validates the signed Cloudflare Access assertion injected by the Access proxy. */
async function accessIdentity(request: Request, env: Env): Promise<AccessIdentity | null> {
  // Access sends the signed header to origins. Browser requests also carry the
  // signed session token as this HttpOnly cookie, which is a safe fallback when
  // a Worker asset router does not forward the assertion header.
  const token = request.headers.get("cf-access-jwt-assertion") ?? cookieValue(request, "CF_Authorization");
  const audience = env.CF_ACCESS_AUD?.trim();
  const domain = accessTeamDomain(env);
  if (!token || !audience || !domain) return null;

  const [encodedHeader, encodedClaims, encodedSignature, ...extra] = token.split(".");
  if (!encodedHeader || !encodedClaims || !encodedSignature || extra.length > 0) return null;

  const header = parseJwtPart<AccessJwtHeader>(encodedHeader);
  const claims = parseJwtPart<AccessJwtClaims>(encodedClaims);
  if (!header || !claims || header.alg !== "RS256" || !header.kid) return null;

  const now = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (
    !audiences.includes(audience) ||
    claims.iss !== `https://${domain}` ||
    typeof claims.exp !== "number" || claims.exp <= now ||
    (typeof claims.nbf === "number" && claims.nbf > now) ||
    typeof claims.email !== "string" || claims.email.length > 254 ||
    typeof claims.sub !== "string" || claims.sub.length === 0
  ) return null;

  const keys = await accessJwks(env);
  const jwk = keys?.find((key) => key.kid === header.kid && key.kty === "RSA" && key.alg === "RS256");
  if (!jwk) return null;

  try {
    // The Worker type package omits the DOM JsonWebKey declaration, while the
    // Web Crypto runtime accepts this standard JWK object.
    const key = await crypto.subtle.importKey("jwk", jwk as never, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      toBufferSource(base64UrlDecode(encodedSignature)),
      new TextEncoder().encode(`${encodedHeader}.${encodedClaims}`),
    );
    return valid ? { email: claims.email.toLowerCase(), subject: claims.sub, expiresAt: claims.exp } : null;
  } catch {
    return null;
  }
}

async function requireAdmin(request: Request, env: Env): Promise<Response | null> {
  if (!env.CF_ACCESS_AUD?.trim()) return error("Worker secret CF_ACCESS_AUD is missing from the active deployment", 503);
  if (!accessTeamDomain(env)) return error("Worker variable CF_ACCESS_TEAM_DOMAIN is missing or invalid in the active deployment", 503);
  if (!(await accessIdentity(request, env))) return error("Admin authentication required", 401);
  return null;
}

async function recordAuditEvent(request: Request, env: Env, action: string, targetType: string, targetId: number | null): Promise<void> {
  const actor = await accessIdentity(request, env);
  if (!actor) return;
  try {
    await env.DB.prepare("INSERT INTO admin_audit_events (actor_email, action, target_type, target_id) VALUES (?, ?, ?, ?)")
      .bind(actor.email, action, targetType, targetId).run();
  } catch (exception) {
    // Do not break an admin change if a deployment reaches this code before its D1 migration.
    console.error("Could not write admin audit event", exception);
  }
}

async function body(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

/**
 * Verifies the one-time Turnstile token before a public consultation is stored.
 * The hostname is checked against the actual hostname serving this request so a
 * token from another site or preview cannot be replayed here.
 */
async function verifyTurnstile(request: Request, env: Env, token: unknown): Promise<Response | null> {
  const secret = env.TURNSTILE_SECRET?.trim();
  if (!secret) {
    console.error("TURNSTILE_SECRET is not configured");
    return error("Booking protection is temporarily unavailable. Please try again shortly.", 503);
  }
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return error("Please complete the security check before confirming your appointment.", 403);
  }

  let result: TurnstileVerification;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: request.headers.get("cf-connecting-ip") ?? "",
      }),
    });
    if (!response.ok) throw new Error(`Turnstile Siteverify returned ${response.status}`);
    result = await response.json() as TurnstileVerification;
  } catch (exception) {
    console.error("Turnstile Siteverify request failed", exception);
    return error("We could not verify the security check. Please try again.", 503);
  }

  const expectedHostname = new URL(request.url).hostname.toLowerCase();
  if (result.success !== true || result.action !== "consultation" || result.hostname?.toLowerCase() !== expectedHostname) {
    return error("The security check was not accepted. Please complete it again.", 403);
  }
  return null;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

/** Sends the business notification after a booking is safely stored in D1. */
async function sendBookingNotification(env: Env, booking: QuoteRequestRow): Promise<void> {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.RESEND_FROM?.trim();
  const recipient = env.BOOKING_NOTIFICATION_EMAIL?.trim();
  if (!apiKey || !from || !recipient) {
    console.warn("Resend notification skipped because RESEND_API_KEY, RESEND_FROM, or BOOKING_NOTIFICATION_EMAIL is missing");
    return;
  }

  const name = escapeHtml(booking.name);
  const email = escapeHtml(booking.email);
  const phone = escapeHtml(booking.phone);
  const postcode = escapeHtml(booking.postcode);
  const date = escapeHtml(booking.preferred_date);
  const timeWindow = escapeHtml(booking.preferred_time_window);
  const dimensions = booking.width_cm && booking.drop_cm ? `${booking.width_cm} cm × ${booking.drop_cm} cm` : "Not supplied";
  const items = (JSON.parse(booking.items) as Array<{ productName: string }>).map((item) => escapeHtml(item.productName)).join(", ") || "No products selected";
  const subject = `New consultation request from ${booking.name}`;
  const text = [
    `New consultation request #${booking.id}`,
    `Name: ${booking.name}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone}`,
    `Postcode: ${booking.postcode}`,
    `Preferred appointment: ${booking.preferred_date}, ${booking.preferred_time_window}`,
    `Dimensions: ${dimensions}`,
    `Products: ${(JSON.parse(booking.items) as Array<{ productName: string }>).map((item) => item.productName).join(", ") || "No products selected"}`,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "user-agent": "Aldgate-Worker/1.0",
        "idempotency-key": `consultation-${booking.id}-owner-notification`,
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: booking.email,
        subject,
        text,
        html: `<h1>New consultation request</h1><p><strong>Customer:</strong> ${name}</p><p><strong>Email:</strong> ${email}<br><strong>Phone:</strong> ${phone}<br><strong>Postcode:</strong> ${postcode}</p><p><strong>Preferred appointment:</strong> ${date}, ${timeWindow}<br><strong>Dimensions:</strong> ${escapeHtml(dimensions)}<br><strong>Products:</strong> ${items}</p>`,
      }),
    });
    if (!response.ok) console.error("Resend notification failed", response.status);
  } catch (exception) {
    console.error("Resend notification request failed", exception);
  }
}

function validId(pathname: string, prefix: string): number | null {
  const match = new RegExp(`^${prefix}/(\\d+)$`).exec(pathname);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: jsonHeaders });

  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method === "GET" && pathname === "/api/healthz") return json({ status: "ok" });

  if (request.method === "GET" && pathname === "/sitemap.xml") {
    const result = await env.DB.prepare("SELECT id FROM products ORDER BY id ASC").all<{ id: number }>();
    const origin = url.origin;
    const pages = ["/", "/catalog", "/about", "/gallery", ...((result.results ?? []).map((product) => `/catalog/${product.id}`))];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((path) => `<url><loc>${origin}${path}</loc></url>`).join("")}</urlset>`;
    return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
  }

  if (request.method === "GET" && pathname === "/api/admin/me") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const identity = await accessIdentity(request, env);
    // `requireAdmin` verifies this first; retaining the fallback prevents leaking data if it changes.
    return identity ? json({ email: identity.email }) : error("Admin authentication required", 401);
  }

  if (request.method === "GET" && pathname === "/api/admin/audit-events") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const result = await env.DB.prepare("SELECT id, actor_email, action, target_type, target_id, created_at FROM admin_audit_events ORDER BY id DESC LIMIT 100")
      .all<AuditEventRow>();
    return json((result.results ?? []).map((event) => ({
      id: event.id,
      actorEmail: event.actor_email,
      action: event.action,
      targetType: event.target_type,
      targetId: event.target_id,
      createdAt: event.created_at,
    })));
  }

  if (request.method === "GET" && pathname === "/api/admin/quote-requests.csv") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const result = await env.DB.prepare("SELECT * FROM quote_requests ORDER BY created_at DESC").all<QuoteRequestRow>();
    const heading = ["ID", "Created", "Status", "Name", "Email", "Phone", "Postcode", "Preferred date", "Preferred time", "Width cm", "Drop cm", "Products", "Admin notes"];
    const rows = (result.results ?? []).map((row) => [
      row.id, row.created_at, row.status, row.name, row.email, row.phone, row.postcode, row.preferred_date,
      row.preferred_time_window, row.width_cm ?? "", row.drop_cm ?? "",
      (JSON.parse(row.items) as Array<{ productName: string }>).map((item) => item.productName).join("; "), row.admin_notes,
    ].map(csvValue).join(","));
    return new Response([heading.map(csvValue).join(","), ...rows].join("\r\n"), {
      headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=consultations.csv" },
    });
  }

  if (pathname === "/api/products" && request.method === "GET") {
    const parsed = ListProductsQueryParams.safeParse({ category: url.searchParams.get("category") ?? undefined });
    if (!parsed.success) return error(parsed.error.message, 400);
    const statement = parsed.data.category
      ? env.DB.prepare("SELECT * FROM products WHERE category = ? ORDER BY created_at DESC").bind(parsed.data.category)
      : env.DB.prepare("SELECT * FROM products ORDER BY created_at DESC");
    const result = await statement.all<ProductRow>();
    return json(ListProductsResponse.parse((result.results ?? []).map(productFromRow)));
  }

  if (pathname === "/api/products" && request.method === "POST") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const parsed = CreateProductBody.safeParse(await body(request));
    if (!parsed.success) return error(parsed.error.message, 400);
    const product = parsed.data;
    const inserted = await env.DB.prepare("INSERT INTO products (name, category, materials, fabric_options, description, images) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(product.name, product.category, product.materials, JSON.stringify(product.fabricOptions), product.description, JSON.stringify(product.images)).run();
    const row = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(inserted.meta?.last_row_id).first<ProductRow>();
    await recordAuditEvent(request, env, "created", "product", row?.id ?? null);
    return row ? json(CreateProductResponse.parse(productFromRow(row)), 201) : error("Product could not be created", 500);
  }

  const productId = validId(pathname, "/api/products");
  if (productId !== null && request.method === "GET") {
    const row = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(productId).first<ProductRow>();
    return row ? json(GetProductResponse.parse(productFromRow(row))) : error("Product not found", 404);
  }
  if (productId !== null && request.method === "PATCH") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const parsed = UpdateProductBody.safeParse(await body(request));
    if (!parsed.success) return error(parsed.error.message, 400);
    const fields = [
      ["name", parsed.data.name], ["category", parsed.data.category], ["materials", parsed.data.materials],
      ["fabric_options", parsed.data.fabricOptions === undefined ? undefined : JSON.stringify(parsed.data.fabricOptions)],
      ["description", parsed.data.description], ["images", parsed.data.images === undefined ? undefined : JSON.stringify(parsed.data.images)],
    ].flatMap(([field, value]) => value === undefined ? [] : [[field, value] as [string, unknown]]);
    if (fields.length === 0) return error("At least one field must be provided", 400);
    const update = `UPDATE products SET ${fields.map(([field]) => `${field} = ?`).join(", ")} WHERE id = ?`;
    const result = await env.DB.prepare(update).bind(...fields.map(([, value]) => value), productId).run();
    if (!result.meta?.changes) return error("Product not found", 404);
    const row = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(productId).first<ProductRow>();
    await recordAuditEvent(request, env, "updated", "product", productId);
    return json(UpdateProductResponse.parse(productFromRow(row!)));
  }
  if (productId !== null && request.method === "DELETE") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const result = await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(productId).run();
    if (result.meta?.changes) await recordAuditEvent(request, env, "deleted", "product", productId);
    return result.meta?.changes ? new Response(null, { status: 204, headers: jsonHeaders }) : error("Product not found", 404);
  }

  if (pathname === "/api/admin/gallery-media" && request.method === "POST") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    if (!env.GALLERY_MEDIA) return error("Gallery media storage is not configured", 503);
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return error("Upload must use multipart form data", 400);
    }
    const file = form.get("file");
    if (!(file instanceof File)) return error("Select an image or video to upload", 400);
    const format = galleryMediaTypes[file.type.toLowerCase()];
    if (!format) return error("Supported files are JPG, PNG, WebP, GIF, MP4, WebM, and MOV", 400);
    if (file.size === 0 || file.size > maxGalleryUploadBytes) return error("Gallery uploads must be smaller than 25 MB", 400);
    const key = `gallery/${crypto.randomUUID()}.${format.extension}`;
    await env.GALLERY_MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
    await recordAuditEvent(request, env, "uploaded", "gallery media", null);
    return json({ src: `${galleryMediaPath}${key}`, type: format.type }, 201);
  }

  if (pathname.startsWith(galleryMediaPath) && request.method === "GET") {
    const key = r2GalleryKey(pathname);
    if (!key) return error("Gallery media not found", 404);
    if (!env.GALLERY_MEDIA) return error("Gallery media storage is not configured", 503);
    const object = await env.GALLERY_MEDIA.get(key);
    if (!object) return error("Gallery media not found", 404);
    return new Response(object.body, {
      headers: {
        "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  }

  if (pathname === "/api/gallery" && request.method === "GET") {
    const result = await env.DB.prepare("SELECT id, image_src, media, description, created_at FROM gallery_items ORDER BY sort_order ASC, id ASC").all<GalleryItemRow>();
    return json((result.results ?? []).map(galleryItemFromRow));
  }

  if (pathname === "/api/gallery" && request.method === "POST") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const input = await body(request);
    const media = input && typeof input === "object" ? (input as { media?: unknown }).media : undefined;
    if (!isGalleryMedia(media)) {
      return error("At least one image or video is required", 400);
    }
    const description = (input as { description?: unknown }).description;
    if (description !== undefined && typeof description !== "string") return error("Description must be text", 400);
    const inserted = await env.DB.prepare("INSERT INTO gallery_items (image_src, media, description, sort_order) VALUES (?, ?, ?, COALESCE((SELECT MAX(sort_order) + 1 FROM gallery_items), 0))")
      .bind(media[0].src, JSON.stringify(media), description ?? "").run();
    const row = await env.DB.prepare("SELECT id, image_src, media, description, created_at FROM gallery_items WHERE id = ?").bind(inserted.meta?.last_row_id).first<GalleryItemRow>();
    await recordAuditEvent(request, env, "created", "gallery item", row?.id ?? null);
    return row ? json(galleryItemFromRow(row), 201) : error("Gallery item could not be created", 500);
  }

  if (pathname === "/api/gallery/reorder" && request.method === "PATCH") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const input = await body(request);
    const ids = input && typeof input === "object" ? (input as { ids?: unknown }).ids : undefined;
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === "number" && Number.isSafeInteger(id) && id > 0) || new Set(ids).size !== ids.length) {
      return error("A complete ordered list of gallery item IDs is required", 400);
    }
    const current = await env.DB.prepare("SELECT id FROM gallery_items").all<{ id: number }>();
    if (ids.length !== (current.results ?? []).length || ids.some((id) => !(current.results ?? []).some((item) => item.id === id))) {
      return error("Gallery item IDs did not match the current gallery", 400);
    }
    if (ids.length > 0) {
      const cases = ids.map((id, index) => `WHEN ${id} THEN ${index}`).join(" ");
      await env.DB.prepare(`UPDATE gallery_items SET sort_order = CASE id ${cases} END WHERE id IN (${ids.join(",")})`).run();
      await recordAuditEvent(request, env, "reordered", "gallery", null);
    }
    const result = await env.DB.prepare("SELECT id, image_src, media, description, created_at FROM gallery_items ORDER BY sort_order ASC, id ASC").all<GalleryItemRow>();
    return json((result.results ?? []).map(galleryItemFromRow));
  }

  const galleryId = validId(pathname, "/api/gallery");
  if (galleryId !== null && request.method === "PATCH") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const input = await body(request);
    if (!input || typeof input !== "object") return error("Invalid gallery item", 400);
    const media = (input as { media?: unknown }).media;
    const description = (input as { description?: unknown }).description;
    if ((media !== undefined && !isGalleryMedia(media)) || (description !== undefined && typeof description !== "string")) return error("Invalid gallery item", 400);
    const existing = await env.DB.prepare("SELECT id, image_src, media, description, created_at FROM gallery_items WHERE id = ?").bind(galleryId).first<GalleryItemRow>();
    if (!existing) return error("Gallery item not found", 404);
    const fields: Array<[string, string]> = [];
    if (isGalleryMedia(media)) {
      fields.push(["image_src", media[0].src], ["media", JSON.stringify(media)]);
    }
    if (typeof description === "string") fields.push(["description", description]);
    if (fields.length === 0) return error("At least one field must be provided", 400);
    const update = `UPDATE gallery_items SET ${fields.map(([field]) => `${field} = ?`).join(", ")} WHERE id = ?`;
    const result = await env.DB.prepare(update).bind(...fields.map(([, value]) => value), galleryId).run();
    if (!result.meta?.changes) return error("Gallery item not found", 404);
    if (isGalleryMedia(media)) {
      const retained = new Set(media.map((item) => item.src));
      await deleteGalleryMedia(env, galleryItemFromRow(existing).media.filter((item) => !retained.has(item.src)));
    }
    const row = await env.DB.prepare("SELECT id, image_src, media, description, created_at FROM gallery_items WHERE id = ?").bind(galleryId).first<GalleryItemRow>();
    await recordAuditEvent(request, env, "updated", "gallery item", galleryId);
    return json(galleryItemFromRow(row!));
  }
  if (galleryId !== null && request.method === "DELETE") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const existing = await env.DB.prepare("SELECT id, image_src, media, description, created_at FROM gallery_items WHERE id = ?").bind(galleryId).first<GalleryItemRow>();
    const result = await env.DB.prepare("DELETE FROM gallery_items WHERE id = ?").bind(galleryId).run();
    if (result.meta?.changes && existing) await deleteGalleryMedia(env, galleryItemFromRow(existing).media);
    if (result.meta?.changes) await recordAuditEvent(request, env, "deleted", "gallery item", galleryId);
    return result.meta?.changes ? new Response(null, { status: 204, headers: jsonHeaders }) : error("Gallery item not found", 404);
  }

  if (pathname === "/api/quote-requests" && request.method === "POST") {
    const requestBody = await body(request);
    const turnstileToken = requestBody && typeof requestBody === "object" ? (requestBody as { turnstileToken?: unknown }).turnstileToken : undefined;
    const turnstileError = await verifyTurnstile(request, env, turnstileToken);
    if (turnstileError) return turnstileError;
    const parsed = CreateQuoteRequestBody.safeParse(requestBody);
    if (!parsed.success) return error(parsed.error.message, 400);
    const input = parsed.data;
    if (!appointmentTimeWindows.includes(input.preferredTimeWindow as (typeof appointmentTimeWindows)[number])) {
      return error("Select a valid appointment time window", 400);
    }
    const date = input.preferredDate.toISOString().slice(0, 10);
    const availability = await env.DB.prepare("SELECT id FROM quote_requests WHERE preferred_date = ? AND preferred_time_window = ? AND status NOT IN ('completed', 'cancelled') LIMIT 1")
      .bind(date, input.preferredTimeWindow).first<{ id: number }>();
    if (availability) return error("That appointment slot has just been taken. Please choose another time.", 409);
    const inserted = await env.DB.prepare("INSERT INTO quote_requests (items, width_cm, drop_cm, name, phone, email, postcode, preferred_date, preferred_time_window) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(JSON.stringify(input.items), input.widthCm ?? null, input.dropCm ?? null, input.name, input.phone, input.email, input.postcode, date, input.preferredTimeWindow).run();
    const row = await env.DB.prepare("SELECT * FROM quote_requests WHERE id = ?").bind(inserted.meta?.last_row_id).first<QuoteRequestRow>();
    if (row) await sendBookingNotification(env, row);
    return row ? json(CreateQuoteRequestResponse.parse(quoteRequestFromRow(row)), 201) : error("Quote request could not be created", 500);
  }

  if (pathname === "/api/appointment-availability" && request.method === "GET") {
    const date = url.searchParams.get("date");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return error("A valid appointment date is required", 400);
    const result = await env.DB.prepare("SELECT preferred_time_window FROM quote_requests WHERE preferred_date = ? AND status NOT IN ('completed', 'cancelled')")
      .bind(date).all<{ preferred_time_window: string }>();
    const unavailableTimeWindows = (result.results ?? [])
      .map((row) => row.preferred_time_window)
      .filter((value): value is (typeof appointmentTimeWindows)[number] => appointmentTimeWindows.includes(value as (typeof appointmentTimeWindows)[number]));
    return json({ date, unavailableTimeWindows });
  }

  if (pathname === "/api/quote-requests" && request.method === "GET") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const result = await env.DB.prepare("SELECT * FROM quote_requests ORDER BY created_at DESC").all<QuoteRequestRow>();
    return json(ListQuoteRequestsResponse.parse((result.results ?? []).map(quoteRequestFromRow)));
  }

  if (pathname === "/api/quote-requests/summary" && request.method === "GET") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const summary = await env.DB.prepare("SELECT SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS totalPending, SUM(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END) AS totalThisWeek, COALESCE(SUM(json_array_length(items)), 0) AS totalItemsRequested FROM quote_requests")
      .first<{ totalPending: number | null; totalThisWeek: number | null; totalItemsRequested: number }>();
    return json(GetQuoteRequestSummaryResponse.parse({ totalPending: summary?.totalPending ?? 0, totalThisWeek: summary?.totalThisWeek ?? 0, totalItemsRequested: summary?.totalItemsRequested ?? 0 }));
  }

  const quoteId = validId(pathname, "/api/quote-requests");
  if (quoteId !== null && request.method === "GET") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const row = await env.DB.prepare("SELECT * FROM quote_requests WHERE id = ?").bind(quoteId).first<QuoteRequestRow>();
    return row ? json(GetQuoteRequestResponse.parse(quoteRequestFromRow(row))) : error("Quote request not found", 404);
  }
  if (quoteId !== null && request.method === "PATCH") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const parsed = UpdateQuoteRequestBody.safeParse(await body(request));
    if (!parsed.success) return error(parsed.error.message, 400);
    const fields = [
      ["name", parsed.data.name], ["phone", parsed.data.phone], ["email", parsed.data.email], ["postcode", parsed.data.postcode],
      ["preferred_date", parsed.data.preferredDate === undefined ? undefined : parsed.data.preferredDate.toISOString().slice(0, 10)],
      ["preferred_time_window", parsed.data.preferredTimeWindow], ["width_cm", parsed.data.widthCm], ["drop_cm", parsed.data.dropCm], ["status", parsed.data.status], ["admin_notes", parsed.data.adminNotes],
    ].flatMap(([field, value]) => value === undefined ? [] : [[field, value] as [string, unknown]]);
    if (fields.length === 0) return error("At least one field must be provided", 400);
    const update = `UPDATE quote_requests SET ${fields.map(([field]) => `${field} = ?`).join(", ")} WHERE id = ?`;
    const result = await env.DB.prepare(update).bind(...fields.map(([, value]) => value), quoteId).run();
    if (!result.meta?.changes) return error("Quote request not found", 404);
    const row = await env.DB.prepare("SELECT * FROM quote_requests WHERE id = ?").bind(quoteId).first<QuoteRequestRow>();
    await recordAuditEvent(request, env, "updated", "consultation", quoteId);
    return json(UpdateQuoteRequestResponse.parse(quoteRequestFromRow(row!)));
  }
  if (quoteId !== null && request.method === "DELETE") {
    const forbidden = await requireAdmin(request, env);
    if (forbidden) return forbidden;
    const result = await env.DB.prepare("DELETE FROM quote_requests WHERE id = ?").bind(quoteId).run();
    if (result.meta?.changes) await recordAuditEvent(request, env, "deleted", "consultation", quoteId);
    return result.meta?.changes ? new Response(null, { status: 204, headers: jsonHeaders }) : error("Quote request not found", 404);
  }

  return error("Not found", 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const pathname = new URL(request.url).pathname;
      const response = pathname.startsWith("/api/") || pathname === "/sitemap.xml"
        ? await handleApi(request, env)
        : await env.ASSETS.fetch(request);
      const headers = new Headers(response.headers);
      for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    } catch (exception) {
      console.error(exception);
      return error("Internal server error", 500);
    }
  },
};
