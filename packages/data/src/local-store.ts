import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type ProductRecord = {
  id: number;
  name: string;
  category: string;
  materials: string;
  fabricOptions: string[];
  description: string;
  images: string[];
  createdAt: Date;
};

export type QuoteItemRecord = {
  productId: number;
  productName: string;
  category: string;
};

export type QuoteRequestRecord = {
  id: number;
  items: QuoteItemRecord[];
  widthCm: number | null;
  dropCm: number | null;
  name: string;
  phone: string;
  email: string;
  postcode: string;
  preferredDate: Date;
  preferredTimeWindow: string;
  status: "pending" | "contacted" | "completed";
  createdAt: Date;
};

export type GalleryMediaRecord = {
  src: string;
  type: "image" | "video";
};

export type GalleryItemRecord = {
  id: number;
  media: GalleryMediaRecord[];
  description: string;
  createdAt: Date;
};

type StoreData = {
  products: ProductRecord[];
  quoteRequests: QuoteRequestRecord[];
  gallery: GalleryItemRecord[];
};

type ProductInput = Omit<ProductRecord, "id" | "createdAt">;
type QuoteRequestInput = Omit<QuoteRequestRecord, "id" | "createdAt" | "status">;

const storePath = path.resolve(import.meta.dirname, "..", "..", "..", "data", "store.json");
let storePromise: Promise<StoreData> | null = null;

const seedProducts: ProductInput[] = ([
  ["Chalk Linen Roller", "roller", "100% linen-blend fabric, aluminium headrail", ["Chalk Linen", "Oatmeal", "Soft Grey"], "A softly textured linen roller blind that filters daylight without losing warmth.", ["/products/roller-linen.jpg", "/products/roller-blinds.jpg"]],
  ["Blackout Roller", "roller", "Triple-woven blackout fabric, aluminium headrail", ["Charcoal", "Deep Navy", "Pure White"], "Total light exclusion for bedrooms and media rooms, with a smooth triple-woven fabric.", ["/products/roller-blackout.jpg", "/products/roller-blinds.jpg"]],
  ["Classic Roller", "roller", "Polyester-cotton blend, aluminium headrail", ["Ivory", "Stone", "Slate"], "A durable, easy-care roller blind in a broad range of neutral tones.", ["/products/roller-blinds.jpg"]],
  ["Aluminium Venetian", "venetian", "25mm powder-coated aluminium slats", ["Brushed Silver", "Matte Black", "Warm White"], "Crisp, precise slats for kitchens and bathrooms with full light control.", ["/products/venetian-aluminium.jpg", "/products/venetian-blinds.jpg"]],
  ["Timber Venetian", "venetian", "50mm FSC-certified basswood slats", ["Natural Oak", "Walnut", "Driftwood"], "Wide timber slats bring genuine warmth and grain to a window.", ["/products/venetian-timber.jpg", "/products/venetian-blinds.jpg"]],
  ["Classic Venetian", "venetian", "25mm PVC slats, corded tilt mechanism", ["White", "Cream", "Grey"], "A low-maintenance venetian blind with reliable everyday light control.", ["/products/venetian-blinds.jpg"]],
  ["Woven Roman", "roman", "Natural woven grass-cloth fabric", ["Natural Weave", "Sand", "Espresso"], "A textured roman blind that folds into soft horizontal pleats.", ["/products/roman-woven.jpg", "/products/roman-blinds.jpg"]],
  ["Pure Linen Roman", "roman", "100% linen fabric, cotton lining", ["Chalk", "Dove Grey", "Terracotta"], "Tailored pleats in pure linen, fully lined for light control.", ["/products/roman-linen.jpg", "/products/roman-blinds.jpg"]],
  ["Classic Roman", "roman", "Cotton-blend fabric, blackout lining available", ["Ivory", "Duck Egg", "Heather"], "Timeless folded pleats in an easy-care cotton blend.", ["/products/roman-blinds.jpg"]],
  ["Plantation Shutters", "shutter", "63mm engineered hardwood louvres", ["Pure White", "Soft White", "Ivory"], "Classic plantation-style shutters with sweeping light control.", ["/products/shutter-plantation.jpg", "/products/shutters.jpg"]],
  ["Charcoal Shutters", "shutter", "63mm engineered hardwood louvres, matte lacquer", ["Charcoal", "Graphite", "Espresso"], "A contemporary take on plantation shutters with a durable matte finish.", ["/products/shutter-charcoal.jpg", "/products/shutters.jpg"]],
  ["Café Style Shutters", "shutter", "63mm engineered hardwood louvres, half-height frame", ["Pure White", "Ivory"], "Half-height shutters that balance privacy and daylight.", ["/products/shutters.jpg"]],
] as Array<[string, string, string, string[], string, string[]]>).map(([name, category, materials, fabricOptions, description, images]) => ({
  name,
  category,
  materials,
  fabricOptions,
  description,
  images,
}));

const seedGallery: Array<Pick<GalleryItemRecord, "media" | "description">> = [
  ["i1.jpg", "i2.jpg", "i3.jpg"],
  ["i4.jpg", "i5.jpg", "i6.mov"],
  ["i7.mp4", "i8.jpg", "i9.jpg"],
  ["i10.jpg", "i11.jpg", "i12.jpg"],
  ["i13.jpg", "i14.jpg", "i15.jpg"],
  ["i16.jpg", "i17.jpg", "i18.jpg"],
  ["i19.jpg", "i20.jpg", "i21.jpg"],
  ["i22.jpg", "i23.jpg", "i24.jpg"],
  ["i25.jpg", "i26.jpg", "i27.jpg"],
  ["i28.jpg", "i29.mov", "i30.jpg"],
  ["i31.jpg", "i32.jpg", "i33.mp4"],
].map((files) => ({
  media: files.map((file) => ({
    src: `/work-images/${file}`,
    type: file.endsWith(".mp4") || file.endsWith(".mov") ? "video" as const : "image" as const,
  })),
  description: "",
}));

function createSeedStore(): StoreData {
  const now = new Date();
  return {
    products: seedProducts.map((product, index) => ({
      ...product,
      id: index + 1,
      createdAt: new Date(now.getTime() - index),
    })),
    quoteRequests: [],
    gallery: seedGallery.map((item, index) => ({
      ...item,
      id: index + 1,
      createdAt: new Date(now.getTime() - index),
    })),
  };
}

function reviveStore(value: StoreData): StoreData {
  return {
    products: value.products.map((product) => ({ ...product, createdAt: new Date(product.createdAt) })),
    quoteRequests: value.quoteRequests.map((request) => ({
      ...request,
      createdAt: new Date(request.createdAt),
      preferredDate: new Date(request.preferredDate),
    })),
    gallery: (value.gallery === undefined ? seedGallery : value.gallery).map((item) => {
      const legacyItem = item as GalleryItemRecord & { imageSrc?: string };
      return {
        ...legacyItem,
        media: Array.isArray(legacyItem.media) && legacyItem.media.length > 0
          ? legacyItem.media
          : legacyItem.imageSrc ? [{ src: legacyItem.imageSrc, type: "image" }] : [],
        createdAt: new Date(legacyItem.createdAt),
      };
    }),
  };
}

async function loadStore(): Promise<StoreData> {
  try {
    return reviveStore(JSON.parse(await readFile(storePath, "utf8")) as StoreData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const store = createSeedStore();
    await persist(store);
    return store;
  }
}

async function persist(store: StoreData): Promise<void> {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

async function getStore(): Promise<StoreData> {
  storePromise ??= loadStore();
  return storePromise;
}

export async function listStoredProducts(category?: string): Promise<ProductRecord[]> {
  const { products } = await getStore();
  return products.filter((product) => !category || product.category === category);
}

export async function getStoredProduct(id: number): Promise<ProductRecord | undefined> {
  return (await getStore()).products.find((product) => product.id === id);
}

export async function createStoredProduct(input: ProductInput): Promise<ProductRecord> {
  const store = await getStore();
  const product = { ...input, id: Math.max(0, ...store.products.map((item) => item.id)) + 1, createdAt: new Date() };
  store.products.push(product);
  await persist(store);
  return product;
}

export async function updateStoredProduct(id: number, input: Partial<ProductInput>): Promise<ProductRecord | undefined> {
  const store = await getStore();
  const product = store.products.find((item) => item.id === id);
  if (!product) return undefined;
  Object.assign(product, input);
  await persist(store);
  return product;
}

export async function deleteStoredProduct(id: number): Promise<boolean> {
  const store = await getStore();
  const index = store.products.findIndex((product) => product.id === id);
  if (index < 0) return false;
  store.products.splice(index, 1);
  await persist(store);
  return true;
}

export async function listStoredQuoteRequests(): Promise<QuoteRequestRecord[]> {
  return (await getStore()).quoteRequests;
}

export async function getStoredQuoteRequest(id: number): Promise<QuoteRequestRecord | undefined> {
  return (await getStore()).quoteRequests.find((request) => request.id === id);
}

export async function createStoredQuoteRequest(input: QuoteRequestInput): Promise<QuoteRequestRecord> {
  const store = await getStore();
  const request: QuoteRequestRecord = {
    ...input,
    id: Math.max(0, ...store.quoteRequests.map((item) => item.id)) + 1,
    status: "pending",
    createdAt: new Date(),
  };
  store.quoteRequests.push(request);
  await persist(store);
  return request;
}

export async function updateStoredQuoteRequest(
  id: number,
  input: Partial<Omit<QuoteRequestRecord, "id" | "items" | "createdAt">>,
): Promise<QuoteRequestRecord | undefined> {
  const store = await getStore();
  const request = store.quoteRequests.find((item) => item.id === id);
  if (!request) return undefined;
  Object.assign(request, input);
  await persist(store);
  return request;
}

export async function deleteStoredQuoteRequest(id: number): Promise<boolean> {
  const store = await getStore();
  const index = store.quoteRequests.findIndex((request) => request.id === id);
  if (index < 0) return false;
  store.quoteRequests.splice(index, 1);
  await persist(store);
  return true;
}

export async function listStoredGalleryItems(): Promise<GalleryItemRecord[]> {
  return (await getStore()).gallery;
}

export async function createStoredGalleryItem(input: Pick<GalleryItemRecord, "media" | "description">): Promise<GalleryItemRecord> {
  const store = await getStore();
  const item: GalleryItemRecord = {
    ...input,
    id: Math.max(0, ...store.gallery.map((entry) => entry.id)) + 1,
    createdAt: new Date(),
  };
  store.gallery.push(item);
  await persist(store);
  return item;
}

export async function updateStoredGalleryItem(
  id: number,
  input: Partial<Pick<GalleryItemRecord, "media" | "description">>,
): Promise<GalleryItemRecord | undefined> {
  const store = await getStore();
  const item = store.gallery.find((entry) => entry.id === id);
  if (!item) return undefined;
  Object.assign(item, input);
  await persist(store);
  return item;
}

export async function reorderStoredGalleryItems(ids: number[]): Promise<GalleryItemRecord[] | undefined> {
  const store = await getStore();
  if (ids.length !== store.gallery.length || new Set(ids).size !== ids.length) return undefined;
  const byId = new Map(store.gallery.map((item) => [item.id, item]));
  const ordered = ids.map((id) => byId.get(id));
  if (ordered.some((item) => !item)) return undefined;
  store.gallery = ordered as GalleryItemRecord[];
  await persist(store);
  return store.gallery;
}

export async function deleteStoredGalleryItem(id: number): Promise<boolean> {
  const store = await getStore();
  const index = store.gallery.findIndex((item) => item.id === id);
  if (index < 0) return false;
  store.gallery.splice(index, 1);
  await persist(store);
  return true;
}
