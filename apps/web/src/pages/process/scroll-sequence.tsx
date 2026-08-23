import { RefObject } from 'react';
import { motion, MotionValue } from 'framer-motion';
import { STEPS, SLAT_COUNT } from './steps-data';
import { Slat } from './slat';

interface ScrollSequenceProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  activeStep: number;
  openProgress: MotionValue<number>;
}

/**
 * The pinned, scroll-driven venetian-blind reveal. Height scales with the number of
 * steps so each one gets a full viewport of scroll before the next crossfades in.
 */
export function ScrollSequence({ scrollRef, activeStep, openProgress }: ScrollSequenceProps) {
  return (
    <div ref={scrollRef} style={{ height: `${STEPS.length * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden bg-primary flex flex-col md:flex-row">
        {/* Text column — always fully legible, never covered by the blinds */}
        <div className="relative z-10 order-2 md:order-1 flex items-center md:w-[45%] px-4 md:px-6 md:px-12 py-8 md:py-0">
          <div className="w-full max-w-xl mx-auto md:mx-0">
            <div className="flex items-center gap-3 md:gap-4 mb-6">
              {STEPS.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.title}
                    className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center border transition-all duration-500 ${
                      activeStep === i
                        ? 'bg-white text-primary border-white scale-110'
                        : 'border-white/30 text-white/50'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                );
              })}
            </div>

            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={false}
                animate={{
                  opacity: activeStep === i ? 1 : 0,
                  y: activeStep === i ? 0 : 16,
                }}
                transition={{ duration: 0.5 }}
                className={activeStep === i ? 'block' : 'hidden'}
              >
                <span className="text-xs uppercase tracking-[0.2em] text-white/60 font-medium">
                  Step {i + 1} of {STEPS.length} — {step.duration}
                </span>
                <h2 className="text-2xl md:text-5xl font-serif text-white mt-3 mb-4 md:mb-6">
                  {step.title}
                </h2>
                <p className="text-white/80 font-light leading-relaxed text-sm md:text-lg">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Image + blinds column — the 3D venetian-blind reveal plays over the photo only */}
        <div className="relative order-1 md:order-2 flex-1 md:w-[55%] min-h-[45%] md:min-h-0 overflow-hidden">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: activeStep === i ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <img src={step.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-primary/50" />
            </motion.div>
          ))}

          {/* 3D Venetian blind slats — rotate open on scroll, perspective gives the 3D feel */}
          <div className="absolute inset-0 flex flex-col" style={{ perspective: '600px' }}>
            {Array.from({ length: SLAT_COUNT }).map((_, i) => (
              <Slat key={i} index={i} openProgress={openProgress} />
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hidden md:flex absolute bottom-8 left-[calc(45%-2rem)] text-white/60 text-xs uppercase tracking-widest flex-col items-center gap-2 z-10">
          <span>Scroll</span>
          <motion.div
            className="w-px h-8 bg-white/40"
            animate={{ scaleY: [0.3, 1, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ transformOrigin: 'top' }}
          />
        </div>
      </div>
    </div>
  );
}
