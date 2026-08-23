import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

/** Main product photo with a crossfade transition and a thumbnail strip for extra images. */
export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="relative">
      <div className="aspect-[3/4] md:aspect-square bg-muted relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={images[activeImage] ?? images[0]}
            alt={alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 mt-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`w-16 h-16 md:w-20 md:h-20 shrink-0 overflow-hidden border-2 transition-colors ${
                activeImage === i ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`View photo ${i + 1}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
