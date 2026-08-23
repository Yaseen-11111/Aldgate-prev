import { motion, useTransform } from 'framer-motion';

interface SlatProps {
  index: number;
  openProgress: ReturnType<typeof useTransform<number, number>>;
}

/** One venetian-blind slat that rotates open (with a slight per-slat delay) as `openProgress` advances. */
export function Slat({ index, openProgress }: SlatProps) {
  // Stagger each slat's rotation slightly so the blind opens like a real venetian blind,
  // top slat first, cascading down — reinforced with a perspective-based 3D rotateX.
  const delay = index * 0.05;
  const rotateX = useTransform(openProgress, (v) => {
    const local = Math.min(1, Math.max(0, (v - delay) / (1 - delay || 1)));
    return local * 82; // degrees open
  });
  const opacity = useTransform(openProgress, (v) => {
    const local = Math.min(1, Math.max(0, (v - delay) / (1 - delay || 1)));
    return 1 - local * 0.85;
  });

  return (
    <motion.div
      className="flex-1 bg-[#EBE8E3] border-b border-black/10 origin-top"
      style={{
        rotateX,
        opacity,
        transformStyle: 'preserve-3d',
      }}
    />
  );
}
