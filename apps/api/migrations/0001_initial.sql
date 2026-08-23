CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('roller', 'venetian', 'roman', 'shutter')),
  materials TEXT NOT NULL,
  fabric_options TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quote_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  items TEXT NOT NULL,
  width_cm INTEGER,
  drop_cm INTEGER,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  postcode TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time_window TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS quote_requests_status_created_at_idx
  ON quote_requests (status, created_at DESC);

INSERT INTO products (name, category, materials, fabric_options, description, images) VALUES
  ('Chalk Linen Roller', 'roller', '100% linen-blend fabric, aluminium headrail', '["Chalk Linen","Oatmeal","Soft Grey"]', 'A softly textured linen roller blind that filters daylight without losing warmth.', '["/products/roller-linen.jpg","/products/roller-blinds.jpg"]'),
  ('Blackout Roller', 'roller', 'Triple-woven blackout fabric, aluminium headrail', '["Charcoal","Deep Navy","Pure White"]', 'Total light exclusion for bedrooms and media rooms, with a smooth triple-woven fabric.', '["/products/roller-blackout.jpg","/products/roller-blinds.jpg"]'),
  ('Classic Roller', 'roller', 'Polyester-cotton blend, aluminium headrail', '["Ivory","Stone","Slate"]', 'A durable, easy-care roller blind in a broad range of neutral tones.', '["/products/roller-blinds.jpg"]'),
  ('Aluminium Venetian', 'venetian', '25mm powder-coated aluminium slats', '["Brushed Silver","Matte Black","Warm White"]', 'Crisp, precise slats for kitchens and bathrooms with full light control.', '["/products/venetian-aluminium.jpg","/products/venetian-blinds.jpg"]'),
  ('Timber Venetian', 'venetian', '50mm FSC-certified basswood slats', '["Natural Oak","Walnut","Driftwood"]', 'Wide timber slats bring genuine warmth and grain to a window.', '["/products/venetian-timber.jpg","/products/venetian-blinds.jpg"]'),
  ('Classic Venetian', 'venetian', '25mm PVC slats, corded tilt mechanism', '["White","Cream","Grey"]', 'A low-maintenance venetian blind with reliable everyday light control.', '["/products/venetian-blinds.jpg"]'),
  ('Woven Roman', 'roman', 'Natural woven grass-cloth fabric', '["Natural Weave","Sand","Espresso"]', 'A textured roman blind that folds into soft horizontal pleats.', '["/products/roman-woven.jpg","/products/roman-blinds.jpg"]'),
  ('Pure Linen Roman', 'roman', '100% linen fabric, cotton lining', '["Chalk","Dove Grey","Terracotta"]', 'Tailored pleats in pure linen, fully lined for light control.', '["/products/roman-linen.jpg","/products/roman-blinds.jpg"]'),
  ('Classic Roman', 'roman', 'Cotton-blend fabric, blackout lining available', '["Ivory","Duck Egg","Heather"]', 'Timeless folded pleats in an easy-care cotton blend.', '["/products/roman-blinds.jpg"]'),
  ('Plantation Shutters', 'shutter', '63mm engineered hardwood louvres', '["Pure White","Soft White","Ivory"]', 'Classic plantation-style shutters with sweeping light control.', '["/products/shutter-plantation.jpg","/products/shutters.jpg"]'),
  ('Charcoal Shutters', 'shutter', '63mm engineered hardwood louvres, matte lacquer', '["Charcoal","Graphite","Espresso"]', 'A contemporary take on plantation shutters with a durable matte finish.', '["/products/shutter-charcoal.jpg","/products/shutters.jpg"]'),
  ('Café Style Shutters', 'shutter', '63mm engineered hardwood louvres, half-height frame', '["Pure White","Ivory"]', 'Half-height shutters that balance privacy and daylight.', '["/products/shutters.jpg"]');
