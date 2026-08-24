CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES
('public', '{"phoneDisplay":"07545 953546","whatsAppNumber":"447545953546","instagramUrl":"","facebookUrl":"","heroTitle":"Light, measured.","heroDescription":"We treat window dressings like architecture. Our advisors measure, craft, and fit every shade exactly to your space.","heroPrimaryLabel":"Explore the Collection","heroBookingLabel":"Book a Free Consultation","footerDescription":"Made-to-measure window dressings crafted with an architectural sensibility. We bring the showroom to your home and ensure flawless execution.","processHeading":"The Pure Shade Blinds Standard","processDescription":"We believe precision requires presence. That''s why we never sell directly online.","collectionHeading":"The Collection","collectionDescription":"Explore our curated range of materials and styles. Add your inspirations to your shortlist to discuss during your home consultation.","galleryHeading":"Our Work","galleryDescription":"A selection of blinds and shutters we have fitted in homes across the area.","processPageHeading":"Our Process","processPageDescription":"We treat window dressings like architecture — measured, crafted, and fitted by hand. Scroll to see how a single window goes from bare glass to a finished, made-to-measure blind."}');

ALTER TABLE quote_requests ADD COLUMN customer_message TEXT NOT NULL DEFAULT '';
