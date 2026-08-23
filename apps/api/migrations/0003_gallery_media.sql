ALTER TABLE gallery_items ADD COLUMN media TEXT NOT NULL DEFAULT '[]';

UPDATE gallery_items
SET media = json_array(json_object('src', image_src, 'type', 'image'))
WHERE media = '[]';
