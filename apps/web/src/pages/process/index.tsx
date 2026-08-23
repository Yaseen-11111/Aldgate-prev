import { useRef, useState } from 'react';
import { useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { STEPS } from './steps-data';
import { ProcessHero } from './hero';
import { ScrollSequence } from './scroll-sequence';
import { ProcessDetailGrid } from './detail-grid';
import { ProcessCta } from './cta';

/** "Our Process" page: hero, scroll-driven blind-reveal walkthrough, detail recap, and CTA. */
export default function Process() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  // Blind "open" angle: closed (0deg, slats flat/overlapping) -> fully open (90deg) as you scroll into the section,
  // then it stays open while steps crossfade behind it.
  const openProgress = useTransform(smoothProgress, [0, 0.18], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const stepFloat = Math.min(
      STEPS.length - 1,
      Math.max(0, Math.floor(value * STEPS.length)),
    );
    setActiveStep(stepFloat);
  });

  return (
    <div>
      <ProcessHero />
      <ScrollSequence scrollRef={scrollRef} activeStep={activeStep} openProgress={openProgress} />
      <ProcessDetailGrid />
      <ProcessCta />
    </div>
  );
}
