INSERT INTO gallery_items (image_src, media, description, sort_order)
SELECT '/work-images/i1.jpg', '[{"src":"/work-images/i1.jpg","type":"image"},{"src":"/work-images/i2.jpg","type":"image"},{"src":"/work-images/i3.jpg","type":"image"}]', '', 0
WHERE NOT EXISTS (SELECT 1 FROM gallery_items);

INSERT INTO gallery_items (image_src, media, description, sort_order)
SELECT '/work-images/i4.jpg', '[{"src":"/work-images/i4.jpg","type":"image"},{"src":"/work-images/i5.jpg","type":"image"},{"src":"/work-images/i6.mov","type":"video"}]', '', 1
WHERE NOT EXISTS (SELECT 1 FROM gallery_items WHERE sort_order = 1);

INSERT INTO gallery_items (image_src, media, description, sort_order)
SELECT '/work-images/i7.mp4', '[{"src":"/work-images/i7.mp4","type":"video"},{"src":"/work-images/i8.jpg","type":"image"},{"src":"/work-images/i9.jpg","type":"image"}]', '', 2
WHERE NOT EXISTS (SELECT 1 FROM gallery_items WHERE sort_order = 2);

INSERT INTO gallery_items (image_src, media, description, sort_order)
SELECT '/work-images/i10.jpg', '[{"src":"/work-images/i10.jpg","type":"image"},{"src":"/work-images/i11.jpg","type":"image"},{"src":"/work-images/i12.jpg","type":"image"}]', '', 3
WHERE NOT EXISTS (SELECT 1 FROM gallery_items WHERE sort_order = 3);

INSERT INTO gallery_items (image_src, media, description, sort_order)
SELECT '/work-images/i13.jpg', '[{"src":"/work-images/i13.jpg","type":"image"},{"src":"/work-images/i14.jpg","type":"image"},{"src":"/work-images/i15.jpg","type":"image"}]', '', 4
WHERE NOT EXISTS (SELECT 1 FROM gallery_items WHERE sort_order = 4);

INSERT INTO gallery_items (image_src, media, description, sort_order)
SELECT '/work-images/i16.jpg', '[{"src":"/work-images/i16.jpg","type":"image"},{"src":"/work-images/i17.jpg","type":"image"},{"src":"/work-images/i18.jpg","type":"image"}]', '', 5
WHERE NOT EXISTS (SELECT 1 FROM gallery_items WHERE sort_order = 5);

INSERT INTO gallery_items (image_src, media, description, sort_order)
SELECT '/work-images/i19.jpg', '[{"src":"/work-images/i19.jpg","type":"image"},{"src":"/work-images/i20.jpg","type":"image"},{"src":"/work-images/i21.jpg","type":"image"}]', '', 6
WHERE NOT EXISTS (SELECT 1 FROM gallery_items WHERE sort_order = 6);

INSERT INTO gallery_items (image_src, media, description, sort_order)
SELECT '/work-images/i22.jpg', '[{"src":"/work-images/i22.jpg","type":"image"},{"src":"/work-images/i23.jpg","type":"image"},{"src":"/work-images/i24.jpg","type":"image"}]', '', 7
WHERE NOT EXISTS (SELECT 1 FROM gallery_items WHERE sort_order = 7);

INSERT INTO gallery_items (image_src, media, description, sort_order)
SELECT '/work-images/i25.jpg', '[{"src":"/work-images/i25.jpg","type":"image"},{"src":"/work-images/i26.jpg","type":"image"},{"src":"/work-images/i27.jpg","type":"image"}]', '', 8
WHERE NOT EXISTS (SELECT 1 FROM gallery_items WHERE sort_order = 8);

INSERT INTO gallery_items (image_src, media, description, sort_order)
SELECT '/work-images/i28.jpg', '[{"src":"/work-images/i28.jpg","type":"image"},{"src":"/work-images/i29.mov","type":"video"},{"src":"/work-images/i30.jpg","type":"image"}]', '', 9
WHERE NOT EXISTS (SELECT 1 FROM gallery_items WHERE sort_order = 9);

INSERT INTO gallery_items (image_src, media, description, sort_order)
SELECT '/work-images/i31.jpg', '[{"src":"/work-images/i31.jpg","type":"image"},{"src":"/work-images/i32.jpg","type":"image"},{"src":"/work-images/i33.mp4","type":"video"}]', '', 10
WHERE NOT EXISTS (SELECT 1 FROM gallery_items WHERE sort_order = 10);
