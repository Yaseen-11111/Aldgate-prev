import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

type RecordData = Record<string, any>;
type Preview = { products: RecordData[]; gallery: RecordData[]; requests: RecordData[]; settings: RecordData; audit: RecordData[]; refreshedAt: string | null; importedAt: string | null };
const storePath = resolve(import.meta.dirname, '../../.local/preview-data.json');
const isActiveRequest = (request: RecordData) => !['cancelled', 'completed'].includes(request.status);
function slotConflict(requests: RecordData[], candidate: RecordData) {
  return isActiveRequest(candidate) && requests.some(request => request.id !== candidate.id
    && isActiveRequest(request)
    && request.preferredDate?.slice(0, 10) === candidate.preferredDate?.slice(0, 10)
    && request.preferredTimeWindow === candidate.preferredTimeWindow);
}

const initial = (): Preview => ({ products: [], gallery: [], requests: [], settings: {}, audit: [], refreshedAt: null, importedAt: null });
const sessions = new Set<string>();
const password = process.env.LOCAL_ADMIN_PASSWORD || '7291';

function load(): Preview { try { return JSON.parse(readFileSync(storePath, 'utf8')) as Preview; } catch { return initial(); } }
function save(data: Preview) { mkdirSync(dirname(storePath), { recursive: true }); writeFileSync(storePath, JSON.stringify(data, null, 2)); }
function respond(res: ServerResponse, status: number, value: unknown, headers: Record<string, string> = {}) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers });
  res.end(JSON.stringify(value));
}
async function input(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const buffer = Buffer.concat(chunks);
  if (buffer.length > 26 * 1024 * 1024) throw new Error('File is too large');
  if (req.headers['content-type']?.startsWith('multipart/form-data')) {
    const boundary = req.headers['content-type'].match(/boundary=(.+)/)?.[1];
    if (!boundary) throw new Error('Missing upload boundary');
    const start = buffer.indexOf('\r\n\r\n');
    const end = buffer.indexOf(`\r\n--${boundary}`, start + 4);
    const type = buffer.subarray(0, start).toString().match(/Content-Type:\s*([^\r\n]+)/i)?.[1] || 'application/octet-stream';
    if (start < 0 || end < 0 || !/^(image|video)\//.test(type)) throw new Error('Invalid media file');
    return { src: `data:${type};base64,${buffer.subarray(start + 4, end).toString('base64')}`, type: type.startsWith('video/') ? 'video' : 'image' };
  }
  return buffer.length ? JSON.parse(buffer.toString()) : {};
}
function parseCsv(csv: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let value = ''; let quoted = false;
  for (let i = 0; i < csv.length; i++) { const c = csv[i]; if (c === '"') { if (quoted && csv[i + 1] === '"') { value += '"'; i++; } else quoted = !quoted; } else if (c === ',' && !quoted) { row.push(value); value = ''; } else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && csv[i + 1] === '\n') i++; row.push(value); if (row.some(Boolean)) rows.push(row); row = []; value = ''; } else value += c; }
  row.push(value); if (row.some(Boolean)) rows.push(row);
  if (quoted) throw new Error('Invalid CSV: unclosed quote');
  return rows;
}
const safeEqual = (a: string, b: string) => { const x = Buffer.from(a); const y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
const csvValue = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;

export function localPreviewPlugin(): Plugin {
  return { name: 'local-preview-api', configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const path = new URL(req.url || '/', 'http://127.0.0.1').pathname;
      if (!path.startsWith('/api/')) return next();
      try {
        if (!['127.0.0.1', 'localhost'].includes((req.headers.host || '').split(':')[0])) return respond(res, 403, { error: 'Local preview is available only on this computer' });
        const method = req.method || 'GET'; const data = load();
        const cookie = req.headers.cookie?.match(/(?:^|;\s*)local_preview_session=([^;]+)/)?.[1];
        const authorized = !!cookie && sessions.has(cookie);
        if (path === '/api/local/login' && method === 'POST') { const body = await input(req); if (body.username !== 'admin' || !safeEqual(String(body.password || ''), password)) return respond(res, 401, { error: 'Invalid local sign-in' }); const session = randomBytes(32).toString('hex'); sessions.add(session); return respond(res, 200, { email: 'admin (local preview)' }, { 'set-cookie': `local_preview_session=${session}; HttpOnly; SameSite=Strict; Path=/` }); }
        if (path === '/api/local/logout' && method === 'POST') { if (cookie) sessions.delete(cookie); return respond(res, 200, { ok: true }, { 'set-cookie': 'local_preview_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' }); }
        if (path === '/api/healthz') return respond(res, 200, { status: 'ok' });
        if (path === '/api/site-settings' && method === 'GET') return respond(res, 200, data.settings);
        if (path === '/api/products' && method === 'GET') { const category = new URL(req.url || '/', 'http://127.0.0.1').searchParams.get('category'); return respond(res, 200, category ? data.products.filter(p => p.category === category) : data.products); }
        if (method === 'GET' && /^\/api\/products\/\d+$/.test(path)) { const product = data.products.find(p => p.id === Number(path.split('/').at(-1))); return respond(res, product ? 200 : 404, product || { error: 'Product not found' }); }
        if (path === '/api/gallery' && method === 'GET') return respond(res, 200, data.gallery);
        if (path.startsWith('/api/gallery-media/') && method === 'GET') { const response = await fetch(`https://pureshadeblinds.co.uk${path}`); if (!response.ok) return respond(res, response.status, { error: 'Live gallery media unavailable' }); res.writeHead(200, { 'content-type': response.headers.get('content-type') || 'application/octet-stream' }); return res.end(Buffer.from(await response.arrayBuffer())); }
        if (path === '/api/appointment-availability' && method === 'GET') { const date = new URL(req.url || '/', 'http://127.0.0.1').searchParams.get('date'); return respond(res, 200, { date, unavailableTimeWindows: data.requests.filter(r => r.preferredDate?.slice(0, 10) === date && !['cancelled', 'completed'].includes(r.status)).map(r => r.preferredTimeWindow) }); }
        if (path === '/api/quote-requests' && method === 'POST') {
          const body = await input(req);
          const current = load();
          const id = current.requests.reduce((nextId, request) => Math.max(nextId, request.id + 1), Date.now());
          const entry = { ...body, id, status: 'pending', adminNotes: '', customerMessage: body.customerMessage || '', createdAt: new Date().toISOString(), widthCm: null, dropCm: null };
          if (slotConflict(current.requests, entry)) return respond(res, 409, { error: 'That appointment slot is already taken. Please choose another time.' });
          current.requests.unshift(entry);
          save(current);
          return respond(res, 201, entry);
        }
        if (!authorized) return respond(res, 401, { error: 'Local admin sign-in required' });
        if (path === '/api/admin/me') return respond(res, 200, { email: 'admin (local preview)' });
        if (path === '/api/local/status') return respond(res, 200, { refreshedAt: data.refreshedAt, importedAt: data.importedAt, products: data.products.length, gallery: data.gallery.length, requests: data.requests.length });
        if (path === '/api/admin/quote-requests.csv' && method === 'GET') {
          const heading = ['ID', 'Created', 'Status', 'Name', 'Email', 'Phone', 'Postcode', 'Preferred date', 'Preferred time', 'Products', 'Customer message', 'Admin notes'];
          const rows = data.requests.map(row => [row.id, row.createdAt, row.status, row.name, row.email, row.phone, row.postcode, row.preferredDate, row.preferredTimeWindow, (row.items || []).map((item: RecordData) => item.productName).join('; '), row.customerMessage, row.adminNotes].map(csvValue).join(','));
          res.writeHead(200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename=consultations-local.csv', 'cache-control': 'no-store' });
          return res.end([heading.map(csvValue).join(','), ...rows].join('\r\n'));
        }
        if (path === '/api/local/refresh-public' && method === 'POST') { const [products, gallery, settings] = await Promise.all(['products', 'gallery', 'site-settings'].map(async name => { const response = await fetch(`https://pureshadeblinds.co.uk/api/${name}`); if (!response.ok) throw new Error(`Live ${name} request failed`); return response.json(); })); data.products = products; data.gallery = gallery; data.settings = settings; data.refreshedAt = new Date().toISOString(); save(data); return respond(res, 200, { refreshedAt: data.refreshedAt, products: data.products.length, gallery: data.gallery.length }); }
        if (path === '/api/local/import-consultations' && method === 'POST') { const { csv } = await input(req); if (typeof csv !== 'string' || csv.length > 5_000_000) return respond(res, 400, { error: 'Invalid CSV file' }); const rows = parseCsv(csv); const expected = ['ID', 'Created', 'Status', 'Name', 'Email', 'Phone', 'Postcode', 'Preferred date', 'Preferred time', 'Products', 'Customer message', 'Admin notes']; if (JSON.stringify(rows[0]) !== JSON.stringify(expected)) return respond(res, 400, { error: 'Choose consultations.csv exported from the live admin page.' }); data.requests = rows.slice(1).map(row => ({ id: Number(row[0]), createdAt: row[1], status: row[2], name: row[3], email: row[4], phone: row[5], postcode: row[6], preferredDate: row[7], preferredTimeWindow: row[8], items: row[9].split(';').map((s: string) => s.trim()).filter(Boolean).map((name: string) => { const product = data.products.find(p => p.name === name); return { productId: product?.id || 0, productName: name, category: product?.category || 'roller' }; }), customerMessage: row[10], adminNotes: row[11], widthCm: null, dropCm: null })); data.importedAt = new Date().toISOString(); save(data); return respond(res, 200, { importedAt: data.importedAt, requests: data.requests.length }); }
        if (path === '/api/quote-requests' && method === 'GET') return respond(res, 200, data.requests);
        if (path === '/api/quote-requests/summary') return respond(res, 200, { totalPending: data.requests.filter(r => r.status === 'pending').length, totalThisWeek: data.requests.filter(r => Date.parse(r.createdAt) > Date.now() - 7 * 86400000).length, totalItemsRequested: data.requests.reduce((n, r) => n + (r.items?.length || 0), 0) });
        if (path === '/api/admin/audit-events') return respond(res, 200, data.audit);
        if (path === '/api/admin/site-settings' && method === 'PATCH') { data.settings = { ...data.settings, ...await input(req) }; save(data); return respond(res, 200, data.settings); }
        const collection = path.match(/^\/api\/(products|quote-requests|gallery)\/(\d+)$/); const item = collection && (collection[1] === 'quote-requests' ? data.requests : collection[1] === 'products' ? data.products : data.gallery); const index = item?.findIndex(x => x.id === Number(collection?.[2])) ?? -1;
        if (collection && index >= 0 && method === 'GET') return respond(res, 200, item![index]);
        if (collection?.[1] === 'quote-requests' && method === 'PATCH') {
          const updates = await input(req);
          const current = load();
          const requestIndex = current.requests.findIndex(request => request.id === Number(collection[2]));
          if (requestIndex < 0) return respond(res, 404, { error: 'Consultation not found' });
          const original = current.requests[requestIndex];
          const updated = { ...original, ...updates, id: original.id };
          const changedSlot = original.preferredDate?.slice(0, 10) !== updated.preferredDate?.slice(0, 10)
            || original.preferredTimeWindow !== updated.preferredTimeWindow || !isActiveRequest(original);
          if (changedSlot && slotConflict(current.requests, updated)) {
            return respond(res, 409, { error: 'That appointment slot is already taken. Please choose another time.' });
          }
          current.requests[requestIndex] = updated;
          save(current);
          return respond(res, 200, updated);
        }
        if (collection && index >= 0 && method === 'PATCH') { item![index] = { ...item![index], ...await input(req) }; save(data); return respond(res, 200, item![index]); }
        if (collection && index >= 0 && method === 'DELETE') { item!.splice(index, 1); save(data); res.writeHead(204); return res.end(); }
        if (path === '/api/admin/gallery-media' && method === 'POST') return respond(res, 200, await input(req));
        if (path === '/api/gallery/reorder' && method === 'PATCH') { const { ids } = await input(req); data.gallery.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)); save(data); return respond(res, 200, data.gallery); }
        if ((path === '/api/products' || path === '/api/gallery') && method === 'POST') { const target = path === '/api/products' ? data.products : data.gallery; const entry = { ...await input(req), id: Math.max(0, ...target.map(x => x.id)) + 1, createdAt: new Date().toISOString() }; target.unshift(entry); save(data); return respond(res, 201, entry); }
        return respond(res, 404, { error: 'Local preview endpoint not found' });
      } catch (error) { return respond(res, 500, { error: error instanceof Error ? error.message : 'Local preview error' }); }
    });
  } };
}
