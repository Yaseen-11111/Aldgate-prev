-- Aldergate Blinds & Shades — database schema + seed data
-- Run against a fresh database:
--   psql $DATABASE_URL -f db/seed.sql
-- Or via npm script (after setting DATABASE_URL in .env):
--   pnpm db:seed

-- ─── Schema ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  category      TEXT        NOT NULL,  -- roller | venetian | roman | shutter
  materials     TEXT        NOT NULL,
  fabric_options TEXT[]     NOT NULL,
  description   TEXT        NOT NULL,
  images        TEXT[]      NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_requests (
  id                   SERIAL PRIMARY KEY,
  items                JSONB   NOT NULL,
  width_cm             INTEGER,
  drop_cm              INTEGER,
  name                 TEXT        NOT NULL,
  phone                TEXT        NOT NULL,
  email                TEXT        NOT NULL,
  postcode             TEXT        NOT NULL,
  preferred_date       DATE        NOT NULL,
  preferred_time_window TEXT       NOT NULL,
  status               TEXT        NOT NULL DEFAULT 'pending',  -- pending | contacted | completed
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Seed data ────────────────────────────────────────────────────────────────

-- Clear existing products before re-seeding
TRUNCATE products RESTART IDENTITY CASCADE;

INSERT INTO products (name, category, materials, fabric_options, description, images) VALUES
-- Roller (3)
(
  'Blackout Roller',
  'roller',
  '100% Polyester Blackout Fabric',
  ARRAY['Charcoal', 'Midnight Navy', 'Warm White'],
  'A sleek, light-eliminating roller blind crafted from premium blackout fabric. Ideal for bedrooms and media rooms where complete darkness is essential.',
  ARRAY['/products/roller-blackout.jpg', '/products/roller-blinds.jpg', '/products/roller-linen.jpg']
),
(
  'Linen Weave Roller',
  'roller',
  'Natural Linen Blend',
  ARRAY['Oatmeal', 'Soft Stone', 'Warm Sand'],
  'Elegant linen-weave roller blind that filters natural light beautifully. A timeless choice for living rooms and dining areas.',
  ARRAY['/products/roller-linen.jpg', '/products/roller-blackout.jpg', '/products/roller-blinds.jpg']
),
(
  'Solar Screen Roller',
  'roller',
  'PVC-coated fibreglass mesh',
  ARRAY['Anthracite', 'Pearl', 'Bronze'],
  'Reduces glare and UV exposure while preserving your view. Perfect for south-facing rooms and home offices.',
  ARRAY['/products/roller-blinds.jpg', '/products/roller-linen.jpg', '/products/roller-blackout.jpg']
),
-- Venetian (3)
(
  'Aluminium Venetian',
  'venetian',
  'Powder-coated aluminium slats',
  ARRAY['Brushed Silver', 'Matte White', 'Graphite'],
  'Precision-engineered aluminium venetian blinds with micro slats for refined light control. Durable, moisture-resistant, and perfect for contemporary interiors.',
  ARRAY['/products/venetian-aluminium.jpg', '/products/venetian-blinds.jpg', '/products/venetian-timber.jpg']
),
(
  'Real Wood Venetian',
  'venetian',
  'FSC-certified basswood',
  ARRAY['Natural Oak', 'Walnut', 'White Ash'],
  'Hand-finished real wood venetian blinds that bring warmth and organic texture to any room. Each slat is individually selected for consistent grain and tone.',
  ARRAY['/products/venetian-timber.jpg', '/products/venetian-aluminium.jpg', '/products/venetian-blinds.jpg']
),
(
  'Faux Wood Venetian',
  'venetian',
  'PVC composite',
  ARRAY['Driftwood', 'Cotton White', 'Slate Grey'],
  'All the warmth of real wood with the practicality of PVC — moisture-resistant and easy to clean. An excellent choice for kitchens and bathrooms.',
  ARRAY['/products/venetian-blinds.jpg', '/products/venetian-timber.jpg', '/products/venetian-aluminium.jpg']
),
-- Roman (3)
(
  'Classic Linen Roman',
  'roman',
  'Belgian linen',
  ARRAY['Natural Ecru', 'Soft Ivory', 'Warm Greige'],
  'Sumptuous Belgian linen roman blinds with a flat-fold profile. Elevates any window with quiet, understated luxury.',
  ARRAY['/products/roman-linen.jpg', '/products/roman-blinds.jpg', '/products/roman-woven.jpg']
),
(
  'Textured Weave Roman',
  'roman',
  'Woven cotton-polyester mix',
  ARRAY['Wheat', 'Sage', 'Dove Grey'],
  'Richly textured woven roman blind with a relaxed, layered fold. Adds depth and character to bedrooms and sitting rooms.',
  ARRAY['/products/roman-woven.jpg', '/products/roman-linen.jpg', '/products/roman-blinds.jpg']
),
(
  'Velvet Roman',
  'roman',
  'Cut velvet, lined with thermal interlining',
  ARRAY['Deep Teal', 'Forest Green', 'Dusty Rose'],
  'Luxurious velvet roman blinds with thermal interlining for added insulation. A statement piece that frames your window in opulence.',
  ARRAY['/products/roman-blinds.jpg', '/products/roman-woven.jpg', '/products/roman-linen.jpg']
),
-- Shutter (3)
(
  'Plantation Shutter',
  'shutter',
  'Engineered hardwood',
  ARRAY['Pure White', 'Chalk', 'Pebble Grey'],
  'Classic plantation shutters with wide louvres for maximum light control and ventilation. Crafted from engineered hardwood for stability and longevity.',
  ARRAY['/products/shutter-plantation.jpg', '/products/shutter-charcoal.jpg', '/products/shutters.jpg']
),
(
  'Charcoal Full-Height Shutter',
  'shutter',
  'Solid MDF, painted finish',
  ARRAY['Charcoal', 'Slate', 'Graphite'],
  'Bold full-height shutters in a deep charcoal palette for a dramatic, architectural look. Pairs beautifully with pale walls and natural flooring.',
  ARRAY['/products/shutter-charcoal.jpg', '/products/shutters.jpg', '/products/shutter-plantation.jpg']
),
(
  'Tier-on-Tier Shutter',
  'shutter',
  'Engineered hardwood, premium lacquered finish',
  ARRAY['Porcelain White', 'Warm Stone', 'Soft Linen'],
  'Tier-on-tier shutters with independently operable upper and lower panels — the ultimate in versatility for privacy and light management.',
  ARRAY['/products/shutters.jpg', '/products/shutter-plantation.jpg', '/products/shutter-charcoal.jpg']
);
