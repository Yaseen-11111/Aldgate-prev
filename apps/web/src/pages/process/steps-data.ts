import { Ruler, Home, Scissors, Wrench } from 'lucide-react';

export interface ProcessStep {
  icon: typeof Home;
  title: string;
  duration: string;
  description: string;
  image: string;
}

export const STEPS: ProcessStep[] = [
  {
    icon: Home,
    title: 'Free Home Consultation',
    duration: 'Day 1',
    description:
      "A Pure Shade Blinds advisor visits your home at a time that suits you. We bring physical fabric, timber, and paint samples so every colour and texture can be judged in your own light — not a showroom's.",
    image: '/products/venetian-timber.jpg',
  },
  {
    icon: Ruler,
    title: 'Precision Measuring',
    duration: 'Day 1',
    description:
      'Every window is measured to the millimetre, by hand, accounting for reveals, architraves, and any obstructions. No two windows are ever quite the same — so no two orders are ever a generic size.',
    image: '/products/roman-linen.jpg',
  },
  {
    icon: Scissors,
    title: 'Custom Craft',
    duration: '1–3 Weeks',
    description:
      'Your chosen fabric, slat, or shutter louvre is cut and assembled to order in workshop conditions. Every headrail, chain, and bracket is prepared specifically for your window openings.',
    image: '/products/roller-blackout.jpg',
  },
  {
    icon: Wrench,
    title: 'Expert Fitting',
    duration: 'Fitting Day',
    description:
      'A specialist fitter installs your finished blinds or shutters, checks operation on every window, and walks you through care and adjustment — leaving nothing for you to figure out alone.',
    image: '/products/shutter-plantation.jpg',
  },
];

export const SLAT_COUNT = 10;
