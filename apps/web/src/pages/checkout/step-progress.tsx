import { ChevronRight } from 'lucide-react';

interface StepProgressProps {
  step: 1 | 2;
  onSelectStep: (step: 1) => void;
}

/** Two-step progress indicator for the checkout flow. */
export function StepProgress({ step, onSelectStep }: StepProgressProps) {
  return (
    <div className="flex items-center gap-2 mb-12 text-sm font-medium tracking-wide">
      <button
        onClick={() => onSelectStep(1)}
        className={step === 1 ? 'text-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}
      >
        1. Inspiration Summary
      </button>
      <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
      <span className={step === 2 ? 'text-primary' : 'text-muted-foreground'}>
        2. Booking &amp; Details
      </span>
    </div>
  );
}
